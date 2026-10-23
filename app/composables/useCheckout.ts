export interface RespostaPagamento {
  pedido_id: string
  status: string
  qr_code?: string
  qr_code_base64?: string
  erro?: string
  detalhe?: unknown
}

export interface DadosComprador {
  nome: string
  telefone: string
  email?: string
  // honeypot anti-spam -- sempre vazio pra gente de verdade, ver FormularioComprador.vue
  empresa?: string
}

export interface DadosCartao {
  token: string
  payment_method_id: string
  installments: number
  issuer_id?: string
  device_id?: string
  identification?: { type: string; number: string }
}

function chaveIdempotencia() {
  if (!import.meta.client) return crypto.randomUUID()
  const existente = sessionStorage.getItem('mbb-idempotency-key')
  if (existente) return existente
  const nova = crypto.randomUUID()
  sessionStorage.setItem('mbb-idempotency-key', nova)
  return nova
}

export function useCheckout() {
  const config = useRuntimeConfig()
  const carregando = ref(false)
  const erro = ref<string | null>(null)

  async function pagar(
    comprador: DadosComprador,
    metodo: 'pix' | 'cartao',
    cartao?: DadosCartao,
  ): Promise<RespostaPagamento | null> {
    const { itens } = useCarrinho()
    carregando.value = true
    erro.value = null

    try {
      const resposta = await $fetch<RespostaPagamento>(
        `${config.public.supabaseUrl}/functions/v1/criar_pagamento`,
        {
          method: 'POST',
          headers: {
            apikey: config.public.supabaseAnonKey,
            Authorization: `Bearer ${config.public.supabaseAnonKey}`,
          },
          body: {
            itens: itens.value.map((i) => ({ produto_id: i.produtoId, quantidade: i.quantidade })),
            comprador,
            metodo,
            idempotency_key: chaveIdempotencia(),
            cartao,
          },
        },
      )

      if (resposta.erro) {
        erro.value = resposta.erro
        return null
      }

      if (import.meta.client) {
        // slugs dos produtos: o próximo passo da tela de pagamento confirmado
        // varia pelo que foi comprado (o carrinho é limpo logo depois)
        const slugs = [...new Set(itens.value.map((i) => i.slug))]
        sessionStorage.setItem(`mbb-pedido-${resposta.pedido_id}`, JSON.stringify({ ...resposta, slugs }))
      }

      return resposta
    } catch (e) {
      erro.value = 'Não foi possível processar o pagamento. Tente novamente.'
      console.error(e)
      return null
    } finally {
      carregando.value = false
    }
  }

  async function consultarStatus(pedidoId: string): Promise<string | null> {
    const idempotencyKey = import.meta.client ? sessionStorage.getItem('mbb-idempotency-key') : null
    if (!idempotencyKey) return null

    try {
      const resposta = await $fetch<{ status?: string, acompanhamento_token?: string | null }>(
        `${config.public.supabaseUrl}/functions/v1/consultar_pagamento`,
        {
          method: 'POST',
          headers: {
            apikey: config.public.supabaseAnonKey,
            Authorization: `Bearer ${config.public.supabaseAnonKey}`,
          },
          body: { pedido_id: pedidoId, idempotency_key: idempotencyKey },
        },
      )
      // pago: guarda o token do link de acompanhamento (/pedido/<token>) para a
      // tela de pagamento confirmado
      if (resposta.acompanhamento_token) sessionStorage.setItem(`mbb-acompanhamento-${pedidoId}`, resposta.acompanhamento_token)
      return resposta.status ?? null
    } catch {
      return null
    }
  }

  return { carregando, erro, pagar, consultarStatus }
}
