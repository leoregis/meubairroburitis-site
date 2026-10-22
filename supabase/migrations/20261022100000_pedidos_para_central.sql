-- 22/out (projeto "Meus pedidos", fatia 2 -- aprovado pelo Leo): pedido pago no
-- site gera o link de acompanhamento na hora e vai para a Central MBB.
--
--   * Ao virar "pago" (Pix pelo mp_webhook ou cartão na criar_pagamento), o pedido
--     ganha acompanhamento_token (128 bits, base64url) e o site cria o pedido em
--     /pedido/<token> com "Pagamento confirmado" (da_central = false), sem esperar a
--     Central. O link vai no e-mail de confirmação e na tela de pagamento.
--   * Uma fila de saída (pedidos_central_fila) manda à Central, servidor a servidor,
--     o pedido pago (itens, total, data, nome/WhatsApp/e-mail do comprador, token) e,
--     depois, o estorno/cancelamento no Mercado Pago (estornado_em). pg_cron a cada
--     minuto -> pg_net -> Edge Function central-pedido-site (segredo no vault), com
--     resposta conferida no minuto seguinte e nova tentativa com espera crescente.
--   * Estorno: coluna estornado_em (o status do pedido continua "pago"); o link
--     mostra "pagamento estornado".
--   * O site continua sem ler o banco da Central. Quando a Central cria (ou liga) a
--     venda, a projeção dela chega com a mesma chave (site:<pedido>) e o mesmo hash
--     do token, e passa a valer (da_central = true).
--
-- Funções nascem fechadas (20261021210000): nenhuma aqui é chamada de fora.
-- Rollback: supabase/manutencao/20261022_pedidos_para_central_rollback.sql

alter table public.pedidos add column acompanhamento_token text
  check (acompanhamento_token is null or acompanhamento_token ~ '^[A-Za-z0-9_-]{22}$');
create unique index pedidos_acompanhamento_token_uidx on public.pedidos (acompanhamento_token) where acompanhamento_token is not null;
alter table public.pedidos add column estornado_em timestamptz;

-- Linha criada pelo próprio site (antes de a Central mandar a projeção da venda).
alter table public.acompanhamento_pedidos add column da_central boolean not null default true;

create table public.pedidos_central_fila (
  id bigint generated always as identity primary key,
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  evento text not null check (evento in ('pago', 'estorno')),
  anterior boolean not null default false,
  criado_em timestamptz not null default now(),
  request_id bigint,
  reservado_em timestamptz,
  enviado_em timestamptz,
  tentativas integer not null default 0,
  proxima_tentativa_em timestamptz not null default now(),
  ultimo_erro text,
  unique (pedido_id, evento)
);
create index pedidos_central_fila_pendentes_idx on public.pedidos_central_fila (proxima_tentativa_em) where enviado_em is null;
alter table public.pedidos_central_fila enable row level security;
revoke all on table public.pedidos_central_fila from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pedido pago: token, pedido no /pedido/<token>, fila
-- ---------------------------------------------------------------------------
create function public.novo_token_acompanhamento()
returns text
language sql
volatile
set search_path to 'public'
as $$
  select translate(rtrim(encode(extensions.gen_random_bytes(16), 'base64'), '='), '+/', '-_');
$$;

create function public.pedido_pago_token()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.status = 'pago' and old.status is distinct from 'pago' and new.acompanhamento_token is null then
    new.acompanhamento_token := public.novo_token_acompanhamento();
  end if;
  return new;
end;
$$;

-- Cria o pedido no acompanhamento (se ainda não existe) e o link do token.
create function public.acompanhamento_do_pedido_site(p public.pedidos)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_chave text := 'site:' || p.id;
begin
  insert into public.acompanhamento_pedidos (chave, versao, ativo, cancelado, em_aberto, encerrado_em, numero, data, empresa,
    telefone_hash, itens, da_central)
  values (v_chave, 1, true, false, true, null, null, (coalesce(p.pago_em, now()) at time zone 'America/Sao_Paulo')::date, null,
    public.acompanhamento_hash_telefone(p.telefone_comprador),
    coalesce((select jsonb_agg(jsonb_build_object('produto', left(i ->> 'nome', 160), 'quantidade', coalesce((i ->> 'quantidade')::int, 1),
      'a_agendar', 0, 'entregas', '[]'::jsonb)) from jsonb_array_elements(p.itens) i), '[]'::jsonb),
    false)
  on conflict (chave) do nothing;
  insert into public.acompanhamento_links (token_hash, chave)
  values (encode(extensions.digest(p.acompanhamento_token, 'sha256'), 'hex'), v_chave)
  on conflict (token_hash) do nothing;
end;
$$;

create function public.pedido_para_central()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.status = 'pago' and old.status is distinct from 'pago' and new.acompanhamento_token is not null then
    perform public.acompanhamento_do_pedido_site(new);
    insert into public.pedidos_central_fila (pedido_id, evento) values (new.id, 'pago') on conflict (pedido_id, evento) do nothing;
  end if;
  if new.estornado_em is not null and old.estornado_em is null and new.status = 'pago' then
    insert into public.pedidos_central_fila (pedido_id, evento) values (new.id, 'estorno') on conflict (pedido_id, evento) do nothing;
  end if;
  return null;
end;
$$;

create trigger pedidos_pago_token before update on public.pedidos for each row execute function public.pedido_pago_token();
create trigger pedidos_para_central after update on public.pedidos for each row execute function public.pedido_para_central();

-- ---------------------------------------------------------------------------
-- Envio à Central (pg_cron todo minuto; só faz HTTP quando há o que mandar)
-- ---------------------------------------------------------------------------
create function public.pedidos_central_evento(f public.pedidos_central_fila)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select case f.evento
    when 'pago' then jsonb_build_object('evento', 'pago', 'pedido_site_id', p.id, 'pago_em', coalesce(p.pago_em, p.criado_em),
      'total_centavos', p.valor_total_centavos, 'anterior', f.anterior, 'token', p.acompanhamento_token,
      'itens', (select jsonb_agg(jsonb_build_object('produto_site_id', i ->> 'produto_id', 'nome', i ->> 'nome',
         'quantidade', (i ->> 'quantidade')::int, 'preco_unitario_centavos', (i ->> 'preco_centavos')::bigint)) from jsonb_array_elements(p.itens) i),
      'comprador', jsonb_build_object('nome', p.nome_comprador, 'telefone', p.telefone_comprador, 'email', p.email_comprador))
    else jsonb_build_object('evento', 'estorno', 'pedido_site_id', p.id, 'estornado_em', p.estornado_em) end
  from public.pedidos p where p.id = f.pedido_id;
$$;

create function public.pedidos_central_falhou(p_ids bigint[], p_erro text)
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.pedidos_central_fila
  set request_id = null, reservado_em = null, tentativas = tentativas + 1, ultimo_erro = left(p_erro, 500),
      proxima_tentativa_em = now() + least(interval '1 minute' * power(2, least(tentativas, 7)), interval '2 hours')
  where id = any (p_ids);
$$;

create function public.pedidos_central_processar()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_url text := (select decrypted_secret from vault.decrypted_secrets where name = 'central_pedidos_url');
  v_segredo text := (select decrypted_secret from vault.decrypted_secrets where name = 'central_pedidos_segredo');
  v_req bigint;
  r record;
  v_ids bigint[];
  v_eventos jsonb;
  v_res jsonb;
begin
  if v_url is null or v_segredo is null then
    return;
  end if;

  -- 1) Respostas das chamadas anteriores.
  for v_req in select distinct request_id from public.pedidos_central_fila where request_id is not null and enviado_em is null loop
    select * into r from net._http_response where id = v_req;
    select array_agg(id) into v_ids from public.pedidos_central_fila where request_id = v_req and enviado_em is null;
    if r.id is null then
      if exists (select 1 from public.pedidos_central_fila where request_id = v_req and reservado_em < now() - interval '5 minutes') then
        perform public.pedidos_central_falhou(v_ids, 'a Central não respondeu');
      end if;
      continue;
    end if;
    if r.status_code is distinct from 200 then
      perform public.pedidos_central_falhou(v_ids, format('a Central respondeu %s', coalesce(r.status_code::text, r.error_msg, 'sem status')));
      continue;
    end if;
    begin
      v_res := r.content::jsonb -> 'resultados';
    exception when others then
      v_res := null;
    end;
    update public.pedidos_central_fila f set enviado_em = now(), request_id = null, ultimo_erro = null
    where f.request_id = v_req and exists (select 1 from jsonb_array_elements(coalesce(v_res, '[]'::jsonb)) x
      where x ->> 'pedido_site_id' = f.pedido_id::text and x ->> 'evento' = f.evento and (x ->> 'ok')::boolean);
    select array_agg(id) into v_ids from public.pedidos_central_fila where request_id = v_req and enviado_em is null;
    if v_ids is not null then
      perform public.pedidos_central_falhou(v_ids, coalesce((select x ->> 'erro' from jsonb_array_elements(coalesce(v_res, '[]'::jsonb)) x
        where (x ->> 'ok')::boolean is not true limit 1), 'a Central não confirmou'));
    end if;
  end loop;

  -- 2) O que está na hora de mandar (até 50 por chamada).
  select array_agg(id), jsonb_agg(public.pedidos_central_evento(f)) into v_ids, v_eventos from (
    select * from public.pedidos_central_fila
    where enviado_em is null and request_id is null and proxima_tentativa_em <= now()
    order by id limit 50) f;
  if v_ids is null then
    return;
  end if;
  v_req := net.http_post(url := v_url, body := jsonb_build_object('eventos', v_eventos),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-central-pedido-site', v_segredo), timeout_milliseconds := 30000);
  update public.pedidos_central_fila set request_id = v_req, reservado_em = now() where id = any (v_ids);
end;
$$;

select cron.schedule('pedidos_central_processar', '* * * * *', 'select public.pedidos_central_processar()');

-- ---------------------------------------------------------------------------
-- Acompanhamento: projeção da Central passa a valer; link mostra o estorno
-- ---------------------------------------------------------------------------
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

    -- 22/out: a projeção da Central substitui a linha criada pelo site (da_central = false).
    insert into public.acompanhamento_pedidos as a (chave, versao, ativo, cancelado, em_aberto, encerrado_em, numero, data,
      empresa, telefone_hash, itens, recebido_em, da_central)
    values (v_chave, v_versao, (p ->> 'ativo')::boolean, (p ->> 'cancelado')::boolean, (p ->> 'em_aberto')::boolean,
      (p ->> 'encerrado_em')::timestamptz, (p ->> 'numero')::bigint, (p ->> 'data')::date, p ->> 'empresa',
      public.acompanhamento_hash_telefone(p ->> 'telefone'), p -> 'itens', now(), true)
    on conflict (chave) do update set
      versao = excluded.versao, ativo = excluded.ativo, cancelado = excluded.cancelado, em_aberto = excluded.em_aberto,
      encerrado_em = excluded.encerrado_em, numero = excluded.numero, data = excluded.data, empresa = excluded.empresa,
      telefone_hash = excluded.telefone_hash, itens = excluded.itens, recebido_em = now(), da_central = true
    where a.versao <= excluded.versao or not a.da_central;

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
  v_estornado boolean := false;
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
  -- 22/out: pedido do site estornado/cancelado no Mercado Pago.
  if a.chave like 'site:%' then
    select estornado_em is not null into v_estornado from public.pedidos where id = substr(a.chave, 6)::uuid;
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
    'atualizado_em', a.recebido_em,
    'aguardando_registro', not a.da_central,
    'pagamento_estornado', coalesce(v_estornado, false));
end;
$$;

revoke execute on function public.novo_token_acompanhamento() from public, anon, authenticated;
revoke execute on function public.pedido_pago_token() from public, anon, authenticated;
revoke execute on function public.acompanhamento_do_pedido_site(public.pedidos) from public, anon, authenticated;
revoke execute on function public.pedido_para_central() from public, anon, authenticated;
revoke execute on function public.pedidos_central_evento(public.pedidos_central_fila) from public, anon, authenticated;
revoke execute on function public.pedidos_central_falhou(bigint[], text) from public, anon, authenticated;
revoke execute on function public.pedidos_central_processar() from public, anon, authenticated;
-- as duas de fora mantêm a liberação da 20261021220000 (create or replace não muda grants)
