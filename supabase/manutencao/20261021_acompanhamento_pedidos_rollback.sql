-- Rollback de migrations/20261021220000_acompanhamento_pedidos.sql: tira o
-- acompanhamento do pedido (os links /pedido/<token> param de abrir).
-- ATENÇÃO: apaga as tabelas (projeções recebidas, links e registro de acessos)
-- e os dois segredos do vault. A Central reenvia tudo se a migration voltar
-- (a conferência da madrugada reenvia todos os pedidos com acompanhamento).
-- Em produção: perguntar ao Leo antes (DROP).
begin;

select cron.unschedule('acompanhamento_limpar_acessos');

drop function public.acompanhamento_por_link(text);
drop function public.acompanhamento_receber(text, jsonb);
drop function public.acompanhamento_conferir(jsonb);
drop function public.acompanhamento_hash_telefone(text);
drop function public.acompanhamento_normalizar_telefone(text);
drop function public.acompanhamento_limpar_acessos();

drop table public.acompanhamento_acessos;
drop table public.acompanhamento_links;
drop table public.acompanhamento_pedidos;

delete from vault.secrets where name in ('acompanhamento_segredo', 'acompanhamento_pepper');

commit;
