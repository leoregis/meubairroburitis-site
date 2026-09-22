// Fase 5 -- listagens paginadas de empresas/prestadores com filtro por
// categoria. Mesmo padrão de useNoticiasPagina (app/composables/
// useNoticias.ts): tamanho de página fixo, .range() + count:'exact',
// enumeração das rotas de página em build-time no hook nitro:config.

export const ITENS_POR_PAGINA = 24

export interface EmpresaListagemItem {
  unidade_id: number
  slug: string
  nome: string
  logo_url: string | null
  categoria_id: number | null
  categoria_nome: string | null
  categoria_slug: string | null
  subcategoria_id: number | null
  subcategoria_nome: string | null
  subcategoria_slug: string | null
  endereco: string | null
  nota_media: number
  total_avaliacoes: number
}

export interface PrestadorListagemItem {
  id: number
  slug: string
  nome: string
  descricao_curta: string | null
  foto_url: string | null
  verificado: boolean
  categoria_id: number | null
  categoria_nome: string | null
  categoria_slug: string | null
  subcategoria_id: number | null
  subcategoria_nome: string | null
  subcategoria_slug: string | null
  media_nota: number
  total_avaliacoes: number
}

export interface CategoriaOpcao {
  id: number
  nome: string
  slug: string
}

export function useEmpresasPagina(pagina: number, categoriaSlug?: string) {
  const { $meubairroApp } = useNuxtApp()
  const chave = `empresas-pagina-${pagina}-${categoriaSlug || 'todas'}`

  return useAsyncData(chave, async () => {
    if (!$meubairroApp) return { itens: [] as EmpresaListagemItem[], totalPaginas: 1 }

    const de = (pagina - 1) * ITENS_POR_PAGINA
    const ate = de + ITENS_POR_PAGINA - 1

    let query = $meubairroApp
      .from('vw_empresas_publico_listagem')
      .select('*', { count: 'exact' })
      .order('nome', { ascending: true })

    if (categoriaSlug) query = query.eq('categoria_slug', categoriaSlug)

    const { data, count, error } = await query.range(de, ate)
    if (error) throw error

    const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / ITENS_POR_PAGINA))
    return { itens: (data ?? []) as EmpresaListagemItem[], totalPaginas }
  })
}

export function usePrestadoresPagina(pagina: number, categoriaSlug?: string) {
  const { $meubairroApp } = useNuxtApp()
  const chave = `prestadores-pagina-${pagina}-${categoriaSlug || 'todos'}`

  return useAsyncData(chave, async () => {
    if (!$meubairroApp) return { itens: [] as PrestadorListagemItem[], totalPaginas: 1 }

    const de = (pagina - 1) * ITENS_POR_PAGINA
    const ate = de + ITENS_POR_PAGINA - 1

    let query = $meubairroApp
      .from('vw_prestadores_publico_listagem')
      .select('*', { count: 'exact' })
      .order('nome', { ascending: true })

    if (categoriaSlug) query = query.eq('categoria_slug', categoriaSlug)

    const { data, count, error } = await query.range(de, ate)
    if (error) throw error

    const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / ITENS_POR_PAGINA))
    return { itens: (data ?? []) as PrestadorListagemItem[], totalPaginas }
  })
}

export function useCategoriasEmpresa() {
  const { $meubairroApp } = useNuxtApp()

  return useAsyncData('empresas-categorias-todas-listagem', async () => {
    if (!$meubairroApp) return [] as CategoriaOpcao[]

    const { data, error } = await $meubairroApp
      .from('empresas_categorias')
      .select('id, nome, slug_seo')
      .order('nome')

    if (error) throw error
    return (data ?? []).map((c: any) => ({ id: c.id, nome: c.nome, slug: c.slug_seo })) as CategoriaOpcao[]
  })
}

export function useCategoriasPrestador() {
  const { $meubairroApp } = useNuxtApp()

  return useAsyncData('prestadores-categorias-todas-listagem', async () => {
    if (!$meubairroApp) return [] as CategoriaOpcao[]

    const { data, error } = await $meubairroApp
      .from('categorias')
      .select('id, nome, slug_seo')
      .eq('ativo', true)
      .order('nome')

    if (error) throw error
    return (data ?? []).map((c: any) => ({ id: c.id, nome: c.nome, slug: c.slug_seo })) as CategoriaOpcao[]
  })
}
