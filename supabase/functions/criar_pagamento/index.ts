import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";
import { ehHoneypotPreenchido, nomeValido, telefoneValido } from "../_shared/validar-comprador.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 🔍 Qualidade da Integração MP -- payer.first_name/last_name/phone nunca
// eram enviados, apesar de nome/telefone já serem coletados no form.
function dividirNome(nomeCompleto?: string | null) {
  const partes = (nomeCompleto || "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return {};
  return {
    first_name: partes[0],
    last_name: partes.length > 1 ? partes.slice(1).join(" ") : undefined,
  };
}
function dividirTelefone(telefone?: string | null) {
  const digitos = (telefone || "").replace(/\D/g, "");
  const semDDI = digitos.length > 11 && digitos.startsWith("55") ? digitos.slice(2) : digitos;
  if (semDDI.length < 10) return undefined;
  return { area_code: semDDI.slice(0, 2), number: semDDI.slice(2) };
}

interface ItemCarrinho {
  produto_id: string;
  quantidade: number;
}

interface DadosCartao {
  token: string;
  payment_method_id: string;
  installments: number;
  issuer_id?: string;
  device_id?: string;
}

interface Payload {
  itens: ItemCarrinho[];
  comprador: { nome: string; telefone: string; email?: string; empresa?: string };
  metodo: "pix" | "cartao";
  idempotency_key: string;
  cartao?: DadosCartao;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const payload = (await req.json()) as Payload;
    const { itens, comprador, metodo, idempotency_key, cartao } = payload;

    if (!itens?.length || !comprador?.nome || !comprador?.telefone || !idempotency_key) {
      return json({ erro: "Dados do pedido incompletos" }, 400);
    }
    if (metodo !== "pix" && metodo !== "cartao") {
      return json({ erro: "Método de pagamento inválido" }, 400);
    }
    if (metodo === "cartao" && !cartao?.token) {
      return json({ erro: "Token do cartão ausente" }, 400);
    }

    // --- rate limiting (por IP) ---
    const chave = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
    const { data: bloqueadoAte } = await supabase.rpc("checar_bloqueio_pagamento", { p_chave: chave });
    if (bloqueadoAte) {
      const minutos = Math.ceil((new Date(bloqueadoAte).getTime() - Date.now()) / 60000);
      return json({ erro: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).` }, 429);
    }

    // --- anti-spam: honeypot + formato plausível de nome/telefone. Não é
    // validação de negócio (não bloqueia nome incomum de verdade), é filtro
    // de bot -- achado real em produção: pedido com nome "dgfysgdjf sdfege"
    // e telefone "02625480444" (DDD começando em 0 não existe no Brasil).
    // Conta como tentativa falha no rate limit, igual um pagamento recusado,
    // pra bot insistindo repetidas vezes do mesmo IP acabar bloqueado.
    if (
      ehHoneypotPreenchido(comprador.empresa) ||
      !nomeValido(comprador.nome) ||
      !telefoneValido(comprador.telefone)
    ) {
      await supabase.rpc("registrar_tentativa_pagamento", { p_chave: chave, p_sucesso: false });
      return json({ erro: "Não foi possível processar o pedido. Confira os dados e tente novamente." }, 400);
    }

    // --- idempotência: se já existe um pedido com essa chave E o MESMO
    // método, retorna o estado atual em vez de recriar/recobrar (protege
    // contra retry duplicado da mesma tentativa). Se o método for
    // diferente, a chave foi reaproveitada de uma tentativa antiga (bug
    // já corrigido no client, mas mantém essa defesa aqui também) --
    // trata como pedido novo em vez de devolver o status de um pedido
    // completamente diferente (ex: um PIX já pago sendo devolvido como
    // se fosse a resposta de uma tentativa de cartão).
    const { data: pedidoExistente } = await supabase
      .from("pedidos")
      .select("*")
      .eq("idempotency_key", idempotency_key)
      .maybeSingle();

    if (pedidoExistente && pedidoExistente.metodo_pagamento === metodo) {
      return json({ pedido_id: pedidoExistente.id, status: pedidoExistente.status, reaproveitado: true });
    }

    // --- revalida o valor no servidor a partir do catálogo real, nunca confia em preço vindo do client ---
    const produtoIds = itens.map((i) => i.produto_id);
    const { data: produtos, error: erroProdutos } = await supabase
      .from("produtos")
      .select("id, slug, nome, preco_centavos")
      .in("id", produtoIds)
      .eq("ativo", true);

    if (erroProdutos || !produtos || produtos.length !== new Set(produtoIds).size) {
      return json({ erro: "Um ou mais produtos do carrinho não foram encontrados" }, 400);
    }

    const itensComPreco = itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produto_id)!;
      return {
        produto_id: produto.id,
        nome: produto.nome,
        preco_centavos: produto.preco_centavos,
        quantidade: item.quantidade,
      };
    });

    const valorTotalCentavos = itensComPreco.reduce(
      (soma, item) => soma + item.preco_centavos * item.quantidade,
      0,
    );

    if (valorTotalCentavos <= 0) {
      return json({ erro: "Valor do pedido inválido" }, 400);
    }

    // --- cria o pedido como pendente antes de chamar o Mercado Pago ---
    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .insert({
        nome_comprador: comprador.nome,
        telefone_comprador: comprador.telefone,
        email_comprador: comprador.email ?? null,
        itens: itensComPreco,
        valor_total_centavos: valorTotalCentavos,
        metodo_pagamento: metodo,
        status: "pendente",
        idempotency_key,
      })
      .select()
      .single();

    if (erroPedido || !pedido) {
      return json({ erro: "Não foi possível criar o pedido" }, 500);
    }

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      return json({ erro: "Pagamento não configurado" }, 500);
    }

    const corpoBase = {
      transaction_amount: valorTotalCentavos / 100,
      description: `Pedido ${pedido.id} — Meu Bairro Buritis`,
      external_reference: pedido.id,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp_webhook`,
      payer: {
        email: comprador.email || "checkout@meubairroburitis.com.br",
        ...dividirNome(comprador.nome),
        ...(dividirTelefone(comprador.telefone) ? { phone: dividirTelefone(comprador.telefone) } : {}),
      },
      // 🔍 Qualidade da Integração MP -- additional_info.items nunca era
      // enviado, apesar do dado já estar pronto em itensComPreco (só
      // faltava o .map() pro formato que o MP espera).
      additional_info: {
        items: itensComPreco.map((item) => ({
          id: item.produto_id,
          title: item.nome,
          description: item.nome,
          category_id: "services",
          quantity: item.quantidade,
          unit_price: item.preco_centavos / 100,
        })),
      },
    };

    const corpoMp = metodo === "pix"
      ? { ...corpoBase, payment_method_id: "pix" }
      : {
        ...corpoBase,
        token: cartao!.token,
        payment_method_id: cartao!.payment_method_id,
        installments: cartao!.installments,
        issuer_id: cartao!.issuer_id,
        // 🔍 Qualidade da Integração MP -- aparece na fatura do cliente,
        // reduz contestação por "não reconheço essa cobrança". Só
        // cartão (PIX não aparece em fatura de cartão). Fixo,
        // institucional, dentro do limite de 22 caracteres (16).
        statement_descriptor: "MEUBAIRROBURITIS",
      };

    const respostaMp = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`,
        // chave estável por pedido — não um random novo a cada tentativa,
        // pra retries do client não gerarem cobranças duplicadas no MP.
        "X-Idempotency-Key": idempotency_key,
        // 🔍 Qualidade da Integração MP -- device fingerprint do
        // security.js, sinal mais destacado pela documentação oficial
        // pra reduzir cc_rejected_high_risk (só existe pra cartão --
        // gerado pelo Brick; PIX não passa por device fingerprint).
        ...(cartao?.device_id ? { "X-meli-session-id": cartao.device_id } : {}),
      },
      body: JSON.stringify(corpoMp),
    });

    const dadosMp = await respostaMp.json();

    if (!respostaMp.ok) {
      await supabase.rpc("registrar_tentativa_pagamento", { p_chave: chave, p_sucesso: false });
      await supabase.from("pedidos").update({ status: "recusado" }).eq("id", pedido.id);
      return json({ erro: "Pagamento recusado pelo Mercado Pago", detalhe: dadosMp }, 402);
    }

    await supabase.rpc("registrar_tentativa_pagamento", { p_chave: chave, p_sucesso: true });
    await supabase.from("pedidos").update({ mp_payment_id: String(dadosMp.id) }).eq("id", pedido.id);

    if (metodo === "pix") {
      const dadosPix = dadosMp.point_of_interaction?.transaction_data;
      return json({
        pedido_id: pedido.id,
        status: dadosMp.status,
        qr_code: dadosPix?.qr_code,
        qr_code_base64: dadosPix?.qr_code_base64,
      });
    }

    // cartão: MP responde de forma síncrona com approved/rejected/in_process —
    // o webhook confirma/atualiza de qualquer forma, isso só agiliza a UI.
    if (dadosMp.status === "approved") {
      await supabase.from("pedidos").update({ status: "pago", pago_em: new Date().toISOString() }).eq(
        "id",
        pedido.id,
      );
    } else if (dadosMp.status === "rejected") {
      await supabase.from("pedidos").update({ status: "recusado" }).eq("id", pedido.id);
    }

    return json({ pedido_id: pedido.id, status: dadosMp.status });
  } catch (e) {
    console.error("criar_pagamento erro:", e);
    return json({ erro: "Erro inesperado ao processar o pagamento" }, 500);
  }
});
