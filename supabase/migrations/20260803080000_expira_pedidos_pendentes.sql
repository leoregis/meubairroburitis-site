-- Pedidos "pendente" que nunca são pagos (bot/spam testando o checkout,
-- ou gente que desistiu) ficavam acumulando pra sempre na tela de vendas.
-- QR code PIX do Mercado Pago já expira sozinho por volta de 24h quando
-- criado sem date_of_expiration explícito, então marcar como "cancelado"
-- depois desse prazo não invalida nenhum pagamento que ainda seria possível.
create extension if not exists pg_cron with schema extensions;

create or replace function public.expirar_pedidos_pendentes()
returns void
language sql
security definer
set search_path = public
as $$
  update public.pedidos
  set status = 'cancelado'
  where status = 'pendente'
    and criado_em < now() - interval '24 hours';
$$;

select cron.schedule(
  'expirar-pedidos-pendentes',
  '0 * * * *', -- de hora em hora
  $$select public.expirar_pedidos_pendentes();$$
);
