-- Crédito da foto de capa das notícias (redesign, pedido do Leo em 29/10/2026).
-- Coluna opcional: a matéria mostra "Foto: <crédito>" só quando preenchida;
-- o admin ganha o campo em criar/editar notícia. Nenhum valor é preenchido
-- aqui. A tabela já tem grant de tabela para anon/authenticated e RLS por
-- linha (status = 'publicado'), então a coluna nova segue as mesmas regras.
-- ALTER TABLE não dispara o trigger de fila de deploy (é por linha).
-- Volta em manutencao/20261029_noticias_credito_foto_rollback.sql.
begin;

alter table public.noticias add column if not exists imagem_destaque_credito text;

comment on column public.noticias.imagem_destaque_credito is
  'Crédito da foto de capa (opcional). Exibido como "Foto: <crédito>" na matéria.';

commit;
