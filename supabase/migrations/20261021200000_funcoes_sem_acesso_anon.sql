-- 21/out: funções SECURITY DEFINER que estavam executáveis por visitante sem
-- login. As migrations davam grant pro service_role sem revogar o PUBLIC (o
-- padrão do Postgres é EXECUTE pra PUBLIC), e o Supabase ainda dá anon e
-- authenticated por default privileges. Com isso, um anônimo podia chamar
-- registrar_tentativa_pagamento(<ip>, true) e zerar o próprio limite de
-- tentativas do checkout (ou bloquear o IP de outra pessoa), e disparar
-- expirar_pedidos_pendentes() à vontade.
--
-- Quem chama cada uma (conferido em 21/out):
--   checar_bloqueio_pagamento, registrar_tentativa_pagamento: só a edge
--     function criar_pagamento, com a service_role.
--   expirar_pedidos_pendentes: só o pg_cron (roda como postgres, o dono).
--   is_admin: o login e o middleware do admin (authenticated) e as policies
--     de admin, todas "to authenticated" -- anon nunca precisa dela.
--
-- contar_cliques_links_bio continua com anon de propósito: o admin do Guia
-- (meubairro-app, admin/links-bio.vue) chama com a anon key do site.
--
-- Rollback: supabase/manutencao/20261021_funcoes_sem_acesso_anon_rollback.sql

revoke execute on function public.checar_bloqueio_pagamento(text) from public, anon, authenticated;
revoke execute on function public.registrar_tentativa_pagamento(text, boolean) from public, anon, authenticated;
revoke execute on function public.expirar_pedidos_pendentes() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;

grant execute on function public.checar_bloqueio_pagamento(text) to service_role;
grant execute on function public.registrar_tentativa_pagamento(text, boolean) to service_role;
grant execute on function public.expirar_pedidos_pendentes() to service_role;
grant execute on function public.is_admin() to authenticated, service_role;
