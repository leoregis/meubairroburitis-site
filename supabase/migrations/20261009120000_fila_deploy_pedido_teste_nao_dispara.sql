-- 09/out/2026: pedido com motivo começando por "teste" (sem diferenciar
-- maiúsculas, espaços à esquerda ignorados) só entra no deploy_fila_log, com
-- evento 'pedido_teste'. A fila (deploy_fila) não muda, então o cron
-- deploy_fila_processar não vê nada pronto e nenhum workflow é disparado.
-- Motivo: em 08/10 um teste da fila ("teste 1/3..3/3") virou um deploy
-- completo real (run 37787231961) sem mudança de conteúdo.
-- O resto é igual à 20261008180000 (e corrige o CRLF que entrou no corpo ao
-- colar no SQL Editor).
-- Testado em 09/10: pedido "teste da fila (Claude, 09/10)" às 15:13:21 UTC
-- entrou como pedido_teste, deploy_fila não mudou, cron 15:14/15:16 sem
-- disparo e nenhum workflow_dispatch no GitHub.
-- Rollback: manutencao/20261009_fila_deploy_pedido_teste_rollback.sql

create or replace function public.deploy_fila_solicitar(p_motivo text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v public.deploy_fila;
begin
  if lower(ltrim(coalesce(p_motivo, ''))) like 'teste%' then
    insert into public.deploy_fila_log (evento, motivo, detalhe)
    values ('pedido_teste', left(p_motivo, 200), 'registrado sem disparar deploy');
    select * into v from public.deploy_fila where id;
    return to_jsonb(v) || jsonb_build_object('teste', true);
  end if;

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
