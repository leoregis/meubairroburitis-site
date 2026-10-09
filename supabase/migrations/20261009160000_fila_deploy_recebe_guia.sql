-- 09/out/2026 (build incremental, etapa 4): o Guia entra na fila do site.
--
-- Antes, o Guia disparava o deploy.yml sozinho (edge function
-- disparar_deploy_site_automatico do meubairro-app, cron a cada 15 min):
-- duas filas, sem período de calma comum, e o pedido do Guia sem itens
-- (sempre build completo). Agora a função do Guia chama esta RPC (API REST do
-- site, chave anônima + segredo compartilhado) com os itens -- empresa ou
-- prestador, ação, id, slug --, que entram em deploy_fila_itens com
-- origem 'guia' e viram um pedido normal da fila (deploy_fila_solicitar):
-- mesmos 3 min de calma, um disparo só pra tudo o que mudou.
--
-- Segredo: vault 'deploy_fila_guia_secret' (aqui) = segredo
-- DEPLOY_FILA_SITE_SECRET da edge function do Guia. Comparado no banco,
-- nunca devolvido.
--
-- Rollback: manutencao/20261009_fila_deploy_recebe_guia_rollback.sql

create function public.deploy_fila_receber_guia(p_segredo text, p_itens jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_item jsonb;
  v_qtd int := 0;
  v_resumo text := '';
begin
  if coalesce(p_segredo, '') = '' or not exists (
    select 1 from vault.decrypted_secrets
    where name = 'deploy_fila_guia_secret' and decrypted_secret = p_segredo
  ) then
    raise exception 'nao autorizado' using errcode = '42501';
  end if;

  if jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    return jsonb_build_object('ok', true, 'itens', 0);
  end if;
  if jsonb_array_length(p_itens) > 500 then
    raise exception 'itens demais (%)', jsonb_array_length(p_itens);
  end if;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    if v_item ->> 't' not in ('empresa', 'prestador')
       or v_item ->> 'a' not in ('nova', 'editada', 'removida')
       or coalesce(v_item ->> 'id', '') = '' then
      raise exception 'item invalido: %', left(v_item::text, 200);
    end if;
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, categoria, origem)
    values (v_item ->> 't', v_item ->> 'a', left(v_item ->> 'id', 40), left(v_item ->> 's', 300),
            left(v_item ->> 'n', 300), 'guia');
    v_qtd := v_qtd + 1;
    if v_qtd <= 3 then
      v_resumo := v_resumo || case when v_qtd > 1 then ', ' else '' end
                  || (v_item ->> 't') || ' ' || coalesce(v_item ->> 's', v_item ->> 'id') || ' ' || (v_item ->> 'a');
    end if;
  end loop;

  perform public.deploy_fila_solicitar(left('guia: ' || v_resumo || case when v_qtd > 3 then ' (+' || (v_qtd - 3) || ')' else '' end, 200));
  return jsonb_build_object('ok', true, 'itens', v_qtd);
end;
$$;

-- a chamada vem do Guia pela API REST com a chave anônima do site; quem
-- protege é o segredo (sem ele, a função recusa antes de tocar em qualquer
-- tabela)
revoke all on function public.deploy_fila_receber_guia(text, jsonb) from public;
grant execute on function public.deploy_fila_receber_guia(text, jsonb) to anon, service_role;

-- o item do Guia leva o NOME da empresa no campo "categoria" (n): a página
-- de uma unidade mostra se ela é filial, então desativar uma unidade muda as
-- outras da mesma empresa -- rotas-afetadas.mjs usa o nome pra achá-las
-- mesmo quando a unidade já não está mais ativa. A entrega ao disparo passa
-- a mandar esse campo como "n" nos itens do Guia.
create or replace function public.deploy_fila_itens_para_disparo(p_ate timestamptz)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(jsonb_agg(u.item order by u.primeiro), '[]'::jsonb)
  from (
    select jsonb_strip_nulls(case when i.origem = 'guia'
             then jsonb_build_object('t', i.tipo, 'a', i.acao, 'id', i.ref_id, 's', i.slug, 'n', i.categoria, 'o', i.origem)
             else jsonb_build_object('t', i.tipo, 'a', i.acao, 'id', i.ref_id, 's', i.slug, 'sa', i.slug_antigo,
                                     'c', i.categoria, 'ca', i.categoria_antiga, 'o', i.origem)
           end) as item,
           min(i.id) as primeiro
    from public.deploy_fila_itens i
    where i.atendido_em is null and i.em <= p_ate
    group by 1
  ) u;
$$;
