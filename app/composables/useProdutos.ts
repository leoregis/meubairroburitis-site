import { PRODUTOS_SEED } from '~/constants/produtos-seed'

export interface Produto {
  id: string
  slug: string
  nome: string
  descricao_curta: string | null
  descricao: string | null
  preco_centavos: number
  imagem_url: string | null
  ordem: number
}

export function useProdutos() {
  const { $supabase } = useNuxtApp()

  return useAsyncData('produtos', async () => {
    if (!$supabase) return PRODUTOS_SEED

    const { data, error } = await $supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true })

    if (error) throw error
    return (data ?? []) as Produto[]
  })
}

export function useProduto(slug: string) {
  const { $supabase } = useNuxtApp()

  return useAsyncData(`produto-${slug}`, async () => {
    if (!$supabase) return PRODUTOS_SEED.find((p) => p.slug === slug) ?? null

    const { data, error } = await $supabase
      .from('produtos')
      .select('*')
      .eq('slug', slug)
      .eq('ativo', true)
      .maybeSingle()

    if (error) throw error
    return data as Produto | null
  })
}

export function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
