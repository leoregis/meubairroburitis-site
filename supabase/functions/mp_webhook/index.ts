import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";
import { enviarEmailsConfirmacao } from "../_shared/enviar-email.ts";

function compararEmTempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

async function assinaturaValida(req: Request, dataId: string): Promise<boolean> {
  const segredo = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!segredo) return false;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => p.trim().split("=").map((s) => s.trim())),
  );
  const ts = partes["ts"];
  const v1 = partes["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const chaveCripto = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const assinaturaBuffer = await crypto.subtle.sign("HMAC", chaveCripto, new TextEncoder().encode(manifest));
  const assinaturaHex = Array.from(new Uint8Array(assinaturaBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return compararEmTempoConstante(assinaturaHex, v1);
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body?.data?.id;
    if (!paymentId) return new Response("ok");

    if (!(await assinaturaValida(req, String(paymentId)))) {
      console.warn("mp_webhook: assinatura inválida, ignorando notificação");
      return new Response("assinatura inválida", { status: 401 });
    }

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN")!;
    const respostaMp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });
    if (!respostaMp.ok) {
      console.error(`mp_webhook: consulta do pagamento ${paymentId} no MP falhou (HTTP ${respostaMp.status})`);
      return new Response("ok");
    }
    const pagamento = await respostaMp.json();

    const pedidoId = pagamento.external_reference;
    if (!pedidoId) return new Response("ok");

    const novoStatus = pagamento.status === "approved"
      ? "pago"
      : pagamento.status === "rejected"
      ? "recusado"
      : null;

    if (!novoStatus) return new Response("ok");

    // update atômico e idempotente: só aplica se o pedido ainda estiver
    // pendente — uma segunda entrega do mesmo webhook (ou uma corrida entre
    // duas entregas) não reprocessa nada.
    const { data: atualizado } = await supabase
      .from("pedidos")
      .update({
        status: novoStatus,
        mp_payment_id: String(paymentId),
        pago_em: novoStatus === "pago" ? new Date().toISOString() : null,
      })
      .eq("id", pedidoId)
      .eq("status", "pendente")
      .select()
      .maybeSingle();

    if (!atualizado) {
      console.log(`mp_webhook: pedido ${pedidoId} já processado ou não encontrado, ignorando`);
      return new Response("ok");
    }

    // 📡 avisa a tela /pedido/[id] em tempo real (se estiver aberta) --
    // broadcast num canal escopado pelo id do pedido, não a tabela
    // `pedidos` inteira: RLS só permite SELECT pra admin autenticado, então
    // uma inscrição via postgres_changes com a anon key nunca receberia
    // nada. Broadcast não depende de RLS de tabela, só de quem já conhece
    // o id do pedido (o próprio comprador, pela URL que ele já tem aberta).
    try {
      await supabase.channel(`pedido:${pedidoId}`).send({
        type: "broadcast",
        event: "status_atualizado",
        payload: { status: novoStatus },
      });
    } catch (erroBroadcast) {
      console.error(`mp_webhook: falha ao avisar via realtime o pedido ${pedidoId}:`, erroBroadcast);
    }

    // e-mails de confirmação são best-effort: nunca podem impedir o
    // pagamento de já ter sido gravado acima. Falha aqui só é logada +
    // registrada num timestamp nulo em `pedidos`, não propaga erro.
    if (novoStatus === "pago") {
      const resultadoEmail = await enviarEmailsConfirmacao(atualizado);
      if (resultadoEmail.sucesso) {
        await supabase
          .from("pedidos")
          .update({ emails_enviados_em: new Date().toISOString() })
          .eq("id", pedidoId);
      } else {
        console.error(`mp_webhook: falha ao enviar e-mails do pedido ${pedidoId}:`, resultadoEmail.erro);
      }
    }

    return new Response("ok");
  } catch (e) {
    console.error("mp_webhook erro:", e);
    return new Response("ok"); // sempre 2xx pro MP não ficar reentregando em loop por erro nosso
  }
});
