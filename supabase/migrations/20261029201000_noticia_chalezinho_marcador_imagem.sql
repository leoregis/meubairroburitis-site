-- Correção de conteúdo (pedido do Leo em 29/10/2026): a matéria
-- chalezinho-fecha-para-reforma-e-ainda-nao-tem-data-para-reabrir tinha no
-- corpo um marcador esquecido, <img src="URL-DA-IMAGEM" alt="...">, que
-- aparecia como imagem quebrada. Só esse <img> sai; o resto do texto fica
-- igual. O trigger trg_deploy_fila_item_noticia põe a matéria na fila de
-- deploy ('editada'), e o site atualiza pelo fluxo normal de publicação.
-- Texto anterior em noticias_bkp_20261029; volta em
-- manutencao/20261029_noticia_chalezinho_marcador_imagem_rollback.sql.
begin;

create table public.noticias_bkp_20261029 as
select id, slug, conteudo, now() as copiado_em
from public.noticias
where slug = 'chalezinho-fecha-para-reforma-e-ainda-nao-tem-data-para-reabrir';

-- backup não é lido pela API
alter table public.noticias_bkp_20261029 enable row level security;
revoke all on public.noticias_bkp_20261029 from anon, authenticated;

update public.noticias
set conteudo = regexp_replace(conteudo, '<img src="URL-DA-IMAGEM"[^>]*>', '')
where slug = 'chalezinho-fecha-para-reforma-e-ainda-nao-tem-data-para-reabrir'
  and conteudo like '%<img src="URL-DA-IMAGEM"%';

commit;
