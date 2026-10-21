-- 21/out (projeto "Meus pedidos", fatia 1 -- aprovado pelo Leo): acompanhamento
-- do pedido pelo cliente. A Central MBB (outro projeto) manda, servidor a
-- servidor, uma PROJEÇÃO MÍNIMA de cada venda com acompanhamento ligado
-- (acompanhamento_receber, com segredo); o cliente abre /pedido/<token> e o site
-- lê daqui (acompanhamento_por_link). O site nunca lê o banco da Central.
--
-- O que chega é uma lista fechada (conferida aqui também, campo a campo):
-- número e data da venda, empresa, cancelado, em aberto, itens (produto,
-- quantidade, quanto falta agendar) e entregas (tipo, situação em código,
-- datas, links públicos das publicações, link do material em aprovação).
-- Nada de valores, observações, motivos ou contatos.
--   * telefone: chega e vira HMAC (segredo no vault); o número não é guardado.
--   * link: só o sha256 do token. Token trocado na Central revoga o anterior.
--
-- Tabelas sem política (RLS ligado): só as funções SECURITY DEFINER abaixo.
-- Funções nascem fechadas (20261021210000): a liberação para anon/authenticated
-- está explícita no fim.
--
-- Rollback: supabase/manutencao/20261021_acompanhamento_pedidos_rollback.sql

-- segredos (só no vault): o da Central (cadastrado também na Edge Function
-- central-acompanhamento, por script, sem aparecer) e o do hash do telefone.
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'acompanhamento_segredo',
  'Segredo que a Central MBB manda em acompanhamento_receber');
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'acompanhamento_pepper',
  'Chave do HMAC do telefone do acompanhamento');

create table public.acompanhamento_pedidos (
  chave text primary key check (chave ~ '^(central|site):[0-9a-f-]{36}$'),
  versao bigint not null check (versao >= 1),
  ativo boolean not null,
  cancelado boolean not null,
  em_aberto boolean not null,
  encerrado_em timestamptz,
  numero bigint,
  data date,
  empresa text check (empresa is null or length(empresa) <= 160),
  telefone_hash text check (telefone_hash is null or telefone_hash ~ '^[0-9a-f]{64}$'),
  itens jsonb not null default '[]'::jsonb,
  recebido_em timestamptz not null default now()
);
create index acompanhamento_pedidos_telefone_idx on public.acompanhamento_pedidos (telefone_hash) where telefone_hash is not null;

create table public.acompanhamento_links (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  chave text not null references public.acompanhamento_pedidos (chave) on delete cascade,
  criado_em timestamptz not null default now(),
  revogado_em timestamptz,
  acessos integer not null default 0,
  ultimo_acesso_em timestamptz
);
create index acompanhamento_links_chave_idx on public.acompanhamento_links (chave);

-- registro de acessos ao link (sem IP: só um hash curto, para ver repetição)
create table public.acompanhamento_acessos (
  id bigint generated always as identity primary key,
  chave text not null,
  em timestamptz not null default now(),
  origem_hash text
);
create index acompanhamento_acessos_em_idx on public.acompanhamento_acessos (em);

alter table public.acompanhamento_pedidos enable row level security;
alter table public.acompanhamento_links enable row level security;
alter table public.acompanhamento_acessos enable row level security;

-- ---------------------------------------------------------------------------
-- telefone: 55 + DDD + 9 dígitos (celular de 8 dígitos ganha o 9)
-- ---------------------------------------------------------------------------
create function public.acompanhamento_normalizar_telefone(p_telefone text)
returns text
language plpgsql
immutable
set search_path to 'public'
as $$
declare
  d text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
begin
  if d ~ '^55\d{10,11}$' then
    d := substr(d, 3);
  end if;
  if d !~ '^[1-9][1-9]\d{8,9}$' then
    return null;
  end if;
  if length(d) = 10 and substr(d, 3, 1) in ('6', '7', '8', '9') then
    d := substr(d, 1, 2) || '9' || substr(d, 3);
  end if;
  return '55' || d;
end;
$$;

create function public.acompanhamento_hash_telefone(p_telefone text)
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select case when public.acompanhamento_normalizar_telefone(p_telefone) is null then null
    else encode(extensions.hmac(public.acompanhamento_normalizar_telefone(p_telefone),
      (select decrypted_secret from vault.decrypted_secrets where name = 'acompanhamento_pepper'), 'sha256'), 'hex') end;
$$;

-- ---------------------------------------------------------------------------
-- conferência da projeção (devolve o erro, ou null se está ok)
-- ---------------------------------------------------------------------------
create function public.acompanhamento_conferir(p jsonb)
returns text
language plpgsql
immutable
set search_path to 'public'
as $$
declare
  i jsonb;
  e jsonb;
  pu jsonb;
  k text;
begin
  if jsonb_typeof(p) <> 'object' then return 'pedido não é objeto'; end if;
  for k in select jsonb_object_keys(p) loop
    if k not in ('chave', 'versao', 'ativo', 'numero', 'data', 'empresa', 'cancelado', 'em_aberto', 'encerrado_em',
                 'telefone', 'token_hash', 'itens') then
      return 'campo não permitido: ' || k;
    end if;
  end loop;
  if coalesce(p ->> 'chave', '') !~ '^(central|site):[0-9a-f-]{36}$' then return 'chave inválida'; end if;
  if jsonb_typeof(p -> 'versao') <> 'number' or (p ->> 'versao')::numeric < 1 then return 'versão inválida'; end if;
  if jsonb_typeof(p -> 'ativo') <> 'boolean' or jsonb_typeof(p -> 'cancelado') <> 'boolean'
     or jsonb_typeof(p -> 'em_aberto') <> 'boolean' then return 'ativo/cancelado/em_aberto inválidos'; end if;
  if length(coalesce(p ->> 'empresa', '')) > 160 then return 'empresa longa'; end if;
  if p ? 'token_hash' and jsonb_typeof(p -> 'token_hash') <> 'null' and coalesce(p ->> 'token_hash', '') !~ '^[0-9a-f]{64}$' then
    return 'token_hash inválido';
  end if;
  if jsonb_typeof(p -> 'itens') <> 'array' or jsonb_array_length(p -> 'itens') > 50 then return 'itens inválidos'; end if;
  for i in select * from jsonb_array_elements(p -> 'itens') loop
    for k in select jsonb_object_keys(i) loop
      if k not in ('produto', 'quantidade', 'a_agendar', 'entregas') then return 'campo de item não permitido: ' || k; end if;
    end loop;
    if length(coalesce(i ->> 'produto', '')) not between 1 and 160 then return 'produto inválido'; end if;
    if jsonb_typeof(i -> 'entregas') <> 'array' or jsonb_array_length(i -> 'entregas') > 300 then return 'entregas inválidas'; end if;
    for e in select * from jsonb_array_elements(i -> 'entregas') loop
      for k in select jsonb_object_keys(e) loop
        if k not in ('tipo', 'quantidade', 'situacao', 'previsto_para', 'com_horario', 'material_recebido_em',
                     'gravacao_para', 'gravacao_com_horario', 'publicado_em', 'publicacoes', 'aprovacao_link') then
          return 'campo de entrega não permitido: ' || k;
        end if;
      end loop;
      if length(coalesce(e ->> 'tipo', '')) not between 1 and 120 then return 'tipo de entrega inválido'; end if;
      if coalesce(e ->> 'situacao', '') not in ('publicada', 'concluida', 'cancelada', 'devolvida', 'aguardando_aprovacao',
           'ajustes', 'aguardando_material', 'gravacao_marcada', 'em_producao', 'pronta', 'agendada', 'em_andamento') then
        return 'situação inválida';
      end if;
      if e ->> 'aprovacao_link' is not null and (e ->> 'aprovacao_link' !~* '^https?://[^\s]+$' or length(e ->> 'aprovacao_link') > 1000) then
        return 'link de aprovação inválido';
      end if;
      if jsonb_typeof(coalesce(e -> 'publicacoes', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(e -> 'publicacoes', '[]'::jsonb)) > 30 then
        return 'publicações inválidas';
      end if;
      for pu in select * from jsonb_array_elements(coalesce(e -> 'publicacoes', '[]'::jsonb)) loop
        for k in select jsonb_object_keys(pu) loop
          if k not in ('canal', 'url', 'publicado_em') then return 'campo de publicação não permitido: ' || k; end if;
        end loop;
        if coalesce(pu ->> 'url', '') !~* '^https?://[^\s]+$' or length(pu ->> 'url') > 2000 then return 'url de publicação inválida'; end if;
        if length(coalesce(pu ->> 'canal', '')) > 60 then return 'canal longo'; end if;
      end loop;
    end loop;
  end loop;
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- entrada: a Central manda as projeções (até 200 por chamada)
-- ---------------------------------------------------------------------------
create function public.acompanhamento_receber(p_segredo text, p_pedidos jsonb)
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

-- ---------------------------------------------------------------------------
-- leitura pelo link /pedido/<token>
-- ---------------------------------------------------------------------------
create function public.acompanhamento_por_link(p_token text)
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

-- limpeza do registro de acessos (180 dias)
create function public.acompanhamento_limpar_acessos()
returns integer
language sql
security definer
set search_path to 'public'
as $$
  with x as (delete from public.acompanhamento_acessos where em < now() - interval '180 days' returning 1)
  select count(*)::int from x;
$$;
select cron.schedule('acompanhamento_limpar_acessos', '20 7 * * *', 'select public.acompanhamento_limpar_acessos()');

-- permissões: só o que precisa ser chamado de fora
revoke execute on function public.acompanhamento_normalizar_telefone(text) from public, anon, authenticated;
revoke execute on function public.acompanhamento_hash_telefone(text) from public, anon, authenticated;
revoke execute on function public.acompanhamento_conferir(jsonb) from public, anon, authenticated;
revoke execute on function public.acompanhamento_limpar_acessos() from public, anon, authenticated;
revoke execute on function public.acompanhamento_receber(text, jsonb) from public, authenticated;
revoke execute on function public.acompanhamento_por_link(text) from public;
-- a Central chama com a chave anônima do site + o segredo
grant execute on function public.acompanhamento_receber(text, jsonb) to anon, service_role;
-- a página /pedido/<token> (visitante, ou admin logado no mesmo navegador)
grant execute on function public.acompanhamento_por_link(text) to anon, authenticated, service_role;
