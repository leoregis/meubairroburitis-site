// Alerta por e-mail do monitor do bot de moderação (mbb-moderador).
// Reserva do alerta por WhatsApp: quem chama é a edge function moderacao-monitor
// do projeto do Guia, com o segredo compartilhado no cabeçalho x-alerta-segredo.
// Destino FIXO (MODERACAO_ALERTA_EMAIL_PARA, padrão contato@meubairroburitis.com.br):
// a função não aceita destinatário vindo da requisição.
// Usa o RESEND_API_KEY que o site já tem.

const DESTINO_PADRAO = "contato@meubairroburitis.com.br";
const REMETENTE_PADRAO = "Meu Bairro Buritis <pedidos@meubairroburitis.com.br>";

function igual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ erro: "método não permitido" }, 405);
  const segredo = Deno.env.get("MODERACAO_ALERTA_SEGREDO") ?? "";
  if (!igual(req.headers.get("x-alerta-segredo") ?? "", segredo)) return json({ erro: "não autorizado" }, 401);

  let corpo: { assunto?: unknown; texto?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "json inválido" }, 400);
  }
  const assunto = typeof corpo.assunto === "string" ? corpo.assunto.trim().slice(0, 150) : "";
  const texto = typeof corpo.texto === "string" ? corpo.texto.trim().slice(0, 3000) : "";
  if (!assunto || !texto) return json({ erro: "assunto e texto são obrigatórios" }, 400);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return json({ erro: "RESEND_API_KEY não configurada" }, 500);

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_REMETENTE") || REMETENTE_PADRAO,
      to: [Deno.env.get("MODERACAO_ALERTA_EMAIL_PARA") || DESTINO_PADRAO],
      subject: `[Moderador MBB] ${assunto}`,
      text: texto,
    }),
  });
  const resposta = await r.json().catch(() => ({}));
  if (!r.ok) return json({ ok: false, status: r.status, erro: resposta?.message ?? "falha no Resend" }, 502);
  return json({ ok: true, id: resposta?.id ?? null });
});
