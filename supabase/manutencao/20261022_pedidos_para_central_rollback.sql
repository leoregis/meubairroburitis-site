-- Rollback de migrations/20261022100000_pedidos_para_central.sql: pedido pago
-- deixa de gerar o link e de ir para a Central. Volta acompanhamento_receber e
-- acompanhamento_por_link às da 20261021220000.
-- ATENÇÃO: apaga a fila (pedidos_central_fila) e as colunas acompanhamento_token,
-- estornado_em e da_central (os links já gerados pelo site param de abrir; os
-- pedidos criados pelo site no acompanhamento ficam sem link). Em produção:
-- perguntar ao Leo antes (DROP).
begin;

select cron.unschedule('pedidos_central_processar');

drop trigger pedidos_para_central on public.pedidos;
drop trigger pedidos_pago_token on public.pedidos;
drop function public.pedidos_central_processar();
drop function public.pedidos_central_falhou(bigint[], text);
drop function public.pedidos_central_evento(public.pedidos_central_fila);
drop function public.pedido_para_central();
drop function public.acompanhamento_do_pedido_site(public.pedidos);
drop function public.pedido_pago_token();
drop function public.novo_token_acompanhamento();
drop table public.pedidos_central_fila;

create or replace function public.acompanhamento_receber(p_segredo text, p_pedidos jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  p jsonb;
  v_erro text;
  v_chave text;
  v_versao bigint;
  v_token text;
  v_res jsonb := '[]'::jsonb;
begin
  if coalesce(p_segredo, '') = '' or not exists (
    select 1 from vault.decrypted_secrets where name = 'acompanhamento_segredo' and decrypted_secret = p_segredo
  ) then
    raise exception 'segredo inválido' using errcode = '42501';
  end if;
  if jsonb_typeof(p_pedidos) <> 'array' or jsonb_array_length(p_pedidos) > 200 then
    raise exception 'lista inválida (até 200 pedidos)' using errcode = '22023';
  end if;

  for p in select * from jsonb_array_elements(p_pedidos) loop
    v_chave := p ->> 'chave';
    v_versao := nullif(p ->> 'versao', '')::bigint;
    v_erro := public.acompanhamento_conferir(p);
    if v_erro is not null then
      v_res := v_res || jsonb_build_object('chave', v_chave, 'versao', v_versao, 'ok', false, 'erro', v_erro);
      continue;
    end if;

    insert into public.acompanhamento_pedidos as a (chave, versao, ativo, cancelado, em_aberto, encerrado_em, numero, data,
      empresa, telefone_hash, itens, recebido_em)
    values (v_chave, v_versao, (p ->> 'ativo')::boolean, (p ->> 'cancelado')::boolean, (p ->> 'em_aberto')::boolean,
      (p ->> 'encerrado_em')::timestamptz, (p ->> 'numero')::bigint, (p ->> 'data')::date, p ->> 'empresa',
      public.acompanhamento_hash_telefone(p ->> 'telefone'), p -> 'itens', now())
    on conflict (chave) do update set
      versao = excluded.versao, ativo = excluded.ativo, cancelado = excluded.cancelado, em_aberto = excluded.em_aberto,
      encerrado_em = excluded.encerrado_em, numero = excluded.numero, data = excluded.data, empresa = excluded.empresa,
      telefone_hash = excluded.telefone_hash, itens = excluded.itens, recebido_em = now()
    where a.versao <= excluded.versao;

    -- link: o token atual fica; qualquer outro da mesma chave é revogado
    v_token := nullif(p ->> 'token_hash', '');
    if v_token is not null and exists (select 1 from public.acompanhamento_pedidos where chave = v_chave and versao = v_versao) then
      insert into public.acompanhamento_links (token_hash, chave) values (v_token, v_chave)
      on conflict (token_hash) do nothing;
    end if;
    if exists (select 1 from public.acompanhamento_pedidos where chave = v_chave and versao = v_versao) then
      update public.acompanhamento_links set revogado_em = now()
      where chave = v_chave and revogado_em is null and token_hash is distinct from v_token;
    end if;

    v_res := v_res || jsonb_build_object('chave', v_chave, 'versao', v_versao, 'ok', true);
  end loop;

  return jsonb_build_object('resultados', v_res);
end;
$$;

create or replace function public.acompanhamento_por_link(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  l public.acompanhamento_links;
  a public.acompanhamento_pedidos;
  v_origem text;
begin
  if coalesce(p_token, '') !~ '^[A-Za-z0-9_-]{22}$' then
    return jsonb_build_object('encontrado', false);
  end if;
  select * into l from public.acompanhamento_links
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') and revogado_em is null;
  if l.token_hash is null then
    return jsonb_build_object('encontrado', false);
  end if;
  select * into a from public.acompanhamento_pedidos where chave = l.chave;

  update public.acompanhamento_links set acessos = acessos + 1, ultimo_acesso_em = now() where token_hash = l.token_hash;
  v_origem := split_part(coalesce(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', ''), ',', 1);
  insert into public.acompanhamento_acessos (chave, origem_hash)
  values (a.chave, case when v_origem = '' then null else left(encode(extensions.hmac(v_origem,
    (select decrypted_secret from vault.decrypted_secrets where name = 'acompanhamento_pepper'), 'sha256'), 'hex'), 16) end);

  if not a.ativo then
    return jsonb_build_object('encontrado', true, 'disponivel', false);
  end if;
  if a.encerrado_em is not null and a.encerrado_em < now() - interval '90 days' then
    return jsonb_build_object('encontrado', true, 'disponivel', false, 'expirado', true);
  end if;
  return jsonb_build_object(
    'encontrado', true,
    'disponivel', true,
    'numero', a.numero,
    'data', a.data,
    'empresa', a.empresa,
    'cancelado', a.cancelado,
    'em_aberto', a.em_aberto,
    'itens', a.itens,
    'atualizado_em', a.recebido_em);
end;
$$;

alter table public.acompanhamento_pedidos drop column da_central;
drop index public.pedidos_acompanhamento_token_uidx;
alter table public.pedidos drop column acompanhamento_token;
alter table public.pedidos drop column estornado_em;

delete from vault.secrets where name in ('central_pedidos_url', 'central_pedidos_segredo');

commit;
