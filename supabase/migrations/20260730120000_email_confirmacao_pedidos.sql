-- Rastreio best-effort do envio dos e-mails transacionais pós-pagamento —
-- nulo significa "nunca enviado ou falhou"; o envio nunca bloqueia o
-- processamento do pagamento em si (ver mp_webhook).
alter table public.pedidos
  add column emails_enviados_em timestamptz;
