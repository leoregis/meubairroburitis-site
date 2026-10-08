-- Rollback de 20261008180000_fila_deploy_com_periodo_de_calma.sql.
-- Depois de rodar: voltar a edge function disparar_deploy pra versão que
-- chama o GitHub direto (git: supabase/functions/disparar_deploy/index.ts
-- antes de 08/out) e apagar a edge function disparar_deploy_fila no painel.
-- pg_net fica instalado (inofensivo); pra remover: drop extension pg_net;
begin;

select cron.unschedule('deploy_fila_processar');

drop function if exists public.deploy_fila_processar();
drop function if exists public.deploy_fila_confere_segredo(text);
drop function if exists public.deploy_fila_falhou(text);
drop function if exists public.deploy_fila_confirmar(timestamptz);
drop function if exists public.deploy_fila_reivindicar();
drop function if exists public.deploy_fila_pronto();
drop function if exists public.deploy_fila_solicitar(text);

delete from vault.secrets where name = 'deploy_fila_cron_secret';

drop table if exists public.deploy_fila_log;
drop table if exists public.deploy_fila;

commit;
