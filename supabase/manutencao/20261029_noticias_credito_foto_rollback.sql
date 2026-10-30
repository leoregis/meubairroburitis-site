-- Rollback de migrations/20261029200000_noticias_credito_foto.sql: remove a
-- coluna imagem_destaque_credito. É DROP COLUMN (destrutivo): perguntar ao
-- Leo antes de rodar, e guardar antes os créditos que já tiverem sido
-- preenchidos (o select abaixo mostra quais são).
--
-- select id, slug, imagem_destaque_credito from public.noticias
-- where imagem_destaque_credito is not null;
begin;

alter table public.noticias drop column if exists imagem_destaque_credito;

commit;
