// Prévia do redesign (MBB_PREVIA=1, deploy/previa/): o site é gerado com as
// chaves anon da PRODUÇÃO para mostrar dados reais, então nada que grava
// pode rodar lá (regra: nenhum teste deixa registro em produção). As
// travas ficam nas páginas que chamam escrita -- carrinho (criar_pagamento),
// /meus-pedidos (meus_pedidos_codigo) e /links (links_bio_cliques) -- e o
// _headers da prévia ainda bloqueia functions/v1 e auth/v1 por CSP.
// Fora da prévia, ehPrevia é sempre false e nada muda.
export const AVISO_PREVIA = 'Prévia do novo site: compras, códigos e registros estão desativados aqui.'

export function usePrevia() {
  const config = useRuntimeConfig()
  return { ehPrevia: Boolean(config.public.previa) }
}
