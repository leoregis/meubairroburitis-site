-- Admin de produtos: CRUD completo pelo painel (/admin/produtos), com o
-- mesmo padrão is_admin() já usado em pedidos/admins. Público continua só
-- enxergando produtos ativos (policy já existente); admin enxerga e edita
-- tudo, inclusive rascunhos (ativo = false).

create policy "produtos_select_admin"
  on public.produtos for select
  to authenticated
  using (is_admin());

create policy "produtos_insert_admin"
  on public.produtos for insert
  to authenticated
  with check (is_admin());

create policy "produtos_update_admin"
  on public.produtos for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "produtos_delete_admin"
  on public.produtos for delete
  to authenticated
  using (is_admin());
