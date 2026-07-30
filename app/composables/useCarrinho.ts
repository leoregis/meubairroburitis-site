export interface ItemCarrinho {
  produtoId: string
  slug: string
  nome: string
  precoCentavos: number
  quantidade: number
}

const CHAVE_STORAGE = 'mbb-carrinho'

const itens = ref<ItemCarrinho[]>([])
let carregado = false

function carregar() {
  if (carregado || !import.meta.client) return
  carregado = true
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE)
    if (salvo) itens.value = JSON.parse(salvo)
  } catch {
    itens.value = []
  }
}

function persistir() {
  if (!import.meta.client) return
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens.value))
}

export function useCarrinho() {
  carregar()

  const total = computed(() =>
    itens.value.reduce((soma, item) => soma + item.precoCentavos * item.quantidade, 0),
  )

  const quantidadeTotal = computed(() =>
    itens.value.reduce((soma, item) => soma + item.quantidade, 0),
  )

  function adicionar(produto: Omit<ItemCarrinho, 'quantidade'>, quantidade = 1) {
    const existente = itens.value.find((i) => i.produtoId === produto.produtoId)
    if (existente) {
      existente.quantidade += quantidade
    } else {
      itens.value.push({ ...produto, quantidade })
    }
    persistir()
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade <= 0) {
      remover(produtoId)
      return
    }
    const item = itens.value.find((i) => i.produtoId === produtoId)
    if (item) {
      item.quantidade = quantidade
      persistir()
    }
  }

  function remover(produtoId: string) {
    itens.value = itens.value.filter((i) => i.produtoId !== produtoId)
    persistir()
  }

  function limpar() {
    itens.value = []
    persistir()
  }

  return { itens, total, quantidadeTotal, adicionar, atualizarQuantidade, remover, limpar }
}
