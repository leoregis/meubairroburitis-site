-- Rollback de migrations/20261021200000_funcoes_sem_acesso_anon.sql: devolve
-- as permissões que as quatro funções tinham antes (conferidas em 21/out):
--   {=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}
-- Atenção: volta a deixar as funções executáveis por visitante sem login.
begin;

grant execute on function public.checar_bloqueio_pagamento(text) to public, anon, authenticated, service_role;
grant execute on function public.registrar_tentativa_pagamento(text, boolean) to public, anon, authenticated, service_role;
grant execute on function public.expirar_pedidos_pendentes() to public, anon, authenticated, service_role;
grant execute on function public.is_admin() to public, anon, authenticated, service_role;

commit;
