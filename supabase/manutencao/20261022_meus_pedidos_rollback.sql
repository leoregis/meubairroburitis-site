-- Rollback de 20261022120000_meus_pedidos (fatia 3 do "Meus pedidos").
-- Volta a normalização do telefone à definição anterior (20261021220000) e tira
-- as tabelas, funções, coluna, gatilho e job da fatia 3. As sessões e códigos
-- abertos deixam de valer (o cliente volta a usar só o link /pedido/<token>).
-- Destrutivo (DROP): perguntar ao Leo antes de rodar.

select cron.unschedule('meus_pedidos_limpar');

drop function if exists public.meus_pedidos_sair(text);
drop function if exists public.meus_pedidos_listar(text);
drop function if exists public.meus_pedidos_sessao(text);
drop function if exists public.meus_pedidos_validar_codigo(text, text);
drop function if exists public.meus_pedidos_codigo_nao_enviado(bigint);
drop function if exists public.meus_pedidos_preparar_codigo(text, text);
drop function if exists public.meus_pedidos_tem_pedidos(text);
drop function if exists public.meus_pedidos_hmac(text);
drop function if exists public.meus_pedidos_limpar();
drop table if exists public.meus_pedidos_sessoes;
drop table if exists public.meus_pedidos_envios;
drop table if exists public.meus_pedidos_codigos;

drop trigger if exists pedidos_telefone_hash on public.pedidos;
drop function if exists public.pedido_telefone_hash();
alter table public.pedidos drop column if exists telefone_hash;

-- definição anterior (20261021220000_acompanhamento_pedidos)
create or replace function public.acompanhamento_normalizar_telefone(p_telefone text)
returns text
language plpgsql
immutable
set search_path to 'public'
as $$
declare
  d text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
begin
  if d ~ '^55\d{10,11}$' then
    d := substr(d, 3);
  end if;
  if d !~ '^[1-9][1-9]\d{8,9}$' then
    return null;
  end if;
  if length(d) = 10 and substr(d, 3, 1) in ('6', '7', '8', '9') then
    d := substr(d, 1, 2) || '9' || substr(d, 3);
  end if;
  return '55' || d;
end;
$$;

delete from supabase_migrations.schema_migrations where version = '20261022120000';
