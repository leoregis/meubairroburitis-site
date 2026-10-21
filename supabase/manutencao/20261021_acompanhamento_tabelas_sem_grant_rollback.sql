-- Rollback de migrations/20261021230000_acompanhamento_tabelas_sem_grant.sql:
-- devolve os grants padrão do Supabase às três tabelas (o RLS continua barrando).
begin;

grant all on table public.acompanhamento_pedidos, public.acompanhamento_links, public.acompanhamento_acessos
  to anon, authenticated;

commit;
