-- 09/out/2026 (build incremental, etapa 2): itens estruturados na fila de deploy.
-- APLICADA na produção em 09/10/2026 (CLI, transação única com o registro no
-- histórico como 20261009140000). Testada com ROLLBACK: rascunho não gera
-- item; publicar = nova; trocar slug/categoria = editada com sa/ca; voltar a
-- rascunho = removida.
--
-- O banco registra, por trigger, O QUE mudou de público (comparando antes e
-- depois -- não depende do que o navegador manda): notícia nova, editada
-- (com slug e categoria antigos quando mudam) ou removida, produto idem, e
-- mudanças de estrutura (categorias/subcategorias de notícia), que forçam
-- build completo. O admin continua chamando a fila do mesmo jeito; o disparo
-- leva os itens pendentes pro workflow (input "itens"), e a confirmação marca
-- os itens como atendidos.
--
-- Público: notícia com status = 'publicado'; produto com ativo = true.
-- Rascunho e inativo não geram item (não mudam o site).
--
-- Rollback: manutencao/20261009_fila_deploy_itens_rollback.sql

create table public.deploy_fila_itens (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  tipo text not null,          -- noticia | produto | estrutura | empresa | prestador
  acao text not null,          -- nova | editada | removida | estrutura
  ref_id text,                 -- id do registro (texto: uuid ou bigint)
  slug text,
  slug_antigo text,
  categoria text,
  categoria_antiga text,
  origem text not null default 'site',  -- site | guia
  atendido_em timestamptz
);
create index deploy_fila_itens_pendentes on public.deploy_fila_itens (em) where atendido_em is null;
alter table public.deploy_fila_itens enable row level security;
revoke all on public.deploy_fila_itens from anon, authenticated;

-- ---------------------------------------------------------------- notícias
create function public.deploy_fila_item_noticia()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_antes boolean := tg_op in ('UPDATE', 'DELETE') and old.status = 'publicado';
  v_depois boolean := tg_op in ('INSERT', 'UPDATE') and new.status = 'publicado';
begin
  if not v_antes and not v_depois then
    return null;  -- rascunho continua rascunho: nada público mudou
  end if;

  if v_depois and not v_antes then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, categoria)
    values ('noticia', 'nova', new.id::text, new.slug, new.categoria_id);
  elsif v_antes and not v_depois then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, categoria)
    values ('noticia', 'removida', old.id::text, old.slug, old.categoria_id);
  else
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, slug_antigo, categoria, categoria_antiga)
    values ('noticia', 'editada', new.id::text, new.slug,
            nullif(old.slug, new.slug), new.categoria_id, nullif(old.categoria_id, new.categoria_id));
  end if;
  return null;
end;
$$;

create trigger trg_deploy_fila_item_noticia
after insert or update or delete on public.noticias
for each row execute function public.deploy_fila_item_noticia();

-- relacionadas escolhidas mudam só a página da notícia de origem
create function public.deploy_fila_item_relacionada()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_noticia uuid := coalesce(new.noticia_id, old.noticia_id);
  v public.noticias;
begin
  select * into v from public.noticias where id = v_noticia;
  if found and v.status = 'publicado' then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, categoria)
    values ('noticia', 'editada', v.id::text, v.slug, v.categoria_id);
  end if;
  return null;
end;
$$;

create trigger trg_deploy_fila_item_relacionada
after insert or update or delete on public.noticias_relacionadas
for each row execute function public.deploy_fila_item_relacionada();

-- ---------------------------------------------------------------- produtos
create function public.deploy_fila_item_produto()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_antes boolean := tg_op in ('UPDATE', 'DELETE') and old.ativo;
  v_depois boolean := tg_op in ('INSERT', 'UPDATE') and new.ativo;
begin
  if not v_antes and not v_depois then
    return null;
  end if;

  if v_depois and not v_antes then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug)
    values ('produto', 'nova', new.id::text, new.slug);
  elsif v_antes and not v_depois then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug)
    values ('produto', 'removida', old.id::text, old.slug);
  else
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, slug_antigo)
    values ('produto', 'editada', new.id::text, new.slug, nullif(old.slug, new.slug));
  end if;
  return null;
end;
$$;

create trigger trg_deploy_fila_item_produto
after insert or update or delete on public.produtos
for each row execute function public.deploy_fila_item_produto();

-- ------------------------------------------------- estrutura (força completo)
create function public.deploy_fila_item_estrutura()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.deploy_fila_itens (tipo, acao, ref_id)
  values ('estrutura', 'estrutura', tg_table_name);
  return null;
end;
$$;

create trigger trg_deploy_fila_item_categoria
after insert or update or delete on public.noticias_categorias
for each statement execute function public.deploy_fila_item_estrutura();

create trigger trg_deploy_fila_item_subcategoria_guia
after insert or update or delete on public.noticias_subcategorias_guia
for each statement execute function public.deploy_fila_item_estrutura();

-- --------------------------------------------- entrega ao disparo e confirmação
-- itens pendentes até o instante reivindicado (o que o disparo vai levar),
-- sem repetição: o admin regrava todas as relacionadas a cada salvamento
-- (apaga e insere), o que gera um item igual por linha. Fica a primeira
-- ocorrência de cada item, na ordem em que aconteceram.
create function public.deploy_fila_itens_para_disparo(p_ate timestamptz)
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

-- confirmação passa a marcar os itens atendidos (o resto é igual à 20261008180000)
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
  update public.deploy_fila_itens set atendido_em = now()
  where atendido_em is null and em <= p_reivindicado_em;
  insert into public.deploy_fila_log (evento, motivo, detalhe)
  values ('disparo', v.ultimo_motivo, v.pedidos_pendentes || ' pedido(s) agrupado(s)');
  delete from public.deploy_fila_log where em < now() - interval '90 days';
  delete from public.deploy_fila_itens where atendido_em < now() - interval '90 days';
end;
$$;

revoke all on function
  public.deploy_fila_item_noticia(),
  public.deploy_fila_item_relacionada(),
  public.deploy_fila_item_produto(),
  public.deploy_fila_item_estrutura(),
  public.deploy_fila_itens_para_disparo(timestamptz)
from public, anon, authenticated;
grant execute on function public.deploy_fila_itens_para_disparo(timestamptz) to service_role;
