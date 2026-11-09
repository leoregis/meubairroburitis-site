// Capas das notícias (redesign, fase 3): o original no Storage é PNG/JPG de
// 1-2 MB. O IPX gera no BUILD três larguras em WebP (480, 800 e 1200, na
// proporção 1200x630 do og:image), que viram arquivos estáticos em _ipx/ --
// sem custo do Supabase e sem chamada a ele em tempo de execução. Toda
// navegador atual lê WebP (sem fallback de propósito: 3 arquivos por capa,
// não 6).
//
// Capa do Storage do site -> apelido /capas (nuxt.config.ts, image.alias);
// capa local (/conteudo/...) -> direto; qualquer outra origem -> sem
// transformação (o IPX recusaria e o link ficaria quebrado).

export const LARGURAS_CAPA = [480, 800, 1200]
export const PROPORCAO_CAPA = 1200 / 630

const BASE_STORAGE = 'https://peusailkyxqbhgdgmqyk.supabase.co/storage/v1/object/public/'

export interface CapaNoticia {
  src: string
  srcset?: string
  // a imagem passou pelo IPX (tem as 3 larguras)
  otimizada: boolean
}

export function useCapaNoticia() {
  const img = useImage()

  return function capa(url: string | null | undefined): CapaNoticia | null {
    if (!url) return null
    let origem: string | null = null
    if (url.startsWith('/')) origem = url
    else if (url.startsWith(BASE_STORAGE)) origem = `/capas/${url.slice(BASE_STORAGE.length)}`
    if (!origem) return { src: url, otimizada: false }

    const opcoes = (w: number) => ({ width: w, height: Math.round(w / PROPORCAO_CAPA), fit: 'cover', format: 'webp', quality: 70 })
    return {
      src: img(origem, opcoes(800)),
      srcset: LARGURAS_CAPA.map((w) => `${img(origem, opcoes(w))} ${w}w`).join(', '),
      otimizada: true,
    }
  }
}
