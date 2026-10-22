-- Rollback de migrations/20261022110000_pedidos_central_anteriores.sql: tira o
-- acompanhamento criado pelo site para os pedidos anteriores (só os que ainda não
-- receberam a projeção da Central) e os itens deles ainda não enviados da fila. O que
-- a Central já recebeu fica lá (desfazer na Central, se for o caso).
-- Linhas pontuais (marcadas como anteriores na fila), não em massa; em produção,
-- conferir a contagem antes.
begin;

delete from public.acompanhamento_pedidos a
using public.pedidos_central_fila f
where f.anterior and a.chave = 'site:' || f.pedido_id and not a.da_central;

delete from public.pedidos_central_fila where anterior and enviado_em is null;

commit;
