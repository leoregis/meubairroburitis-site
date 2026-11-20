-- Volta das migrations 20261120120000_games e 20261120121000_games_seed
-- (/games e aba Games do admin, 20/11/2026).
--
-- DESTRUTIVO: apaga a tabela public.games (com os jogos cadastrados), as
-- policies do bucket "games" e o próprio bucket. Rodar só com ok do Leo.
--
-- Antes de rodar:
--   1) Esvaziar o bucket "games" pela API do Storage (painel do Supabase >
--      Storage > games > selecionar tudo > Delete). O Supabase não deixa
--      apagar storage.objects direto por SQL, e o bucket só sai vazio.
--   2) Se quiser guardar os jogos: create table public.games_bkp_AAAAMMDD as
--      select * from public.games;
--
-- Depois: tirar /games do nuxt.config.ts (prerender.routes) e o tipo 'game'
-- de scripts/incremental/rotas-afetadas.mjs, ou reverter o commit da página.

begin;

drop trigger if exists trg_deploy_fila_item_game on public.games;
drop function if exists public.deploy_fila_item_game();
drop table if exists public.games;

drop policy if exists "games_imagens_select_admin" on storage.objects;
drop policy if exists "games_imagens_insert_admin" on storage.objects;
drop policy if exists "games_imagens_update_admin" on storage.objects;
drop policy if exists "games_imagens_delete_admin" on storage.objects;
delete from storage.buckets where id = 'games';

-- itens da fila ainda pendentes deste tipo (o rotas-afetadas.mjs sem 'game'
-- mandaria o próximo deploy para o modo completo)
delete from public.deploy_fila_itens where tipo = 'game' and atendido_em is null;

delete from supabase_migrations.schema_migrations
 where version in ('20261120120000', '20261120121000');

commit;
