-- 22/out (fatia 2, decisão do Leo): pedidos pagos desde 01/10/2026, antes da
-- automação, vão para a Central como "anteriores":
--   * ganham o token e o pedido no acompanhamento (o link existe, mas NINGUÉM é
--     avisado: nada de e-mail ou mensagem -- os e-mails só saem pelo mp_webhook);
--   * a Central só LIGA os que já têm venda registrada (link fica disponível para o
--     operador) e manda os demais para "Pedido do site sem venda registrada";
--     nenhum vira venda sozinho.
-- Aplicar depois da Central pronta para receber (central-pedido-site + segredos).
-- Rollback: supabase/manutencao/20261022_pedidos_central_anteriores_rollback.sql

-- Os gatilhos de pedidos só agem na mudança de status/estorno: aqui nada dispara.
update public.pedidos set acompanhamento_token = public.novo_token_acompanhamento()
where status = 'pago' and coalesce(pago_em, criado_em) >= timestamptz '2026-10-01 00:00:00-03' and acompanhamento_token is null;

select public.acompanhamento_do_pedido_site(p) from public.pedidos p
where p.status = 'pago' and coalesce(p.pago_em, p.criado_em) >= timestamptz '2026-10-01 00:00:00-03';

insert into public.pedidos_central_fila (pedido_id, evento, anterior)
select p.id, 'pago', true from public.pedidos p
where p.status = 'pago' and coalesce(p.pago_em, p.criado_em) >= timestamptz '2026-10-01 00:00:00-03'
on conflict (pedido_id, evento) do nothing;
