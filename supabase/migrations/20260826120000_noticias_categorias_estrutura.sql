-- Fase 1 da reestruturação editorial de Notícias (plano de 6 fases,
-- aprovado por etapa). Adiciona categorias fixas + subcategorias de Guias
-- + campos de tipo de conteúdo/revisão editorial. NÃO remove nem altera
-- nenhuma coluna existente -- `categoria` (texto livre), `autor` e
-- `atualizado_em` continuam exatamente como estavam, intactas, enquanto a
-- migração de dados pra essas colunas novas não acontece (Fase 2, artigo
-- por artigo, com aprovação manual -- nunca classificação automática
-- direto no banco).

create table public.noticias_categorias (
  id text primary key,
  rotulo text not null,
  ordem int not null default 0
);

create table public.noticias_subcategorias_guia (
  id text primary key,
  rotulo text not null,
  ordem int not null default 0
);

-- 10 categorias fixas + "Guias" como 11ª (é a única com subcategorias,
-- por isso o pedido original a separou do resto -- mas estruturalmente é
-- só mais um valor de categoria_id).
insert into public.noticias_categorias (id, rotulo, ordem) values
  ('bairro', 'Notícias do Bairro', 1),
  ('seguranca', 'Segurança', 2),
  ('mobilidade-urbanismo', 'Mobilidade e Urbanismo', 3),
  ('servicos-publicos', 'Serviços Públicos', 4),
  ('comercio-negocios', 'Comércio e Negócios', 5),
  ('gastronomia-lazer', 'Gastronomia e Lazer', 6),
  ('cultura-historia-memoria', 'Cultura, História e Memória', 7),
  ('esportes-eventos', 'Esportes e Eventos', 8),
  ('pessoas-comunidade', 'Pessoas e Comunidade', 9),
  ('opiniao', 'Opinião', 10),
  ('guias', 'Guias', 11);

insert into public.noticias_subcategorias_guia (id, rotulo, ordem) values
  ('alimentacao', 'Alimentação', 1),
  ('comercio', 'Comércio', 2),
  ('servicos', 'Serviços', 3),
  ('saude', 'Saúde', 4),
  ('educacao', 'Educação', 5),
  ('beleza-estetica', 'Beleza e Estética', 6),
  ('pets', 'Pets', 7),
  ('criancas-familia', 'Crianças e Família', 8),
  ('lazer', 'Lazer', 9),
  ('esportes', 'Esportes', 10),
  ('parques-espacos-publicos', 'Parques e Espaços Públicos', 11),
  ('moradia', 'Moradia', 12),
  ('transporte-mobilidade', 'Transporte e Mobilidade', 13);

alter table public.noticias_categorias enable row level security;
alter table public.noticias_subcategorias_guia enable row level security;

create policy "noticias_categorias_select_public"
  on public.noticias_categorias for select
  to anon, authenticated
  using (true);

create policy "noticias_categorias_insert_admin"
  on public.noticias_categorias for insert
  to authenticated
  with check (is_admin());

create policy "noticias_categorias_update_admin"
  on public.noticias_categorias for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "noticias_categorias_delete_admin"
  on public.noticias_categorias for delete
  to authenticated
  using (is_admin());

create policy "noticias_subcategorias_guia_select_public"
  on public.noticias_subcategorias_guia for select
  to anon, authenticated
  using (true);

create policy "noticias_subcategorias_guia_insert_admin"
  on public.noticias_subcategorias_guia for insert
  to authenticated
  with check (is_admin());

create policy "noticias_subcategorias_guia_update_admin"
  on public.noticias_subcategorias_guia for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "noticias_subcategorias_guia_delete_admin"
  on public.noticias_subcategorias_guia for delete
  to authenticated
  using (is_admin());

-- Colunas novas em `noticias` -- todas nullable/com default seguro, não
-- exigem backfill pra continuar funcionando.
alter table public.noticias
  add column categoria_id text references public.noticias_categorias(id),
  add column subcategoria_guia_id text references public.noticias_subcategorias_guia(id),
  add column tipo_conteudo text not null default 'nao_classificado'
    check (tipo_conteudo in ('reportagem', 'guia', 'opiniao', 'patrocinado', 'nao_classificado')),
  -- nullable de propósito -- só o admin marca quando é revisão editorial
  -- real, diferente de `atualizado_em` (que já existe e é tocada em toda
  -- edição, inclusive correção de typo -- essa coluna nova não substitui
  -- aquela, é usada só pro bloco "Sobre este conteúdo" no front)
  add column atualizado_em_editorial timestamptz,
  -- só faz sentido pra tipo_conteudo = 'guia' (endereço/preço muda,
  -- notícia factual não)
  add column ultima_verificacao timestamptz;

-- subcategoria só pode ser preenchida quando a categoria é 'guias'
alter table public.noticias
  add constraint noticias_subcategoria_so_em_guias
  check (subcategoria_guia_id is null or categoria_id = 'guias');

create index noticias_categoria_id_idx on public.noticias (categoria_id);
