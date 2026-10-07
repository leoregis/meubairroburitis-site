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

// Dados de contexto da unidade que a RPC não devolve (07/out, Fase C do SEO):
// - filial = mais de uma unidade ATIVA com o mesmo nome de empresa. Olha
//   empresas_unidades, não a vw_empresas_publico_listagem: a view tem
//   DISTINCT ON (empresa_id) e esconde a 2a unidade da mesma empresa
//   (ex.: Depósito Ataíde 210/211);
// - bairro do cadastro (bairro_id, obrigatório e sem valor padrão no
//   formulário do app) -- usado quando o endereço não diz o bairro.
// Lista inteira buscada UMA vez por processo -- no prerender todas as ~500
// páginas rodam no mesmo processo, então não vira uma consulta por página.
// Só o resultado da página vai pro payload.
type ClienteSupabase = NonNullable<ReturnType<typeof useNuxtApp>['$meubairroApp']>
interface UnidadeAtiva { slug: string, nome: string, bairro: string | null }
let unidadesAtivasCache: Promise<UnidadeAtiva[]> | null = null

function normalizarNome(nome: string) {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function listarUnidadesAtivas(cliente: ClienteSupabase) {
  unidadesAtivasCache ??= (async () => {
    const { data, error } = await cliente
      .from('empresas_unidades')
      .select('slug, empresas(nome), bairros(nome)')
      .eq('ativo', true)
      .range(0, 4999)
    if (error) throw error
    return (data || []).map((u: { slug: string, empresas: { nome: string } | null, bairros: { nome: string } | null }) => ({
      slug: u.slug,
      nome: normalizarNome(u.empresas?.nome || ''),
      bairro: u.bairros?.nome?.trim() || null,
    }))
  })().catch((erro) => {
    unidadesAtivasCache = null
    throw erro
  })
  return unidadesAtivasCache
}

export function useContextoUnidade(slug: string, nome: () => string | undefined) {
  const { $meubairroApp } = useNuxtApp()

  return useAsyncData(`empresa-contexto-${slug}`, async () => {
    const nomeAtual = nome()
    if (!$meubairroApp || !nomeAtual) return { ehFilial: false, bairroCadastro: null as string | null }
    const unidades = await listarUnidadesAtivas($meubairroApp)
    const alvo = normalizarNome(nomeAtual)
    return {
      ehFilial: unidades.filter((u) => u.nome === alvo).length > 1,
      bairroCadastro: unidades.find((u) => u.slug === slug)?.bairro ?? null,
    }
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
