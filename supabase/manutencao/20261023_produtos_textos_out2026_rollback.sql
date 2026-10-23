-- Rollback de migrations/20261023150000_produtos_textos_out2026.sql: volta os
-- textos de mbb-basic, mbb-premium e producao-de-video-reels aos valores
-- guardados em produtos_bkp_20261023. A tabela de backup fica (apagar é DROP:
-- perguntar ao Leo antes). Os textos só mudam no site no próximo deploy.
begin;

update public.produtos p set
  descricao_curta = b.descricao_curta,
  descricao = b.descricao
from public.produtos_bkp_20261023 b
where b.id = p.id;

commit;
