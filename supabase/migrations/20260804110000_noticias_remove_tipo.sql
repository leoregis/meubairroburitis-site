-- Reversão: a separação notícia/conteúdo (introduzida em
-- 20260804090000_noticias_add_tipo_conteudo.sql) foi descartada por decisão
-- do usuário -- tudo volta a ser um tipo só de conteúdo ("notícia"), rota
-- /conteudo volta a ser só o stub reservado "em breve".
alter table public.noticias
  drop column tipo;
