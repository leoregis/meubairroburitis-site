-- Jogos iniciais de /games (pedido do Leo, 20/11/2026). Textos, status e
-- imagens são editáveis depois pela aba Games do admin; imagens ficam em
-- branco (o Leo sobe pelo admin; a página mostra um placeholder com o nome).
-- Links 1 e 2 conferidos em 20/11/2026 (HTTP 200) antes de gravar como
-- publicado.
--
-- Rollback: manutencao/20261120_games_rollback.sql (some junto com a tabela).

insert into public.games (slug, nome, descricao, link_url, status, ordem) values
  ('meu-bairro-buritis-o-jogo', 'Meu Bairro Buritis – O Jogo',
   'Explore o Buritis e o Estoril com o Buri: trabalhe, cuide da sua casa, conheça os comércios reais do bairro e cumpra missões.',
   'https://jogo.meubairroburitis.com.br', 'publicado', 1),
  ('bambaz', 'Bambaz',
   'Duelo de cartas com personagens do folclore, da TV, do futebol e da música brasileira. Monte seu deck e dispute partidas rápidas.',
   'https://bambaz.com.br', 'publicado', 2),
  ('clube-do-buraco', 'Clube do Buraco',
   'O clássico buraco em duplas, com parceiro e adversários, direto no celular.',
   null, 'em_breve', 3),
  ('game-dev-br', 'Game Dev BR',
   'Comande sua própria produtora de games no Brasil e atravesse décadas da história dos videogames.',
   null, 'em_breve', 4)
on conflict (slug) do nothing;
