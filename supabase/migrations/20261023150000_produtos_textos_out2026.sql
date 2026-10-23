-- Textos dos produtos revisados pelo Leo (23/10/2026):
--   mbb-basic / mbb-premium: composição (Basic 4 Stories + 1 Colab = 5 aparições;
--   Premium 8 Stories + 2 Colabs = 10 aparições) e descrições novas;
--   producao-de-video-reels: sem Twitter na lista de redes, prazo "7 dias após a
--   gravação" (sem "úteis").
-- Valores anteriores em produtos_bkp_20261023; volta em
-- manutencao/20261023_produtos_textos_out2026_rollback.sql.
begin;

create table public.produtos_bkp_20261023 as
select id, slug, descricao_curta, descricao, now() as copiado_em
from public.produtos
where slug in ('mbb-basic', 'mbb-premium', 'producao-de-video-reels');

-- backup não é lido pela API
alter table public.produtos_bkp_20261023 enable row level security;
revoke all on public.produtos_bkp_20261023 from anon, authenticated;

update public.produtos set
  descricao_curta = '5 aparições por mês: 1 Story por semana + 1 Colab. Sua marca sempre lembrada no bairro.',
  descricao = E'Quem é visto toda semana é lembrado na hora da compra. Com o MBB Basic, sua empresa aparece de forma constante para os moradores do Buritis e do Estoril, sem pesar no orçamento.\n\nInclui, por mês:\n- 4 Stories no nosso Instagram, 1 por semana, nas datas e horários que você escolher\n- 1 Colab: seu Reels publicado em parceria com o @meubairroburitis e exibido também para os nossos seguidores\n\nIdeal para quem quer construir presença no bairro com investimento acessível. O conteúdo é enviado por você, pronto para publicar.'
where slug = 'mbb-basic';

update public.produtos set
  descricao_curta = '10 aparições por mês: 2 Stories por semana + 2 Colabs. Presença forte para ser a referência do bairro.',
  descricao = E'Para quem quer ser a primeira lembrança do morador quando ele precisa do que você oferece. O MBB Premium dobra a frequência do Basic e coloca sua marca no dia a dia de quem vive o Buritis e o Estoril.\n\nInclui, por mês:\n- 8 Stories no nosso Instagram, 2 por semana, nas datas e horários que você escolher\n- 2 Colabs, 1 a cada 15 dias: seu Reels publicado em parceria com o @meubairroburitis e exibido também para os nossos seguidores\n\nIdeal para lançamentos, negócios em crescimento e mercados disputados, que precisam de presença constante. O conteúdo é enviado por você, pronto para publicar.'
where slug = 'mbb-premium';

update public.produtos set
  descricao = 'Produção de um vídeo comercial de até 1 minuto por conta da equipe Meu Bairro Buritis. Garante 1 post Reels no Instagram, TikTok e grupos do Facebook, WhatsApp e Telegram. Inclui apresentadora, captação profissional e edição de alta qualidade. Entrega em até 7 dias após a gravação.'
where slug = 'producao-de-video-reels';

commit;
