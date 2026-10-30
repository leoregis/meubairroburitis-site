<script setup lang="ts">
// carrinho é 100% dependente de localStorage (sem valor de SEO em
// pré-renderizar um "carrinho vazio") — renderizar só client-side evita
// a divergência de hidratação entre o servidor (sem acesso a localStorage)
// e o estado real do navegador, mesmo padrão já usado em /pedido e /admin.
definePageMeta({ ssr: false })

// noindex explícito: é rota client-only (sem HTML pré-gerado), então o
// robots:false de routeRules não chega ao HTML -- sem isto o shell saía
// com o index,follow padrão do site.
useSeoMeta({ title: 'Carrinho — Meu Bairro Buritis', robots: 'noindex' })

const { itens, total, atualizarQuantidade, remover, limpar } = useCarrinho()
const { carregando, erro, pagar } = useCheckout()
const router = useRouter()
const { ehPrevia } = usePrevia()

const CHAVE_COMPRADOR_SALVO = 'mbb-comprador-dados'

function carregarCompradorSalvo() {
  if (!import.meta.client) return { nome: '', telefone: '', email: '', empresa: '' }
  try {
    const salvo = localStorage.getItem(CHAVE_COMPRADOR_SALVO)
    if (!salvo) return { nome: '', telefone: '', email: '', empresa: '' }
    const dados = JSON.parse(salvo)
    return { nome: dados.nome ?? '', telefone: dados.telefone ?? '', email: dados.email ?? '', empresa: '' }
  } catch {
    return { nome: '', telefone: '', email: '', empresa: '' }
  }
}

// 💾 pré-preenche com os dados da última compra bem-sucedida neste
// aparelho/navegador (não sincroniza entre dispositivos, não exige
// login) -- só conveniência de preenchimento, o campo continua 100%
// editável normalmente.
function salvarCompradorParaProximaVez() {
  if (!import.meta.client) return
  localStorage.setItem(CHAVE_COMPRADOR_SALVO, JSON.stringify(comprador.value))
}

const metodo = ref<'pix' | 'cartao'>('pix')
const comprador = ref(carregarCompradorSalvo())
const mostrarFormulario = ref(false)
const resultadoPix = ref<{ qr_code: string; qr_code_base64: string; pedido_id: string } | null>(null)

function comecarCheckout() {
  // 🐛 a idempotency_key ficava presa no sessionStorage pra sempre (só
  // existia pra evitar cobrar 2x um retry da MESMA tentativa) -- então
  // uma tentativa de PIX de HOJE podia deixar a chave salva, e uma
  // tentativa de CARTÃO amanhã (ou minutos depois) reaproveitava essa
  // MESMA chave: o criar_pagamento achava o pedido antigo (já pago via
  // PIX) e devolvia ele como se fosse a resposta do cartão -- tela de
  // "pagamento confirmado" sem o cartão ter sido cobrado de verdade.
  // Gerar uma chave nova a cada novo checkout (mantém a mesma se for só
  // um retry dentro do mesmo formulário aberto) resolve na origem.
  if (import.meta.client) sessionStorage.removeItem('mbb-idempotency-key')
  mostrarFormulario.value = true
}

async function pagarComPix() {
  if (ehPrevia) { erro.value = AVISO_PREVIA; return }
  const resposta = await pagar(comprador.value, 'pix')
  if (!resposta) return
  if (resposta.qr_code_base64 && resposta.qr_code) {
    resultadoPix.value = {
      qr_code: resposta.qr_code,
      qr_code_base64: resposta.qr_code_base64,
      pedido_id: resposta.pedido_id,
    }
    salvarCompradorParaProximaVez()
    limpar()
  }
}

async function pagarComCartao(dadosCartao: {
  token: string
  payment_method_id: string
  installments: number
  issuer_id?: string
  device_id?: string
  identification?: { type: string; number: string }
}) {
  if (ehPrevia) { erro.value = AVISO_PREVIA; return }
  const resposta = await pagar(comprador.value, 'cartao', dadosCartao)
  if (!resposta) return

  // 🐛 cartão recusado/em análise navegava pro /pedido/[id] igual um
  // pagamento aprovado -- a tela lá só distingue "pago" de "todo o
  // resto", então um cartão recusado ficava preso pra sempre em
  // "Aguardando confirmação do pagamento" (nunca vai confirmar, já foi
  // recusado). Mantém o carrinho intacto e deixa a pessoa tentar de novo.
  if (resposta.status === 'rejected') {
    erro.value = 'Cartão recusado pelo Mercado Pago. Confira os dados ou tente outro cartão/método.'
    return
  }

  salvarCompradorParaProximaVez()
  limpar()
  router.push(`/pedido/${resposta.pedido_id}`)
}

function onErroCartao(e: unknown) {
  console.error('Erro no Card Payment Brick:', e)
  erro.value = 'Não foi possível carregar o formulário de cartão. Tente novamente.'
}
</script>

<template>
  <div class="mx-auto max-w-[760px] px-4 pb-16 pt-8 sm:px-6 sm:pb-[72px] sm:pt-12">
    <h1 class="m-0 text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">Seu carrinho</h1>

    <!-- PIX gerado: mostra QR até o comprador escanear -->
    <div v-if="resultadoPix" class="mt-8 rounded-mbb-xl border border-line bg-white p-6">
      <p class="mb-4 text-center font-bold text-ink">Escaneie o QR Code pra pagar com PIX</p>
      <CheckoutPixQrCode :qr-code-base64="resultadoPix.qr_code_base64" :copia-e-cola="resultadoPix.qr_code" />
      <NuxtLink
        :to="`/pedido/${resultadoPix.pedido_id}`"
        class="mt-6 flex min-h-[44px] items-center justify-center text-sm font-bold text-brand-ink hover:underline"
      >
        Já paguei, continuar →
      </NuxtLink>
    </div>

    <template v-else>
      <p v-if="itens.length === 0" class="mt-6 text-[17px] text-ink-muted">
        Seu carrinho está vazio.
        <NuxtLink to="/loja" class="font-bold text-brand-ink underline underline-offset-2 hover:text-brand-deep">Ver pacotes de anúncio</NuxtLink>
      </p>

      <div v-else class="mt-8 space-y-4">
        <div
          v-for="item in itens"
          :key="item.produtoId"
          class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-mbb-lg border border-line bg-white p-4"
        >
          <div class="min-w-0 flex-1">
            <p class="font-bold text-ink">{{ item.nome }}</p>
            <p class="text-sm tabular-nums text-ink-muted">{{ formatarPreco(item.precoCentavos) }} cada</p>
          </div>
          <input
            type="number"
            min="1"
            class="h-11 w-16 rounded-mbb-md border border-line px-2 text-center text-ink focus:border-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
            :aria-label="`Quantidade de ${item.nome}`"
            :value="item.quantidade"
            @change="atualizarQuantidade(item.produtoId, Number(($event.target as HTMLInputElement).value))"
          />
          <button type="button" class="inline-flex min-h-[44px] items-center px-1 text-sm font-semibold text-ink-muted underline-offset-2 hover:text-brand-ink hover:underline" @click="remover(item.produtoId)">
            Remover
          </button>
        </div>

        <div class="flex items-center justify-between border-t border-line pt-4">
          <p class="m-0 text-lg font-bold text-ink">Total</p>
          <p class="m-0 text-[28px] font-extrabold tracking-[-0.02em] tabular-nums text-ink">{{ formatarPreco(total) }}</p>
        </div>

        <button
          v-if="!mostrarFormulario"
          type="button"
          class="w-full rounded-mbb-md bg-brand min-h-[48px] px-6 py-3 font-bold text-white hover:bg-brand-deep"
          @click="comecarCheckout"
        >
          Continuar pro pagamento
        </button>

        <div v-else class="space-y-6 border-t border-line pt-6">
          <CheckoutFormularioComprador v-model="comprador" />

          <div class="flex gap-2">
            <button
              type="button"
              class="min-h-[44px] flex-1 rounded-mbb-md border px-4 py-2 text-sm font-bold"
              :class="metodo === 'pix' ? 'border-brand bg-brand-tint text-brand-ink' : 'border-line text-ink-muted'"
              @click="metodo = 'pix'"
            >
              PIX
            </button>
            <button
              type="button"
              class="min-h-[44px] flex-1 rounded-mbb-md border px-4 py-2 text-sm font-bold"
              :class="metodo === 'cartao' ? 'border-brand bg-brand-tint text-brand-ink' : 'border-line text-ink-muted'"
              @click="metodo = 'cartao'"
            >
              Cartão
            </button>
          </div>

          <!-- 🐛 antes era um <p> normal no fluxo do documento -- se a
          pessoa não estivesse com a página rolada até esse ponto (comum
          logo após enviar o cartão, quando o Brick ocupa mais espaço),
          a mensagem de erro simplesmente não aparecia na tela. Fixo no
          topo da viewport, mesmo padrão visual do toast de "adicionado
          ao carrinho" (ToastCarrinho.vue), pra ficar visível sempre,
          independente da rolagem. -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="-translate-y-4 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="-translate-y-4 opacity-0"
          >
            <div
              v-if="erro"
              class="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-mbb-lg bg-red-600 px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
            >
              <Icon name="lucide:alert-circle" class="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p class="flex-1 text-sm">{{ erro }}</p>
              <button type="button" class="flex-shrink-0 text-red-200 hover:text-white" aria-label="Fechar" @click="erro = ''">
                <Icon name="lucide:x" class="h-4 w-4" />
              </button>
            </div>
          </Transition>

          <div v-if="metodo === 'pix'">
            <button
              type="button"
              :disabled="carregando || !comprador.nome || !comprador.telefone"
              class="w-full rounded-mbb-md bg-brand min-h-[48px] px-6 py-3 font-bold text-white hover:bg-brand-deep disabled:opacity-50"
              @click="pagarComPix"
            >
              {{ carregando ? 'Gerando PIX...' : 'Gerar QR Code PIX' }}
            </button>
          </div>

          <div v-else>
            <CheckoutCardPaymentBrick
              v-if="comprador.nome && comprador.telefone"
              :valor-centavos="total"
              @submit="pagarComCartao"
              @erro="onErroCartao"
            />
            <p v-else class="text-sm text-ink-muted">Preencha nome e WhatsApp acima pra continuar.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
