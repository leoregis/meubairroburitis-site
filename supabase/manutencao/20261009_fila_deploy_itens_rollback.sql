-- Rollback de migrations/20261009140000_fila_deploy_itens_estruturados.sql:
-- tira as triggers, as funções e a tabela de itens, e devolve
-- deploy_fila_confirmar à versão da 20261008180000.
begin;

drop trigger if exists trg_deploy_fila_item_noticia on public.noticias;
drop trigger if exists trg_deploy_fila_item_relacionada on public.noticias_relacionadas;
drop trigger if exists trg_deploy_fila_item_produto on public.produtos;
drop trigger if exists trg_deploy_fila_item_categoria on public.noticias_categorias;
drop trigger if exists trg_deploy_fila_item_subcategoria_guia on public.noticias_subcategorias_guia;

drop function if exists public.deploy_fila_item_noticia();
drop function if exists public.deploy_fila_item_relacionada();
drop function if exists public.deploy_fila_item_produto();
drop function if exists public.deploy_fila_item_estrutura();
drop function if exists public.deploy_fila_itens_para_disparo(timestamptz);

create or replace function public.deploy_fila_confirmar(p_reivindicado_em timestamptz)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v public.deploy_fila;
begin
  select * into v from public.deploy_fila where id;
  update public.deploy_fila f set
    ultimo_disparo_em = p_reivindicado_em,
    disparo_reivindicado_em = null,
    pedidos_pendentes = case when f.solicitado_em > p_reivindicado_em then 1 else 0 end,
    primeiro_pendente_em = case when f.solicitado_em > p_reivindicado_em then f.solicitado_em else null end
  where f.id;
  insert into public.deploy_fila_log (evento, motivo, detalhe)
  values ('disparo', v.ultimo_motivo, v.pedidos_pendentes || ' pedido(s) agrupado(s)');
  delete from public.deploy_fila_log where em < now() - interval '90 days';
end;
$$;

drop table if exists public.deploy_fila_itens;

commit;
