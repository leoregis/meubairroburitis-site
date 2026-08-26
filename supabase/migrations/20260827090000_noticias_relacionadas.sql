-- Fase 3 da reestruturação editorial de Notícias -- bloco "Leia também".
-- Curado manualmente a partir da matriz de linkagem aprovada (Fase 3), não
-- calculado automaticamente por categoria -- por isso é uma tabela própria,
-- não uma query dinâmica. Populado à parte deste arquivo (dados de
-- conteúdo, não schema).
create table public.noticias_relacionadas (
  noticia_id uuid not null references public.noticias(id) on delete cascade,
  relacionada_id uuid not null references public.noticias(id) on delete cascade,
  ordem int not null default 0,
  primary key (noticia_id, relacionada_id),
  check (noticia_id <> relacionada_id)
);

alter table public.noticias_relacionadas enable row level security;

create policy "noticias_relacionadas_select_public"
  on public.noticias_relacionadas for select
  to anon, authenticated
  using (true);

create policy "noticias_relacionadas_insert_admin"
  on public.noticias_relacionadas for insert
  to authenticated
  with check (is_admin());

create policy "noticias_relacionadas_update_admin"
  on public.noticias_relacionadas for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "noticias_relacionadas_delete_admin"
  on public.noticias_relacionadas for delete
  to authenticated
  using (is_admin());
