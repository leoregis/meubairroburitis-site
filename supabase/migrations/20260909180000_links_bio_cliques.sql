-- Rastreamento de clique da página /links (bio do Instagram). Visitante
-- é sempre anônimo (público dessa página nunca faz login), então o
-- INSERT precisa ficar aberto pra anon -- mas sem policy de SELECT: a
-- leitura (mesmo agregada) só acontece via RPC abaixo, que expõe só
-- contagem por link, nunca a linha crua (timestamp/user-agent
-- individual não tem por que ficar público).
create table public.links_bio_cliques (
  id bigint generated always as identity primary key,
  link_slug text not null,
  user_agent text,
  criado_em timestamptz not null default now()
);

create index idx_links_bio_cliques_slug_data on public.links_bio_cliques(link_slug, criado_em);

alter table public.links_bio_cliques enable row level security;

create policy "links_bio_cliques_insert_publico"
  on public.links_bio_cliques for insert
  to anon, authenticated
  with check (true);

-- Sem policy de select: ninguém lê linha crua direto pela API, só
-- agregado via a function abaixo.

-- SECURITY DEFINER pra poder contar mesmo sem policy de select --
-- devolve só total por slug (nunca dado individual). Chamada pelo
-- admin/links-bio.vue do meubairro-app, via o client `supabaseSite`
-- (anon key) que esse app já usa pra ler `noticias` daqui.
create function public.contar_cliques_links_bio(p_desde timestamptz default null)
returns table(link_slug text, total bigint)
language sql
security definer
set search_path = public
as $$
  select link_slug, count(*) as total
  from links_bio_cliques
  where p_desde is null or criado_em >= p_desde
  group by link_slug
  order by total desc;
$$;

grant execute on function public.contar_cliques_links_bio(timestamptz) to anon, authenticated;
