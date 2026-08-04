export const NOTICIAS_POR_PAGINA = 12

export interface Noticia {
  id: string
  titulo: string
  subtitulo: string | null
  slug: string
  conteudo: string
  imagem_destaque_url: string | null
  imagem_destaque_alt: string | null
  categoria: string | null
  autor: string | null
  tipo: 'noticia' | 'conteudo'
  status: 'rascunho' | 'publicado'
  data_publicacao: string | null
  seo_meta_titulo: string | null
  seo_meta_descricao: string | null
  seo_imagem_og: string | null
  seo_palavras_chave: string | null
}

export function useNoticiasPagina(pagina: number) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`noticias-pagina-${pagina}`, async () => {
    if (!$supabase) return { itens: [] as Noticia[], totalPaginas: 1 }

    const de = (pagina - 1) * NOTICIAS_POR_PAGINA
    const ate = de + NOTICIAS_POR_PAGINA - 1

    const { data, count, error } = await $supabase
      .from('noticias')
      .select('*', { count: 'exact' })
      .eq('status', 'publicado')
      .eq('tipo', 'noticia')
      .order('data_publicacao', { ascending: false })
      .range(de, ate)

    if (error) throw error

    const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / NOTICIAS_POR_PAGINA))

    return { itens: (data ?? []) as Noticia[], totalPaginas }
  })
}

export function useNoticia(slug: string) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`noticia-${slug}`, async () => {
    if (!$supabase) return null

    const { data, error } = await $supabase
      .from('noticias')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'publicado')
      .eq('tipo', 'noticia')
      .maybeSingle()

    if (error) throw error
    return data as Noticia | null
  })
}

export function formatarDataNoticia(data: string | null) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}
