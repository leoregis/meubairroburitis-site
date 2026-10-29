import type { IndiceBusca } from '~/utils/busca'

// Índice da /busca, montado no BUILD (prerender) e levado no payload da
// página -- a busca em si roda no navegador, sem consultar o Supabase.
// Fica pequeno de propósito: só título/subtítulo/categoria/data das
// notícias e nome/categoria/subcategoria de empresas e prestadores.
// Quando uma notícia, empresa ou prestador muda, o build incremental regera
// a /busca junto com a home (scripts/incremental/rotas-afetadas.mjs).
export function useIndiceBusca() {
  const { $supabase, $meubairroApp } = useNuxtApp()

  return useAsyncData('busca-indice', async () => {
    const indice: IndiceBusca = { n: [], e: [], p: [] }

    if ($supabase) {
      const { data, error } = await $supabase
        .from('noticias')
        .select('titulo, subtitulo, slug, categoria, data_publicacao, categoria_info:noticias_categorias(rotulo)')
        .eq('status', 'publicado')
        .order('data_publicacao', { ascending: false })
        .range(0, 4999)
      if (error) throw error
      indice.n = (data ?? []).map((n: any) => [
        n.titulo || '',
        (n.subtitulo || '').slice(0, 160),
        n.slug,
        n.categoria_info?.rotulo || n.categoria || '',
        (n.data_publicacao || '').slice(0, 10),
      ])
    }

    if ($meubairroApp) {
      const [empresas, prestadores] = await Promise.all([
        $meubairroApp.from('vw_empresas_publico_listagem').select('nome, slug, categoria_nome, subcategoria_nome').order('nome').range(0, 4999),
        $meubairroApp.from('vw_prestadores_publico_listagem').select('nome, slug, categoria_nome, subcategoria_nome').order('nome').range(0, 4999),
      ])
      if (empresas.error) throw empresas.error
      if (prestadores.error) throw prestadores.error
      const linha = (r: any): [string, string, string, string] => [r.nome || '', r.slug, r.categoria_nome || '', r.subcategoria_nome || '']
      indice.e = (empresas.data ?? []).filter((r: any) => r.slug).map(linha)
      indice.p = (prestadores.data ?? []).filter((r: any) => r.slug).map(linha)
    }

    return indice
  })
}
