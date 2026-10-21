-- 21/out: as tabelas do acompanhamento (20261021220000) só são lidas e gravadas
-- pelas funções SECURITY DEFINER. Em produção o padrão do Supabase dá
-- SELECT/INSERT/UPDATE/DELETE em tabela nova do public para anon e
-- authenticated; o RLS (ligado, sem política) já barra, e isto tira também o
-- grant -- segunda camada, e o mesmo comportamento do branch de dev.
-- Rollback: supabase/manutencao/20261021_acompanhamento_tabelas_sem_grant_rollback.sql

revoke all on table public.acompanhamento_pedidos, public.acompanhamento_links, public.acompanhamento_acessos
  from anon, authenticated;
