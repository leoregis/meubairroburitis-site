-- Rollback de migrations/20261029201000_noticia_chalezinho_marcador_imagem.sql:
-- devolve o corpo da matéria do Chalezinho ao texto guardado em
-- noticias_bkp_20261029 (com o marcador <img src="URL-DA-IMAGEM">). A tabela
-- de backup fica (apagar é DROP: perguntar ao Leo antes). O trigger põe a
-- matéria na fila de deploy de novo.
begin;

update public.noticias n set
  conteudo = b.conteudo
from public.noticias_bkp_20261029 b
where b.id = n.id;

commit;
