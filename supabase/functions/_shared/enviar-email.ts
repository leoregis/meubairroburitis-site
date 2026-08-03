interface ItemPedido {
  produto_id: string;
  nome: string;
  preco_centavos: number;
  quantidade: number;
}

interface Pedido {
  id: string;
  nome_comprador: string;
  telefone_comprador: string;
  email_comprador: string | null;
  itens: ItemPedido[];
  valor_total_centavos: number;
  metodo_pagamento: string;
}

function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function linhasItens(itens: ItemPedido[]) {
  return itens
    .map((i) => `<li>${i.quantidade}x ${i.nome} — ${formatarPreco(i.preco_centavos * i.quantidade)}</li>`)
    .join("");
}

// logo tem texto branco (pensado pra fundo escuro/colorido, mesmo arquivo
// usado no header vermelho do site) -- por isso a faixa vermelha atrás
// dele aqui, em vez de jogar direto num fundo branco de e-mail (ficaria
// invisível).
function cabecalhoEmail() {
  return `
    <div style="background:#dd0202; padding:20px; text-align:center;">
      <img
        src="https://meubairroburitis.com.br/logo/logo_mbb_rodape.png"
        alt="Meu Bairro Buritis"
        width="140"
        style="display:inline-block; width:140px; height:auto;"
      />
    </div>
  `;
}

function emailComprador(pedido: Pedido, whatsappNumero: string) {
  const numeroPedido = pedido.id.slice(0, 8);
  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Meu pedido #${numeroPedido} foi confirmado. Segue o material do anúncio (imagem/vídeo/texto):`,
  );
  return {
    to: pedido.email_comprador!,
    subject: `Pagamento confirmado — Pedido #${numeroPedido} — Meu Bairro Buritis`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        ${cabecalhoEmail()}
        <div style="padding: 24px;">
        <h2>Pagamento confirmado!</h2>
        <p>Olá, ${pedido.nome_comprador}. Seu pedido <strong>#${numeroPedido}</strong> foi pago com sucesso.</p>
        <h3>Resumo do pedido</h3>
        <ul>${linhasItens(pedido.itens)}</ul>
        <p><strong>Total: ${formatarPreco(pedido.valor_total_centavos)}</strong></p>
        <h3>Próximo passo</h3>
        <p>Nos envie a imagem, vídeo ou texto que você quer publicar, junto com a data/horário desejados, direto no nosso WhatsApp:</p>
        <p><a href="https://wa.me/${whatsappNumero}?text=${mensagemWhatsapp}" style="display:inline-block;background:#059669;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;">Enviar material no WhatsApp</a></p>
        </div>
      </div>
    `,
  };
}

function emailDono(pedido: Pedido, emailDestino: string, urlAdmin: string) {
  const numeroPedido = pedido.id.slice(0, 8);
  return {
    to: emailDestino,
    subject: `Nova venda — Pedido #${numeroPedido}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        ${cabecalhoEmail()}
        <div style="padding: 24px;">
        <h2>Nova venda confirmada</h2>
        <p><strong>Comprador:</strong> ${pedido.nome_comprador}</p>
        <p><strong>Telefone:</strong> ${pedido.telefone_comprador}</p>
        <p><strong>E-mail:</strong> ${pedido.email_comprador ?? "não informado"}</p>
        <h3>Itens</h3>
        <ul>${linhasItens(pedido.itens)}</ul>
        <p><strong>Total: ${formatarPreco(pedido.valor_total_centavos)}</strong> (${pedido.metodo_pagamento})</p>
        <p><a href="${urlAdmin}">Ver no painel de vendas</a></p>
        </div>
      </div>
    `,
  };
}

/**
 * Envia os dois e-mails transacionais pós-pagamento (comprador + loja) via
 * Resend. Best-effort: nunca lança — quem chama decide o que fazer com o
 * resultado (aqui, `mp_webhook` só loga e grava um timestamp, sem nunca
 * bloquear a confirmação do pagamento em si).
 */
export async function enviarEmailsConfirmacao(pedido: Pedido): Promise<{ sucesso: boolean; erro?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { sucesso: false, erro: "RESEND_API_KEY não configurada" };

  const remetente = Deno.env.get("EMAIL_REMETENTE") || "Meu Bairro Buritis <pedidos@meubairroburitis.com.br>";
  const emailLoja = Deno.env.get("EMAIL_NOTIFICACAO_VENDA") || "contato@meubairroburitis.com.br";
  const whatsappNumero = Deno.env.get("WHATSAPP_NUMERO") || "5531990749082";
  const urlAdmin = `${Deno.env.get("SITE_URL") || "https://meubairroburitis.com.br"}/admin/vendas`;

  const mensagens = [emailDono(pedido, emailLoja, urlAdmin)];
  if (pedido.email_comprador) mensagens.push(emailComprador(pedido, whatsappNumero));

  try {
    const respostas = await Promise.all(
      mensagens.map((msg) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from: remetente, ...msg }),
        }),
      ),
    );

    const falhas = respostas.filter((r) => !r.ok);
    if (falhas.length > 0) {
      const detalhes = await Promise.all(falhas.map((r) => r.text()));
      return { sucesso: false, erro: detalhes.join(" | ") };
    }

    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, erro: String(e) };
  }
}
