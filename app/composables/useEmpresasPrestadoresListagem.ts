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
  const obterGuia = useSupabaseGuia()
  const chave = `empresas-pagina-${pagina}-${categoriaSlug || 'todas'}`

  return useAsyncData(chave, async () => {
    const $meubairroApp = await obterGuia()
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
  const obterGuia = useSupabaseGuia()
  const chave = `prestadores-pagina-${pagina}-${categoriaSlug || 'todos'}`

  return useAsyncData(chave, async () => {
    const $meubairroApp = await obterGuia()
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

// Busca nas listagens -- o site é 100% estático, então a busca roda no
// navegador: na primeira interação com o campo carrega UMA vez a view
// inteira (mesma da listagem; ~500 empresas / ~300 prestadores, abaixo do
// limite padrão de 1000 linhas do PostgREST) e filtra localmente, sem
// acento e sem diferenciar maiúscula, exigindo que toda palavra digitada
// apareça em algum dos campos pesquisáveis.
export function normalizarBusca(texto: string | null | undefined) {
  return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function useBuscaDiretorio<T>(view: string, camposPesquisaveis: (item: T) => (string | null)[]) {
  const obterGuia = useSupabaseGuia()
  const termo = ref('')
  const todos = shallowRef<T[] | null>(null)
  const carregando = ref(false)
  const erro = ref(false)

  async function carregar() {
    if (todos.value || carregando.value) return
    carregando.value = true
    erro.value = false
    const $meubairroApp = await obterGuia()
    if (!$meubairroApp) {
      carregando.value = false
      return
    }
    const { data, error } = await $meubairroApp.from(view).select('*').order('nome', { ascending: true })
    carregando.value = false
    if (error) {
      erro.value = true
      return
    }
    todos.value = (data ?? []) as T[]
  }

  watch(termo, (valor) => { if (valor) carregar() })

  const ativo = computed(() => normalizarBusca(termo.value).length >= 2)

  const resultados = computed(() => {
    if (!ativo.value || !todos.value) return []
    const palavras = normalizarBusca(termo.value).split(/\s+/)
    return todos.value.filter((item) => {
      const alvo = normalizarBusca(camposPesquisaveis(item).filter(Boolean).join(' '))
      return palavras.every((p) => alvo.includes(p))
    })
  })

  return { termo, resultados, ativo, carregando, erro, carregar }
}

// Home -- destaques de empresas/prestadores. Mesmas views da listagem (sem
// fonte de dado nova): só quem tem foto, os mais avaliados pelos moradores
// primeiro (desempate pela nota). Busca em build-time, igual o resto da home.
export const QUANTIDADE_DESTAQUE_HOME = 6

// o perfil do próprio Meu Bairro Buritis está cadastrado como empresa no
// app (categoria Tecnologia) -- não faz sentido na vitrine do comércio.
const UNIDADES_FORA_DO_DESTAQUE = [569]

export function useEmpresasDestaqueHome() {
  const obterGuia = useSupabaseGuia()

  return useAsyncData('empresas-destaque-home', async () => {
    const $meubairroApp = await obterGuia()
    if (!$meubairroApp) return [] as EmpresaListagemItem[]

    const { data, error } = await $meubairroApp
      .from('vw_empresas_publico_listagem')
      .select('*')
      .not('logo_url', 'is', null)
      .not('unidade_id', 'in', `(${UNIDADES_FORA_DO_DESTAQUE.join(',')})`)
      .order('total_avaliacoes', { ascending: false })
      .order('nota_media', { ascending: false })
      .limit(QUANTIDADE_DESTAQUE_HOME)

    if (error) throw error
    return (data ?? []) as EmpresaListagemItem[]
  })
}

export function usePrestadoresDestaqueHome() {
  const obterGuia = useSupabaseGuia()

  return useAsyncData('prestadores-destaque-home', async () => {
    const $meubairroApp = await obterGuia()
    if (!$meubairroApp) return [] as PrestadorListagemItem[]

    const { data, error } = await $meubairroApp
      .from('vw_prestadores_publico_listagem')
      .select('*')
      .not('foto_url', 'is', null)
      .order('total_avaliacoes', { ascending: false })
      .order('media_nota', { ascending: false })
      .limit(QUANTIDADE_DESTAQUE_HOME)

    if (error) throw error
    return (data ?? []) as PrestadorListagemItem[]
  })
}

// Home (redesign, fase 2) -- totais de empresas e prestadores e as
// categorias com mais cadastros de cada tipo, para os chips. Só as colunas
// de categoria: o payload leva apenas o resumo, não as ~800 linhas.
export interface CategoriaComTotal { nome: string; slug: string; total: number; tipo: 'empresas' | 'prestadores' }

export function useResumoDiretorioHome(categoriasPorTipo = 4) {
  const obterGuia = useSupabaseGuia()

  return useAsyncData('diretorio-resumo-home', async () => {
    const $meubairroApp = await obterGuia()
    const vazio = { totalEmpresas: 0, totalPrestadores: 0, categorias: [] as CategoriaComTotal[] }
    if (!$meubairroApp) return vazio

    const [empresas, prestadores] = await Promise.all([
      $meubairroApp.from('vw_empresas_publico_listagem').select('categoria_nome, categoria_slug', { count: 'exact' }).range(0, 4999),
      $meubairroApp.from('vw_prestadores_publico_listagem').select('categoria_nome, categoria_slug', { count: 'exact' }).range(0, 4999),
    ])
    if (empresas.error) throw empresas.error
    if (prestadores.error) throw prestadores.error

    function maisFrequentes(linhas: { categoria_nome: string | null; categoria_slug: string | null }[], tipo: CategoriaComTotal['tipo']) {
      const contagem = new Map<string, CategoriaComTotal>()
      for (const l of linhas) {
        if (!l.categoria_slug || !l.categoria_nome) continue
        const c = contagem.get(l.categoria_slug) || { nome: l.categoria_nome, slug: l.categoria_slug, total: 0, tipo }
        c.total++
        contagem.set(l.categoria_slug, c)
      }
      return [...contagem.values()].sort((a, b) => b.total - a.total).slice(0, categoriasPorTipo)
    }

    return {
      totalEmpresas: empresas.count ?? empresas.data?.length ?? 0,
      totalPrestadores: prestadores.count ?? prestadores.data?.length ?? 0,
      categorias: [...maisFrequentes(empresas.data ?? [], 'empresas'), ...maisFrequentes(prestadores.data ?? [], 'prestadores')],
    }
  })
}

export function useCategoriasEmpresa() {
  const obterGuia = useSupabaseGuia()

  return useAsyncData('empresas-categorias-todas-listagem', async () => {
    const $meubairroApp = await obterGuia()
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
  const obterGuia = useSupabaseGuia()

  return useAsyncData('prestadores-categorias-todas-listagem', async () => {
    const $meubairroApp = await obterGuia()
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
