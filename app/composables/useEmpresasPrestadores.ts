// Fase 4 -- leitura pública de SEO (empresas/prestadores), via as duas RPCs
// buscar_empresa_publica_seo/buscar_prestador_publico_seo do projeto
// Supabase do meubairro-app (client $meubairroApp, ver
// app/plugins/supabase-meubairro-app.ts). Somente leitura -- nenhuma
// escrita acontece por aqui.

export interface HorarioEmpresa {
  dia_semana: number
  hora_abertura: string | null
  hora_fechamento: string | null
  fechado: boolean
}

export interface EmpresaPublica {
  empresa_id: number
  unidade_id: number
  slug: string
  nome: string
  descricao: string | null
  categoria_nome: string | null
  subcategoria_nome: string | null
  categoria_slug: string | null
  subcategoria_slug: string | null
  logo_url: string | null
  imagem_hero: string | null
  endereco: string | null
  latitude: number | null
  longitude: number | null
  whatsapp: string | null
  telefone: string | null
  website: string | null
  instagram: string | null
  ifood_url: string | null
  horarios: HorarioEmpresa[]
  imagens: string[]
  nota_media: number
  total_avaliacoes: number
  aberto_agora: boolean
  funciona_24h: boolean
  entrega_produtos: boolean
  entrega_no_bairro: boolean
}

export interface PrestadorPublico {
  id: number
  slug: string
  nome: string
  descricao_curta: string | null
  categoria_nome: string | null
  subcategoria_nome: string | null
  categoria_slug: string | null
  subcategoria_slug: string | null
  foto_url: string | null
  verificado: boolean
  destaque: boolean
  bairro_nome: string | null
  telefone: string | null
  exibir_telefone: boolean
  exibir_whatsapp: boolean
  nota_media: number
  total_avaliacoes: number
}

export function useEmpresaPublica(slug: string) {
  const { $meubairroApp } = useNuxtApp()

  return useAsyncData(`empresa-publica-${slug}`, async () => {
    if (!$meubairroApp) return null

    const { data, error } = await $meubairroApp
      .rpc('buscar_empresa_publica_seo', { p_slug: slug })
      .maybeSingle()

    if (error) throw error
    return data as EmpresaPublica | null
  })
}

// Filial = mais de uma unidade ATIVA com o mesmo nome de empresa (07/out,
// Fase C do SEO). Olha empresas_unidades, não a vw_empresas_publico_listagem:
// a view tem DISTINCT ON (empresa_id) e esconde a 2a unidade da mesma
// empresa (ex.: Depósito Ataíde 210/211). Lista inteira buscada UMA vez por
// processo -- no prerender todas as ~500 páginas rodam no mesmo processo,
// então não vira uma consulta por página. Só o booleano vai pro payload.
type ClienteSupabase = NonNullable<ReturnType<typeof useNuxtApp>['$meubairroApp']>
let unidadesAtivasCache: Promise<{ slug: string, nome: string }[]> | null = null

function normalizarNome(nome: string) {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function listarUnidadesAtivas(cliente: ClienteSupabase) {
  unidadesAtivasCache ??= (async () => {
    const { data, error } = await cliente
      .from('empresas_unidades')
      .select('slug, empresas(nome)')
      .eq('ativo', true)
      .range(0, 4999)
    if (error) throw error
    return (data || []).map((u: { slug: string, empresas: { nome: string } | null }) => ({
      slug: u.slug,
      nome: normalizarNome(u.empresas?.nome || ''),
    }))
  })().catch((erro) => {
    unidadesAtivasCache = null
    throw erro
  })
  return unidadesAtivasCache
}

export function useEhFilial(slug: string, nome: () => string | undefined) {
  const { $meubairroApp } = useNuxtApp()

  return useAsyncData(`empresa-filial-${slug}`, async () => {
    const nomeAtual = nome()
    if (!$meubairroApp || !nomeAtual) return false
    const unidades = await listarUnidadesAtivas($meubairroApp)
    const alvo = normalizarNome(nomeAtual)
    return unidades.filter((u) => u.nome === alvo).length > 1
  })
}

export function usePrestadorPublico(slug: string) {
  const { $meubairroApp } = useNuxtApp()

  return useAsyncData(`prestador-publico-${slug}`, async () => {
    if (!$meubairroApp) return null

    const { data, error } = await $meubairroApp
      .rpc('buscar_prestador_publico_seo', { p_slug: slug })
      .maybeSingle()

    if (error) throw error
    return data as PrestadorPublico | null
  })
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function nomeDiaSemana(dia: number) {
  return DIAS_SEMANA[dia] ?? ''
}

export function formatarHora(hora: string | null) {
  if (!hora) return ''
  return hora.slice(0, 5)
}
