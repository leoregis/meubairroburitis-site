import type { SupabaseClient } from '@supabase/supabase-js'

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
  cta_texto: string | null
  cta_href: string | null
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

// Fase 3 -- bloco "Leia também", curado manualmente a partir da matriz de
// linkagem aprovada. Quando o artigo não tem nenhuma linha curada (ex:
// artigo novo publicado depois da Fase 3, que ninguém lembrou de linkar
// manualmente), cai num fallback automático: outros artigos publicados da
// mesma categoria/subcategoria, mais recentes primeiro. O fallback nunca
// sobrepõe curadoria existente -- só cobre o buraco de esquecimento.
export function useNoticiasRelacionadas(
  noticiaId: string,
  categoriaId: string | null,
  subcategoriaGuiaId: string | null,
) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`noticias-relacionadas-${noticiaId}`, async () => {
    if (!$supabase) return [] as Noticia[]

    const { data, error } = await $supabase
      .from('noticias_relacionadas')
      .select(`ordem, relacionada:noticias!relacionada_id(${SELECT_NOTICIA})`)
      .eq('noticia_id', noticiaId)
      .order('ordem')

    if (error) throw error

    // relacionada que não está publicada fica de fora: no build (anon) o RLS
    // esconde rascunho e o embed volta null -- passar null pro NoticiaCard
    // quebrava o prerender da página inteira com 500, e o failOnError:false
    // tirava a matéria do site em silêncio (7 matérias sumiram assim em
    // 24/set, por link recíproco gravado a partir de um rascunho). O filtro
    // por status cobre a mesma situação com sessão de admin (RLS deixa ver).
    const curadas = ((data ?? []) as any[])
      .map((r) => r.relacionada as Noticia | null)
      .filter((n): n is Noticia => n?.status === 'publicado')
    if (curadas.length || !categoriaId) return curadas

    let queryFallback = $supabase
      .from('noticias')
      .select(SELECT_NOTICIA)
      .eq('status', 'publicado')
      .eq('categoria_id', categoriaId)
      .neq('id', noticiaId)
      .order('data_publicacao', { ascending: false })
      .limit(3)

    if (categoriaId === 'guias' && subcategoriaGuiaId) {
      queryFallback = queryFallback.eq('subcategoria_guia_id', subcategoriaGuiaId)
    }

    const { data: fallback, error: erroFallback } = await queryFallback
    if (erroFallback) throw erroFallback
    return (fallback ?? []) as Noticia[]
  })
}

// usado no admin (seletor de "Leia também") -- lista enxuta, sem categoria
// alguma, pra permitir escolher qualquer notícia publicada como relacionada.
export function useTodasNoticiasPublicadas() {
  const { $supabase } = useNuxtApp()

  return useAsyncData('noticias-todas-publicadas-selecao', async () => {
    if (!$supabase) return [] as Pick<Noticia, 'id' | 'titulo'>[]

    const { data, error } = await $supabase
      .from('noticias')
      .select('id, titulo')
      .eq('status', 'publicado')
      .order('titulo')

    if (error) throw error
    return (data ?? []) as Pick<Noticia, 'id' | 'titulo'>[]
  })
}

// Substitui por completo a curadoria de "noticia_id" pelos ids escolhidos, e
// grava a recíproca em cada um deles (mesmo padrão simétrico já usado
// manualmente entre os guias de Alimentação) -- se o alvo já tiver essa
// recíproca, não duplica. Não remove recíprocas de relações que foram
// desmarcadas nesta edição (fica a cargo de quem editar o outro artigo).
//
// Recíproca só com a notícia PUBLICADA: gravar a recíproca a partir de um
// rascunho punha, no "Leia também" de artigos já no ar, um link pra algo
// que o público (e o build, que lê como anon) não enxerga -- foi assim que
// 7 matérias saíram do site em 24/set. A curadoria do próprio rascunho é
// salva normalmente; a recíproca é gravada quando ele for salvo publicado
// (salvar roda esta função de novo).
export async function salvarRelacionadosNoticia(
  supabase: SupabaseClient | null,
  noticiaId: string,
  relacionadosIds: string[],
  noticiaPublicada: boolean,
) {
  if (!supabase) return

  await supabase.from('noticias_relacionadas').delete().eq('noticia_id', noticiaId)

  if (!relacionadosIds.length) return

  await supabase.from('noticias_relacionadas').insert(
    relacionadosIds.map((relacionadaId, i) => ({
      noticia_id: noticiaId,
      relacionada_id: relacionadaId,
      ordem: i,
    })),
  )

  if (!noticiaPublicada) return

  for (const relacionadaId of relacionadosIds) {
    const { data: existentes } = await supabase
      .from('noticias_relacionadas')
      .select('relacionada_id')
      .eq('noticia_id', relacionadaId)

    const jaTemReciproca = (existentes ?? []).some((r) => r.relacionada_id === noticiaId)
    if (jaTemReciproca) continue

    await supabase.from('noticias_relacionadas').insert({
      noticia_id: relacionadaId,
      relacionada_id: noticiaId,
      ordem: (existentes ?? []).length,
    })
  }
}

export function formatarDataNoticia(data: string | null) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}
