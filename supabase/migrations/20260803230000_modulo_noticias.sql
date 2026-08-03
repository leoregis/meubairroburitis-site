-- Módulo de notícias do site institucional. Reaproveita is_admin()/admins
-- já existentes (mesmo padrão de produtos/pedidos) -- sem tabela de
-- categorias (texto livre, volume esperado não justifica uma tabela à
-- parte) nem FK de autor (texto livre, admin pré-preenche com o próprio
-- nome mas pode trocar).
create table public.noticias (
  id uuid primary key default gen_random_uuid(),

  titulo text not null,
  subtitulo text,
  slug text unique not null,
  conteudo text not null default '',        -- HTML gerado pelo Tiptap, sanitizado antes de salvar

  imagem_destaque_url text,
  imagem_destaque_alt text,

  categoria text,
  autor text,

  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicado')),
  data_publicacao timestamptz,

  -- SEO -- cada um cai pro campo de exibição equivalente se vazio (fallback
  -- resolvido no front, não aqui): seo_meta_titulo -> titulo,
  -- seo_meta_descricao -> subtitulo, seo_imagem_og -> imagem_destaque_url
  seo_meta_titulo text,
  seo_meta_descricao text,
  seo_imagem_og text,
  seo_palavras_chave text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index noticias_status_data_idx
  on public.noticias (status, data_publicacao desc);

alter table public.noticias enable row level security;

create policy "noticias_select_public"
  on public.noticias for select
  to anon, authenticated
  using (status = 'publicado');

create policy "noticias_select_admin"
  on public.noticias for select
  to authenticated
  using (is_admin());

create policy "noticias_insert_admin"
  on public.noticias for insert
  to authenticated
  with check (is_admin());

create policy "noticias_update_admin"
  on public.noticias for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "noticias_delete_admin"
  on public.noticias for delete
  to authenticated
  using (is_admin());

-- Storage: bucket próprio pra imagens de notícia (produtos usa arquivo
-- estático commitado no repo; aqui é upload de verdade via admin)
insert into storage.buckets (id, name, public)
  values ('noticias-imagens', 'noticias-imagens', true)
  on conflict (id) do nothing;

create policy "noticias_imagens_leitura_publica"
  on storage.objects for select
  to public
  using (bucket_id = 'noticias-imagens');

create policy "noticias_imagens_escrita_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'noticias-imagens' and is_admin());

create policy "noticias_imagens_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'noticias-imagens' and is_admin());

create policy "noticias_imagens_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'noticias-imagens' and is_admin());
