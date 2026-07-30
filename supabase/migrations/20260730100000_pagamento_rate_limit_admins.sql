-- Admins (necessário existir e ter policy própria ANTES de is_admin() ser
-- usado em qualquer outra policy — sem isso, a subconsulta de is_admin()
-- roda como `authenticated`, sujeita a RLS, e sem policy de select nunca
-- enxerga nenhuma linha, mesmo pra um admin de verdade).
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy "admin_ve_propria_linha"
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql security definer stable set search_path to 'public' as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid() and ativo = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Pedidos (histórico de vendas). Toda escrita passa pela edge function
-- `criar_pagamento`/`mp_webhook` com service_role (bypassa RLS) — nenhuma
-- policy de insert/update/delete é criada pra anon/authenticated de
-- propósito. Leitura só pro admin autenticado.
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  nome_comprador text not null,
  telefone_comprador text not null,
  email_comprador text,
  itens jsonb not null,
  valor_total_centavos integer not null,
  metodo_pagamento text not null check (metodo_pagamento in ('pix', 'cartao')),
  status text not null default 'pendente'
    check (status in ('pendente', 'pago', 'recusado', 'cancelado')),
  mp_payment_id text,
  idempotency_key text not null unique,
  criado_em timestamptz not null default now(),
  pago_em timestamptz
);

alter table public.pedidos enable row level security;

create policy "pedidos_select_admin"
  on public.pedidos
  for select
  to authenticated
  using (public.is_admin());

-- Rate limit do endpoint de checkout (mesmo desenho de rate_limit_indicar
-- já provado no app do bairro) — chave genérica (IP ou id de sessão do
-- client), sem nenhuma policy pra anon/authenticated: só as funções
-- SECURITY DEFINER abaixo (chamadas com service_role dentro da edge
-- function) tocam esta tabela.
create table public.rate_limit_pagamento (
  chave text primary key,
  tentativas integer not null default 0,
  bloqueado_ate timestamptz,
  atualizado_em timestamptz not null default now()
);

alter table public.rate_limit_pagamento enable row level security;

create or replace function public.checar_bloqueio_pagamento(p_chave text)
returns timestamptz
language sql security definer stable set search_path to 'public' as $$
  select bloqueado_ate from public.rate_limit_pagamento
  where chave = p_chave and bloqueado_ate > now();
$$;

create or replace function public.registrar_tentativa_pagamento(p_chave text, p_sucesso boolean)
returns void
language plpgsql security definer set search_path to 'public' as $$
begin
  insert into public.rate_limit_pagamento (chave, tentativas, bloqueado_ate, atualizado_em)
  values (p_chave, case when p_sucesso then 0 else 1 end, null, now())
  on conflict (chave) do update set
    tentativas = case when p_sucesso then 0 else rate_limit_pagamento.tentativas + 1 end,
    bloqueado_ate = case
      when p_sucesso then null
      when rate_limit_pagamento.tentativas + 1 >= 5 then now() + interval '1 hour'
      else rate_limit_pagamento.bloqueado_ate
    end,
    atualizado_em = now();
end;
$$;

grant execute on function public.checar_bloqueio_pagamento(text) to service_role;
grant execute on function public.registrar_tentativa_pagamento(text, boolean) to service_role;
