-- Página pública /games ("MB Buritis Games") e aba Games do admin (pedido do
-- Leo, 20/11/2026).
--
-- Mesmo padrão de notícias/produtos:
--   - RLS com is_admin() (admins.ativo) para gravar; leitura pública só do que
--     aparece no site (publicado e em_breve; rascunho nunca).
--   - Republicação pela fila de deploy: o trigger registra em deploy_fila_itens
--     o que mudou de PÚBLICO (tipo 'game'); o admin chama disparar_deploy como
--     nas notícias e o build incremental regera só /games
--     (scripts/incremental/rotas-afetadas.mjs).
--   - Imagens no bucket público "games" (escrita só admin), redimensionadas no
--     build pelo IPX (apelido /capas do nuxt.config.ts).
--
-- updated_at: o projeto não usa trigger de "atualizado em" (notícias e
-- produtos gravam a data pelo admin); aqui também é o admin que grava.
--
-- Rollback: manutencao/20261120_games_rollback.sql

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text not null,
  imagem_url text,
  imagem_alt text,
  link_url text,
  status text not null default 'rascunho'
    check (status in ('publicado', 'em_breve', 'rascunho')),
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index games_status_ordem_idx on public.games (status, ordem);

alter table public.games enable row level security;

-- permissões explícitas (o padrão do schema daria tudo a anon)
revoke all on public.games from public, anon, authenticated;
grant select on public.games to anon;
grant select, insert, update, delete on public.games to authenticated;
grant all on public.games to service_role;

create policy "games_select_public"
  on public.games for select
  to anon, authenticated
  using (status in ('publicado', 'em_breve'));

create policy "games_select_admin"
  on public.games for select
  to authenticated
  using (is_admin());

create policy "games_insert_admin"
  on public.games for insert
  to authenticated
  with check (is_admin());

create policy "games_update_admin"
  on public.games for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "games_delete_admin"
  on public.games for delete
  to authenticated
  using (is_admin());

-- ------------------------------------------------ fila de deploy (item 'game')
-- Público = publicado ou em_breve (os dois aparecem em /games). Rascunho que
-- continua rascunho não gera item.
create function public.deploy_fila_item_game()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_antes boolean := tg_op in ('UPDATE', 'DELETE') and old.status in ('publicado', 'em_breve');
  v_depois boolean := tg_op in ('INSERT', 'UPDATE') and new.status in ('publicado', 'em_breve');
begin
  if not v_antes and not v_depois then
    return null;
  end if;

  if v_depois and not v_antes then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug)
    values ('game', 'nova', new.id::text, new.slug);
  elsif v_antes and not v_depois then
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug)
    values ('game', 'removida', old.id::text, old.slug);
  else
    insert into public.deploy_fila_itens (tipo, acao, ref_id, slug, slug_antigo)
    values ('game', 'editada', new.id::text, new.slug, nullif(old.slug, new.slug));
  end if;
  return null;
end;
$$;

-- função nova nasce fechada (só postgres/service_role); trigger não precisa
-- de EXECUTE de quem grava
revoke all on function public.deploy_fila_item_game() from public, anon, authenticated;

create trigger trg_deploy_fila_item_game
after insert or update or delete on public.games
for each row execute function public.deploy_fila_item_game();

-- ------------------------------------------------------------------ storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('games', 'games', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
  on conflict (id) do nothing;

-- bucket público: a URL pública funciona sem policy de SELECT. A de SELECT
-- fica só para admin (listar e apagar pela API exigem leitura), e o público
-- não consegue listar o bucket.
create policy "games_imagens_select_admin"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'games' and is_admin());

create policy "games_imagens_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'games' and is_admin());

create policy "games_imagens_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'games' and is_admin())
  with check (bucket_id = 'games' and is_admin());

create policy "games_imagens_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'games' and is_admin());
