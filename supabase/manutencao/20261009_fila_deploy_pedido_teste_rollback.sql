-- Rollback de migrations/20261009120000_fila_deploy_pedido_teste_nao_dispara.sql:
-- volta deploy_fila_solicitar a tratar todo pedido igual (inclusive "teste").
create or replace function public.deploy_fila_solicitar(p_motivo text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v public.deploy_fila;
begin
  update public.deploy_fila f set
    primeiro_pendente_em = case
      when f.solicitado_em is not null and f.solicitado_em > coalesce(f.ultimo_disparo_em, '-infinity')
        then f.primeiro_pendente_em else now() end,
    pedidos_pendentes = case
      when f.solicitado_em is not null and f.solicitado_em > coalesce(f.ultimo_disparo_em, '-infinity')
        then f.pedidos_pendentes + 1 else 1 end,
    solicitado_em = now(),
    ultimo_motivo = left(p_motivo, 200)
  where f.id
  returning * into v;

  insert into public.deploy_fila_log (evento, motivo) values ('pedido', left(p_motivo, 200));
  return to_jsonb(v);
end;
$$;
