-- Preço "de" opcional pra mostrar riscado ao lado do preço atual
-- (produto em promoção). Nullable e sem default -- todo produto já
-- cadastrado continua exibindo só o preço normal, sem mudança de
-- comportamento.
alter table public.produtos
  add column preco_original_centavos integer;

comment on column public.produtos.preco_original_centavos is
  'Preço "de" (riscado) opcional. NULL = sem promoção, mostra só preco_centavos. Preenchido = produto em promoção, mostra riscado + preco_centavos em destaque.';
