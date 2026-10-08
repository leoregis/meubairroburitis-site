-- Fila de publicação com período de calma (08/out/2026).
--
-- Antes: cada salvamento no admin (notícia/produto, inclusive rascunho)
-- chamava o workflow_dispatch do GitHub na hora -- até 10 deploys/dia,
-- média de 113 min do pedido ao fim (fila inclusa).
-- Agora: o admin só pede publicação quando algo público muda, e o pedido
-- vai pra esta fila (edge function disparar_deploy). Um cron a cada 2 min
-- dispara o deploy quando o último pedido tem 3+ min sem pedido novo
-- (rajada de salvamentos vira 1 deploy), ou quando o primeiro pedido
-- pendente já espera 15+ min (teto, pra rajada longa não adiar pra sempre).
-- O disparo em si é a edge function disparar_deploy_fila (verify_jwt off,
-- autenticada por segredo guardado no vault e conferido aqui no banco).
--
-- Rollback: supabase/manutencao/20261008_fila_deploy_rollback.sql

create extension if not exists pg_net with schema extensions;

create table public.deploy_fila (
  id boolean primary key default true check (id),
  solicitado_em timestamptz,          -- último pedido
  primeiro_pendente_em timestamptz,   -- primeiro pedido ainda não atendido
  pedidos_pendentes integer not null default 0,
  ultimo_motivo text,
  disparo_reivindicado_em timestamptz, -- disparo em andamento (trava de 2 min)
  ultimo_disparo_em timestamptz,      -- pedidos até este instante já foram atendidos
  ultimo_erro text,
  ultimo_erro_em timestamptz
);
insert into public.deploy_fila (id) values (true);

create table public.deploy_fila_log (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  evento text not null,   -- pedido | disparo | erro
  motivo text,
  detalhe text
);

alter table public.deploy_fila enable row level security;
alter table public.deploy_fila_log enable row level security;
revoke all on public.deploy_fila, public.deploy_fila_log from anon, authenticated;

-- segredo do cron -> edge function (só existe no vault)
select vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'deploy_fila_cron_secret',
  'x-cron-secret do pg_cron deploy_fila_processar -> edge function disparar_deploy_fila'
);

-- pedido do admin (chamada pela edge function disparar_deploy, service_role)
create function public.deploy_fila_solicitar(p_motivo text)
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

-- há pedido pronto pra disparar? (calma de 3 min ou teto de 15 min, sem disparo em andamento)
create function public.deploy_fila_pronto()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.deploy_fila f
    where f.id
      and f.solicitado_em is not null
      and f.solicitado_em > coalesce(f.ultimo_disparo_em, '-infinity')
      and (f.solicitado_em <= now() - interval '3 minutes'
           or f.primeiro_pendente_em <= now() - interval '15 minutes')
      and (f.disparo_reivindicado_em is null
           or f.disparo_reivindicado_em < now() - interval '2 minutes')
  );
$$;

-- reivindica o disparo (atômico); devolve o instante reivindicado, ou null se não há nada
create function public.deploy_fila_reivindicar()
returns timestamptz
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_agora timestamptz := now();
begin
  if not public.deploy_fila_pronto() then
    return null;
  end if;
  update public.deploy_fila f set disparo_reivindicado_em = v_agora
  where f.id
    and (f.disparo_reivindicado_em is null or f.disparo_reivindicado_em < v_agora - interval '2 minutes');
  if not found then
    return null;
  end if;
  return v_agora;
end;
$$;

-- GitHub aceitou: pedidos até o instante reivindicado ficam atendidos
-- (pedido feito depois disso continua pendente e gera outro deploy)
create function public.deploy_fila_confirmar(p_reivindicado_em timestamptz)
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

-- GitHub recusou: fica pendente; a trava de 2 min vira o intervalo entre tentativas
create function public.deploy_fila_falhou(p_erro text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.deploy_fila f set ultimo_erro = left(p_erro, 500), ultimo_erro_em = now() where f.id;
  insert into public.deploy_fila_log (evento, detalhe) values ('erro', left(p_erro, 500));
end;
$$;

create function public.deploy_fila_confere_segredo(p_segredo text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(p_segredo, '') <> '' and exists (
    select 1 from vault.decrypted_secrets
    where name = 'deploy_fila_cron_secret' and decrypted_secret = p_segredo
  );
$$;

-- cron: só chama a edge function quando há algo pronto (sem HTTP no caso comum)
create function public.deploy_fila_processar()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.deploy_fila_pronto() then
    return;
  end if;
  perform net.http_post(
    url := 'https://peusailkyxqbhgdgmqyk.supabase.co/functions/v1/disparar_deploy_fila',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'deploy_fila_cron_secret')
    ),
    body := '{}'::jsonb
  );
end;
$$;

revoke all on function
  public.deploy_fila_solicitar(text),
  public.deploy_fila_pronto(),
  public.deploy_fila_reivindicar(),
  public.deploy_fila_confirmar(timestamptz),
  public.deploy_fila_falhou(text),
  public.deploy_fila_confere_segredo(text),
  public.deploy_fila_processar()
from public, anon, authenticated;

grant execute on function
  public.deploy_fila_solicitar(text),
  public.deploy_fila_reivindicar(),
  public.deploy_fila_confirmar(timestamptz),
  public.deploy_fila_falhou(text),
  public.deploy_fila_confere_segredo(text)
to service_role;

select cron.schedule('deploy_fila_processar', '*/2 * * * *', 'select public.deploy_fila_processar()');
