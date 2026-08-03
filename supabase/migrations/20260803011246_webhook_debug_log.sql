-- diagnostico temporario: investigar por que o broadcast de realtime do
-- mp_webhook nao esta atualizando a tela /pedido/[id] automaticamente com
-- um pagamento PIX real (funcionou num teste simulado, nao com o webhook
-- de verdade). Sem acesso aos logs brutos da edge function via CLI nesta
-- versao, grava os pontos-chave da execucao aqui pra poder consultar
-- direto via SQL. Remover depois que o bug for confirmado e corrigido.
create table if not exists public.webhook_debug_log (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  payment_id text,
  pedido_id text,
  etapa text not null,
  detalhe jsonb
);

alter table public.webhook_debug_log enable row level security;
-- sem nenhuma policy pra anon/authenticated -- so service_role (edge
-- function) escreve, e eu consulto via supabase db query (bypassa RLS).
