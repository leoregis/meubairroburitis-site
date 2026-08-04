-- Reaproveita a tabela `noticias` pro conteúdo evergreen de SEO de cauda
-- longa (guias/dicas -- rota /conteudo, já reservada) em vez de criar uma
-- tabela e um admin CRUD paralelos: mesmo editor Tiptap, mesmas políticas
-- de RLS, mesmos campos de SEO. Uma coluna simples separa os dois tipos de
-- conteúdo na listagem pública e no admin.
alter table public.noticias
  add column tipo text not null default 'noticia' check (tipo in ('noticia', 'conteudo'));
