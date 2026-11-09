// Foto de destaque da página da empresa (redesign, fase 4): é a 1ª foto da
// galeria, que vem do Storage do Guia sem redimensionar (100-300 KB) e é o
// LCP da página. O IPX gera no BUILD uma versão de 960x540 em WebP (uma
// largura só: ~490 empresas com foto -> ~490 arquivos). Logos e fotos de
// prestador também passam (192x192, ~715 arquivos): na listagem, os
// originais de até 300 KB somavam ~3,8 MB por página. O resto da galeria
// continua direto do Storage, com carregamento sob demanda. Apelido /guia-fotos no
// nuxt.config.ts (mesmo motivo do /capas: sem "https:" no caminho).

// Logos de empresa e fotos de prestador: um tamanho só (192x192), usado na
// listagem (56px) e no detalhe (72-112px) -- o mesmo arquivo serve aos dois.
export const MINIATURA_GUIA = 192

const BASE_GUIA = 'https://xtmwatregednbuupfdbl.supabase.co/storage/v1/object/public/'

export function useFotoGuia() {
  const img = useImage()

  return function foto(url: string | null | undefined, largura = 960, altura = 540): string | null {
    if (!url) return null
    if (!url.startsWith(BASE_GUIA)) return url
    return img(`/guia-fotos/${url.slice(BASE_GUIA.length)}`, { width: largura, height: altura, fit: 'cover', format: 'webp', quality: 70 })
  }
}
