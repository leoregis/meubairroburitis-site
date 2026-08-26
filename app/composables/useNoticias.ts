export const NOTICIAS_POR_PAGINA = 12

// select usado em toda consulta de noticias -- embute o rótulo da
// categoria/subcategoria (Fase 2 da reestruturação editorial) sem exigir
// uma segunda consulta; `categoria` (texto livre, legado) continua intacta.
const SELECT_NOTICIA = `
  *,
  categoria_info:noticias_categorias(id, rotulo),
  subcategoria_info:noticias_subcategorias_guia(id, rotulo)
`

export interface NoticiaCategoria {
  id: string
  rotulo: string
  ordem: number
}

export interface Noticia {
  id: string
  titulo: string
  subtitulo: string | null
  slug: string
  conteudo: string
  imagem_destaque_url: string | null
  imagem_destaque_alt: string | null
  categoria: string | null
  categoria_id: string | null
  subcategoria_guia_id: string | null
  tipo_conteudo: 'reportagem' | 'guia' | 'opiniao' | 'patrocinado' | 'nao_classificado'
  autor: string | null
  status: 'rascunho' | 'publicado'
  data_publicacao: string | null
  atualizado_em_editorial: string | null
  ultima_verificacao: string | null
  seo_meta_titulo: string | null
  seo_meta_descricao: string | null
  seo_imagem_og: string | null
  seo_palavras_chave: string | null
  categoria_info?: NoticiaCategoria | null
  subcategoria_info?: NoticiaCategoria | null
}

export function useNoticiasPagina(pagina: number) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`noticias-pagina-${pagina}`, async () => {
    if (!$supabase) return { itens: [] as Noticia[], totalPaginas: 1 }

    const de = (pagina - 1) * NOTICIAS_POR_PAGINA
    const ate = de + NOTICIAS_POR_PAGINA - 1

    const { data, count, error } = await $supabase
      .from('noticias')
      .select(SELECT_NOTICIA, { count: 'exact' })
      .eq('status', 'publicado')
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
      .select(SELECT_NOTICIA)
      .eq('slug', slug)
      .eq('status', 'publicado')
      .maybeSingle()

    if (error) throw error
    return data as Noticia | null
  })
}

// Fase 2 -- navegação por categoria (clique no eyebrow de categoria)
export function useNoticiasPorCategoria(categoriaId: string) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`noticias-categoria-${categoriaId}`, async () => {
    if (!$supabase) return [] as Noticia[]

    const { data, error } = await $supabase
      .from('noticias')
      .select(SELECT_NOTICIA)
      .eq('status', 'publicado')
      .eq('categoria_id', categoriaId)
      .order('data_publicacao', { ascending: false })

    if (error) throw error
    return (data ?? []) as Noticia[]
  })
}

export function useCategoria(categoriaId: string) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`categoria-${categoriaId}`, async () => {
    if (!$supabase) return null

    const { data, error } = await $supabase
      .from('noticias_categorias')
      .select('*')
      .eq('id', categoriaId)
      .maybeSingle()

    if (error) throw error
    return data as NoticiaCategoria | null
  })
}

export function useCategorias() {
  const { $supabase } = useNuxtApp()

  return useAsyncData('noticias-categorias-todas', async () => {
    if (!$supabase) return [] as NoticiaCategoria[]

    const { data, error } = await $supabase
      .from('noticias_categorias')
      .select('*')
      .order('ordem')

    if (error) throw error
    return (data ?? []) as NoticiaCategoria[]
  })
}

// Fase 2 -- hub de Guias (rota /conteudo, reaproveitada). `subcategoriaId`
// opcional filtra dentro de Guias (ex: só "Alimentação").
export function useGuias(subcategoriaId?: string) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`noticias-guias-${subcategoriaId || 'todos'}`, async () => {
    if (!$supabase) return [] as Noticia[]

    let query = $supabase
      .from('noticias')
      .select(SELECT_NOTICIA)
      .eq('status', 'publicado')
      .eq('tipo_conteudo', 'guia')
      .order('data_publicacao', { ascending: false })

    if (subcategoriaId) query = query.eq('subcategoria_guia_id', subcategoriaId)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Noticia[]
  })
}

export function useSubcategoriasGuia() {
  const { $supabase } = useNuxtApp()

  return useAsyncData('noticias-subcategorias-guia-todas', async () => {
    if (!$supabase) return [] as NoticiaCategoria[]

    const { data, error } = await $supabase
      .from('noticias_subcategorias_guia')
      .select('*')
      .order('ordem')

    if (error) throw error
    return (data ?? []) as NoticiaCategoria[]
  })
}

export function formatarDataNoticia(data: string | null) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}
