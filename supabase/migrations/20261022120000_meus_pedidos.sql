-- 22/out (projeto "Meus pedidos", fatia 3 -- aprovado pelo Leo): /meus-pedidos com
-- login por código no WhatsApp. O cliente digita o celular, recebe um código de 6
-- dígitos (template codigo_login, enviado por uma função restrita do Guia, que tem o
-- token da Meta) e vê todos os pedidos daquele número.
--
--   * Telefone: um formato só, 55 + DDD + número (celular sem o 9 ganha o 9), para o
--     checkout, os pedidos antigos e o WhatsApp de acompanhamento que a Central manda.
--     A normalização nova só aceita formatos a mais (0 + DDD, 0 + operadora + DDD,
--     00 55 ...): o que a anterior já aceitava dá o mesmo resultado, então os hashes
--     já gravados continuam valendo.
--   * pedidos.telefone_hash (HMAC do número normalizado, preenchido por gatilho e para
--     os pedidos antigos aqui): os pedidos pagos sem acompanhamento (antes de 01/10)
--     também aparecem, no histórico. O telefone digitado continua como estava.
--   * Código: 6 dígitos, só o hash (HMAC) é guardado, 10 minutos, 5 erros anulam,
--     código novo anula o anterior. Limites: 3 pedidos de código a cada 15 min e 10 por
--     dia por número, 10 por hora por IP, 200 códigos por dia no total. Só gera código
--     se o número tiver pedidos; a resposta ao visitante é a mesma nos dois casos (a
--     Edge Function meus_pedidos_codigo responde antes de enviar).
--   * Sessão: token aleatório (256 bits), só o sha256 no banco, 30 dias, "Sair" encerra.
--   * Lista: pedidos do acompanhamento (site e Central) pelo hash do telefone, menos os
--     pausados; e os pedidos pagos do site sem acompanhamento. Nada de valores.
--
-- Tabelas sem política e sem grant (RLS ligado): só as funções abaixo.
-- Funções nascem fechadas (20261021210000): a liberação para anon está explícita no fim.
-- Rollback: supabase/manutencao/20261022_meus_pedidos_rollback.sql

-- ---------------------------------------------------------------------------
-- telefone: 55 + DDD + número; celular de 8 dígitos ganha o 9
-- ---------------------------------------------------------------------------
create or replace function public.acompanhamento_normalizar_telefone(p_telefone text)
returns text
language plpgsql
immutable
set search_path to 'public'
as $$
declare
  d text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
begin
  if d ~ '^00' then
    -- 00 + código do país (discagem internacional)
    d := substr(d, 3);
  elsif d ~ '^0' then
    -- 0 + DDD + número, ou 0 + operadora (2 dígitos) + DDD + número
    d := substr(d, 2);
    if length(d) in (12, 13) and d !~ '^55' then
      d := substr(d, 3);
    end if;
  end if;
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

-- ---------------------------------------------------------------------------
-- pedidos do site: hash do telefone (normalizado)
-- ---------------------------------------------------------------------------
alter table public.pedidos add column telefone_hash text
  check (telefone_hash is null or telefone_hash ~ '^[0-9a-f]{64}$');
create index pedidos_telefone_hash_idx on public.pedidos (telefone_hash) where telefone_hash is not null;

create function public.pedido_telefone_hash()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  new.telefone_hash := public.acompanhamento_hash_telefone(new.telefone_comprador);
  return new;
end;
$$;
create trigger pedidos_telefone_hash before insert or update of telefone_comprador on public.pedidos
  for each row execute function public.pedido_telefone_hash();

-- pedidos antigos (os gatilhos de status não agem: o status não muda)
update public.pedidos set telefone_hash = public.acompanhamento_hash_telefone(telefone_comprador)
where telefone_hash is null;

-- ---------------------------------------------------------------------------
-- códigos, pedidos de código (limites) e sessões
-- ---------------------------------------------------------------------------
create table public.meus_pedidos_codigos (
  id bigint generated always as identity primary key,
  telefone_hash text not null check (telefone_hash ~ '^[0-9a-f]{64}$'),
  codigo_hash text not null check (codigo_hash ~ '^[0-9a-f]{64}$'),
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  tentativas integer not null default 0,
  usado_em timestamptz,
  anulado_em timestamptz
);
create index meus_pedidos_codigos_telefone_idx on public.meus_pedidos_codigos (telefone_hash, criado_em desc);

-- todo pedido de código (gerou ou não): base dos limites
create table public.meus_pedidos_envios (
  id bigint generated always as identity primary key,
  telefone_hash text not null,
  origem_hash text,
  gerou_codigo boolean not null,
  em timestamptz not null default now()
);
create index meus_pedidos_envios_telefone_idx on public.meus_pedidos_envios (telefone_hash, em);
create index meus_pedidos_envios_origem_idx on public.meus_pedidos_envios (origem_hash, em);
create index meus_pedidos_envios_em_idx on public.meus_pedidos_envios (em);

create table public.meus_pedidos_sessoes (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  telefone_hash text not null check (telefone_hash ~ '^[0-9a-f]{64}$'),
  -- só os 4 últimos dígitos, para a tela mostrar "celular final 1234"
  telefone_final text not null check (telefone_final ~ '^\d{4}$'),
  criada_em timestamptz not null default now(),
  expira_em timestamptz not null,
  encerrada_em timestamptz,
  ultimo_uso_em timestamptz
);
create index meus_pedidos_sessoes_expira_idx on public.meus_pedidos_sessoes (expira_em);

alter table public.meus_pedidos_codigos enable row level security;
alter table public.meus_pedidos_envios enable row level security;
alter table public.meus_pedidos_sessoes enable row level security;
revoke all on table public.meus_pedidos_codigos from anon, authenticated;
revoke all on table public.meus_pedidos_envios from anon, authenticated;
revoke all on table public.meus_pedidos_sessoes from anon, authenticated;

create function public.meus_pedidos_hmac(p_valor text)
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select encode(extensions.hmac(p_valor,
    (select decrypted_secret from vault.decrypted_secrets where name = 'acompanhamento_pepper'), 'sha256'), 'hex');
$$;

-- o número tem pedido para mostrar?
create function public.meus_pedidos_tem_pedidos(p_hash text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.acompanhamento_pedidos where telefone_hash = p_hash and ativo)
      or exists (select 1 from public.pedidos where telefone_hash = p_hash and status = 'pago');
$$;

-- ---------------------------------------------------------------------------
-- pedido de código (só a Edge Function meus_pedidos_codigo, com service_role)
--   status: 'invalido' | 'limite' (com minutos) | 'sem_envio' | 'enviar' (com
--   telefone normalizado, código e id). A Edge Function responde igual ao
--   visitante em 'sem_envio' e 'enviar'.
-- ---------------------------------------------------------------------------
create function public.meus_pedidos_preparar_codigo(p_telefone text, p_origem text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_numero text := public.acompanhamento_normalizar_telefone(p_telefone);
  v_hash text;
  v_origem text;
  v_espera interval;
  v_codigo text;
  v_id bigint;
begin
  if v_numero is null then
    return jsonb_build_object('status', 'invalido');
  end if;
  v_hash := public.acompanhamento_hash_telefone(v_numero);
  v_origem := case when coalesce(p_origem, '') = '' then null else left(public.meus_pedidos_hmac('ip:' || p_origem), 32) end;

  -- uma chamada por número de cada vez (contagem dos limites sem corrida)
  perform pg_advisory_xact_lock(hashtextextended('meus_pedidos:' || v_hash, 0));

  -- limites (contam todo pedido, tenha o número pedidos ou não)
  if (select count(*) from public.meus_pedidos_envios where telefone_hash = v_hash and em > now() - interval '15 minutes') >= 3 then
    select min(em) + interval '15 minutes' - now() into v_espera from (
      select em from public.meus_pedidos_envios where telefone_hash = v_hash and em > now() - interval '15 minutes'
      order by em desc limit 3) x;
  elsif (select count(*) from public.meus_pedidos_envios where telefone_hash = v_hash and em > now() - interval '24 hours') >= 10 then
    select min(em) + interval '24 hours' - now() into v_espera from (
      select em from public.meus_pedidos_envios where telefone_hash = v_hash and em > now() - interval '24 hours'
      order by em desc limit 10) x;
  elsif v_origem is not null and (select count(*) from public.meus_pedidos_envios
      where origem_hash = v_origem and em > now() - interval '1 hour') >= 10 then
    select min(em) + interval '1 hour' - now() into v_espera from (
      select em from public.meus_pedidos_envios where origem_hash = v_origem and em > now() - interval '1 hour'
      order by em desc limit 10) x;
  end if;
  if v_espera is not null then
    return jsonb_build_object('status', 'limite', 'minutos', greatest(1, ceil(extract(epoch from v_espera) / 60)::int));
  end if;

  -- sem pedido, ou teto geral do dia: não gera (e o visitante vê a mesma resposta)
  if not public.meus_pedidos_tem_pedidos(v_hash)
     or (select count(*) from public.meus_pedidos_envios where gerou_codigo and em > now() - interval '24 hours') >= 200 then
    insert into public.meus_pedidos_envios (telefone_hash, origem_hash, gerou_codigo) values (v_hash, v_origem, false);
    return jsonb_build_object('status', 'sem_envio');
  end if;

  update public.meus_pedidos_codigos set anulado_em = now()
  where telefone_hash = v_hash and usado_em is null and anulado_em is null;
  v_codigo := lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
  insert into public.meus_pedidos_codigos (telefone_hash, codigo_hash, expira_em)
  values (v_hash, public.meus_pedidos_hmac(v_hash || ':' || v_codigo), now() + interval '10 minutes')
  returning id into v_id;
  insert into public.meus_pedidos_envios (telefone_hash, origem_hash, gerou_codigo) values (v_hash, v_origem, true);
  return jsonb_build_object('status', 'enviar', 'telefone', v_numero, 'codigo', v_codigo, 'id', v_id);
end;
$$;

-- o envio pelo WhatsApp falhou: o código não vale
create function public.meus_pedidos_codigo_nao_enviado(p_id bigint)
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.meus_pedidos_codigos set anulado_em = now() where id = p_id and anulado_em is null and usado_em is null;
$$;

-- ---------------------------------------------------------------------------
-- validação do código -> sessão (visitante)
--   {ok: true, sessao, expira_em, telefone_final} ou {ok: false, motivo}
--   motivo: 'invalido' (sem código válido: expirou, foi anulado ou usado) |
--           'incorreto' (com tentativas_restantes) | 'tentativas' (anulado agora)
-- ---------------------------------------------------------------------------
create function public.meus_pedidos_validar_codigo(p_telefone text, p_codigo text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_numero text := public.acompanhamento_normalizar_telefone(p_telefone);
  v_hash text;
  c public.meus_pedidos_codigos;
  v_sessao text;
  v_expira timestamptz := now() + interval '30 days';
begin
  if v_numero is null or coalesce(p_codigo, '') !~ '^\d{6}$' then
    return jsonb_build_object('ok', false, 'motivo', 'invalido');
  end if;
  v_hash := public.acompanhamento_hash_telefone(v_numero);
  select * into c from public.meus_pedidos_codigos
  where telefone_hash = v_hash and usado_em is null and anulado_em is null and expira_em > now()
  order by criado_em desc limit 1
  for update;
  if c.id is null then
    return jsonb_build_object('ok', false, 'motivo', 'invalido');
  end if;

  if c.codigo_hash <> public.meus_pedidos_hmac(v_hash || ':' || p_codigo) then
    update public.meus_pedidos_codigos set tentativas = tentativas + 1,
      anulado_em = case when tentativas + 1 >= 5 then now() end
    where id = c.id;
    if c.tentativas + 1 >= 5 then
      return jsonb_build_object('ok', false, 'motivo', 'tentativas');
    end if;
    return jsonb_build_object('ok', false, 'motivo', 'incorreto', 'tentativas_restantes', 5 - (c.tentativas + 1));
  end if;

  update public.meus_pedidos_codigos set usado_em = now() where id = c.id;
  v_sessao := translate(rtrim(encode(extensions.gen_random_bytes(32), 'base64'), '='), '+/', '-_');
  insert into public.meus_pedidos_sessoes (token_hash, telefone_hash, telefone_final, expira_em)
  values (encode(extensions.digest(v_sessao, 'sha256'), 'hex'), v_hash, right(v_numero, 4), v_expira);
  return jsonb_build_object('ok', true, 'sessao', v_sessao, 'expira_em', v_expira, 'telefone_final', right(v_numero, 4));
end;
$$;

-- sessão válida -> hash do telefone (ou null)
create function public.meus_pedidos_sessao(p_sessao text)
returns public.meus_pedidos_sessoes
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  s public.meus_pedidos_sessoes;
begin
  if coalesce(p_sessao, '') !~ '^[A-Za-z0-9_-]{43}$' then
    return null;
  end if;
  update public.meus_pedidos_sessoes set ultimo_uso_em = now()
  where token_hash = encode(extensions.digest(p_sessao, 'sha256'), 'hex') and encerrada_em is null and expira_em > now()
  returning * into s;
  return s;
end;
$$;

-- ---------------------------------------------------------------------------
-- lista de pedidos da sessão (visitante com sessão)
--   {ok: false} (sessão inválida, expirada ou encerrada) ou
--   {ok: true, telefone_final, pedidos: [...]}; cada pedido no formato do
--   acompanhamento_por_link, mais 'ref', 'expirado' e 'antigo'.
-- ---------------------------------------------------------------------------
create function public.meus_pedidos_listar(p_sessao text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  s public.meus_pedidos_sessoes := public.meus_pedidos_sessao(p_sessao);
  v_lista jsonb;
begin
  if s.token_hash is null then
    return jsonb_build_object('ok', false);
  end if;

  select coalesce(jsonb_agg(x.pedido order by x.quando desc), '[]'::jsonb) into v_lista from (
    -- acompanhamento (vendas da Central e pedidos do site), menos os pausados
    select coalesce(a.data::timestamptz, a.recebido_em) as quando, jsonb_build_object(
      'ref', left(public.meus_pedidos_hmac('ref:' || a.chave), 16),
      'numero', a.numero,
      'data', a.data,
      'empresa', a.empresa,
      'cancelado', a.cancelado,
      'em_aberto', a.em_aberto,
      'expirado', a.encerrado_em is not null and a.encerrado_em < now() - interval '90 days',
      'itens', case when a.encerrado_em is not null and a.encerrado_em < now() - interval '90 days' then
        (select coalesce(jsonb_agg(jsonb_build_object('produto', i ->> 'produto', 'quantidade', (i ->> 'quantidade')::int,
          'a_agendar', 0, 'entregas', '[]'::jsonb)), '[]'::jsonb) from jsonb_array_elements(a.itens) i)
        else a.itens end,
      'atualizado_em', a.recebido_em,
      'aguardando_registro', not a.da_central,
      'pagamento_estornado', coalesce(p.estornado_em is not null, false),
      'antigo', false) as pedido
    from public.acompanhamento_pedidos a
    left join public.pedidos p on a.chave = 'site:' || p.id
    where a.telefone_hash = s.telefone_hash and a.ativo
    union all
    -- pedidos pagos do site sem acompanhamento (anteriores a 01/10)
    select coalesce(p.pago_em, p.criado_em), jsonb_build_object(
      'ref', left(public.meus_pedidos_hmac('ref:site:' || p.id), 16),
      'numero', null,
      'data', (coalesce(p.pago_em, p.criado_em) at time zone 'America/Sao_Paulo')::date,
      'empresa', null,
      'cancelado', false,
      'em_aberto', false,
      'expirado', false,
      'itens', coalesce((select jsonb_agg(jsonb_build_object('produto', left(i ->> 'nome', 160),
        'quantidade', coalesce((i ->> 'quantidade')::int, 1), 'a_agendar', 0, 'entregas', '[]'::jsonb))
        from jsonb_array_elements(p.itens) i), '[]'::jsonb),
      'atualizado_em', null,
      'aguardando_registro', false,
      'pagamento_estornado', p.estornado_em is not null,
      'antigo', true)
    from public.pedidos p
    where p.telefone_hash = s.telefone_hash and p.status = 'pago'
      and not exists (select 1 from public.acompanhamento_pedidos a where a.chave = 'site:' || p.id)
  ) x;

  return jsonb_build_object('ok', true, 'telefone_final', s.telefone_final, 'pedidos', v_lista);
end;
$$;

create function public.meus_pedidos_sair(p_sessao text)
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.meus_pedidos_sessoes set encerrada_em = now()
  where token_hash = encode(extensions.digest(coalesce(p_sessao, ''), 'sha256'), 'hex') and encerrada_em is null;
$$;

-- limpeza diária: códigos e pedidos de código com mais de 30 dias; sessões
-- vencidas ou encerradas há mais de 30 dias
create function public.meus_pedidos_limpar()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  n integer := 0;
  k integer;
begin
  delete from public.meus_pedidos_codigos where criado_em < now() - interval '30 days';
  get diagnostics k = row_count; n := n + k;
  delete from public.meus_pedidos_envios where em < now() - interval '30 days';
  get diagnostics k = row_count; n := n + k;
  delete from public.meus_pedidos_sessoes where coalesce(encerrada_em, expira_em) < now() - interval '30 days';
  get diagnostics k = row_count; n := n + k;
  return n;
end;
$$;
select cron.schedule('meus_pedidos_limpar', '25 7 * * *', 'select public.meus_pedidos_limpar()');

-- permissões: só o que a página chama
revoke execute on function public.pedido_telefone_hash() from public, anon, authenticated;
revoke execute on function public.meus_pedidos_hmac(text) from public, anon, authenticated;
revoke execute on function public.meus_pedidos_tem_pedidos(text) from public, anon, authenticated;
revoke execute on function public.meus_pedidos_preparar_codigo(text, text) from public, anon, authenticated;
revoke execute on function public.meus_pedidos_codigo_nao_enviado(bigint) from public, anon, authenticated;
revoke execute on function public.meus_pedidos_sessao(text) from public, anon, authenticated;
revoke execute on function public.meus_pedidos_limpar() from public, anon, authenticated;
revoke execute on function public.meus_pedidos_validar_codigo(text, text) from public;
revoke execute on function public.meus_pedidos_listar(text) from public;
revoke execute on function public.meus_pedidos_sair(text) from public;
-- a Edge Function meus_pedidos_codigo (service_role; explícito, como na 20261021220000)
grant execute on function public.meus_pedidos_preparar_codigo(text, text) to service_role;
grant execute on function public.meus_pedidos_codigo_nao_enviado(bigint) to service_role;
-- a página /meus-pedidos (visitante, ou admin logado no mesmo navegador)
grant execute on function public.meus_pedidos_validar_codigo(text, text) to anon, authenticated;
grant execute on function public.meus_pedidos_listar(text) to anon, authenticated;
grant execute on function public.meus_pedidos_sair(text) to anon, authenticated;
-- acompanhamento_normalizar_telefone: create or replace mantém os grants (fechada desde 20261021220000)
