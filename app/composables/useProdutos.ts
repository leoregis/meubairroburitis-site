import { PRODUTOS_SEED } from '~/constants/produtos-seed'

export interface Produto {
  id: string
  slug: string
  nome: string
  descricao_curta: string | null
  descricao: string | null
  preco_centavos: number
  // preço "de" opcional, exibido riscado quando maior que preco_centavos
  // (produto em promoção) -- null/ausente = sem promoção, mostra só o
  // preço normal (comportamento de todo produto criado antes disso).
  preco_original_centavos?: number | null
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
