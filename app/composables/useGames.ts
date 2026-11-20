// /games ("MB Buritis Games", 20/11/2026): jogos lidos do banco do SITE no
// build (prerender), como as notícias -- nada é buscado no navegador. A RLS
// só entrega publicado e em_breve à chave anônima; o filtro abaixo repete
// isso por clareza.

export type StatusGame = 'publicado' | 'em_breve' | 'rascunho'

export interface Game {
  id: string
  slug: string
  nome: string
  descricao: string
  imagem_url: string | null
  imagem_alt: string | null
  link_url: string | null
  status: StatusGame
  ordem: number
}

export const LIMITE_DESCRICAO_GAME = 200

export function useGames() {
  const obterSupabase = useSupabaseSite()

  return useAsyncData('games', async () => {
    const $supabase = await obterSupabase()
    if (!$supabase) return [] as Game[]

    const { data, error } = await $supabase
      .from('games')
      .select('id, slug, nome, descricao, imagem_url, imagem_alt, link_url, status, ordem')
      .in('status', ['publicado', 'em_breve'])
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true })

    if (error) throw error
    return (data ?? []) as Game[]
  })
}

// card clicável: só publicado e com link
export function linkDoGame(game: Pick<Game, 'status' | 'link_url'>): string | null {
  return game.status === 'publicado' && game.link_url ? game.link_url : null
}

export function linkExterno(url: string) {
  return /^https?:\/\//i.test(url) && !/^https?:\/\/(www\.)?meubairroburitis\.com\.br(\/|$)/i.test(url)
}

// Imagem 16:9 do card. Do Storage do site -> IPX no build (apelido /capas do
// nuxt.config.ts), três larguras em WebP, arquivos estáticos em _ipx/. No
// admin (sem IPX em tempo de execução) usar a URL original.
const LARGURAS = [480, 800, 1200]
const BASE_STORAGE = 'https://peusailkyxqbhgdgmqyk.supabase.co/storage/v1/object/public/'

export function useImagemGame() {
  const img = useImage()
  return function imagem(url: string | null | undefined) {
    if (!url) return null
    if (!url.startsWith(BASE_STORAGE)) return { src: url, srcset: undefined as string | undefined }
    const origem = `/capas/${url.slice(BASE_STORAGE.length)}`
    const opcoes = (w: number) => ({ width: w, height: Math.round((w * 9) / 16), fit: 'cover', format: 'webp', quality: 75 })
    return {
      src: img(origem, opcoes(800)),
      srcset: LARGURAS.map((w) => `${img(origem, opcoes(w))} ${w}w`).join(', '),
    }
  }
}

// og:image/JSON-LD: JPEG 1200x675 gerado no build (URL absoluta)
export function useImagemGameAbsoluta() {
  const img = useImage()
  return function imagem(url: string | null | undefined) {
    if (!url) return undefined
    if (!url.startsWith(BASE_STORAGE)) return url
    const origem = `/capas/${url.slice(BASE_STORAGE.length)}`
    return `https://meubairroburitis.com.br${img(origem, { width: 1200, height: 675, fit: 'cover', format: 'jpeg', quality: 80 })}`
  }
}

// caminho do arquivo no bucket "games" a partir da URL pública (para apagar)
export function caminhoNoBucketGames(url: string | null | undefined): string | null {
  const prefixo = `${BASE_STORAGE}games/`
  if (!url || !url.startsWith(prefixo)) return null
  return decodeURIComponent(url.slice(prefixo.length))
}
