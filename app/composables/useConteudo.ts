import type { Noticia } from './useNoticias'

export function useConteudoLista() {
  const { $supabase } = useNuxtApp()

  return useAsyncData('conteudo-lista', async () => {
    if (!$supabase) return [] as Noticia[]

    const { data, error } = await $supabase
      .from('noticias')
      .select('*')
      .eq('status', 'publicado')
      .eq('tipo', 'conteudo')
      .order('data_publicacao', { ascending: false })

    if (error) throw error
    return (data ?? []) as Noticia[]
  })
}

export function useConteudoArtigo(slug: string) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`conteudo-${slug}`, async () => {
    if (!$supabase) return null

    const { data, error } = await $supabase
      .from('noticias')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'publicado')
      .eq('tipo', 'conteudo')
      .maybeSingle()

    if (error) throw error
    return data as Noticia | null
  })
}
