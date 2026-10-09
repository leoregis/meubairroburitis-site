-- Rollback de migrations/20261009180000_apagar_webhook_debug_log.sql:
-- recria a tabela como em 20260803011246 (RLS ligado, sem policies). As
-- linhas antigas estão no backup JSON do meubairro-app
-- (supabase/backups/site/20261009_webhook_debug_log.json); pra reimportar:
--   insert into public.webhook_debug_log
--   select * from jsonb_populate_recordset(null::public.webhook_debug_log, '<conteúdo do JSON>'::jsonb);
-- O mp_webhook atual não grava mais nela.
create table if not exists public.webhook_debug_log (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  payment_id text,
  pedido_id text,
  etapa text not null,
  detalhe jsonb
);
alter table public.webhook_debug_log enable row level security;
