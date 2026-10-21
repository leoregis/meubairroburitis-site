-- Rollback de migrations/20261021210000_funcoes_novas_sem_acesso_padrao.sql:
-- função nova volta a nascer executável por PUBLIC, anon e authenticated.
-- Não mexe nas funções criadas enquanto o padrão novo valeu (essas mantêm os
-- grants explícitos das próprias migrations).
begin;

alter default privileges for role postgres grant execute on functions to public;
alter default privileges for role postgres in schema public grant execute on functions to anon, authenticated;

commit;
