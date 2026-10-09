-- Rollback de migrations/20261009160000_fila_deploy_recebe_guia.sql: tira a
-- RPC que recebe os itens do Guia e devolve deploy_fila_itens_para_disparo à
-- versão da 20261009140000. Antes de rodar, voltar a edge function
-- disparar_deploy_site_automatico do Guia pra versão que dispara o GitHub
-- direto (senão os pedidos do Guia passam a falhar).
-- O segredo 'deploy_fila_guia_secret' fica no vault (inofensivo sem a função).
begin;

drop function if exists public.deploy_fila_receber_guia(text, jsonb);

create or replace function public.deploy_fila_itens_para_disparo(p_ate timestamptz)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(jsonb_agg(u.item order by u.primeiro), '[]'::jsonb)
  from (
    select jsonb_strip_nulls(jsonb_build_object(
             't', i.tipo, 'a', i.acao, 'id', i.ref_id, 's', i.slug, 'sa', i.slug_antigo,
             'c', i.categoria, 'ca', i.categoria_antiga, 'o', i.origem)) as item,
           min(i.id) as primeiro
    from public.deploy_fila_itens i
    where i.atendido_em is null and i.em <= p_ate
    group by 1
  ) u;
$$;

commit;
