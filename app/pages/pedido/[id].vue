<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'

definePageMeta({ ssr: false })

useSeoMeta({ title: 'Pedido — Meu Bairro Buritis' })

const route = useRoute()
const config = useRuntimeConfig()
const pedidoId = route.params.id as string

const { consultarStatus } = useCheckout()
const { $supabase } = useNuxtApp()
const statusAtual = ref<string | null>(null)
const verificando = ref(false)

interface PedidoSalvo {
  pedido_id: string
  status: string
  qr_code?: string
  qr_code_base64?: string
}

const pedidoSalvo = ref<PedidoSalvo | null>(null)

// 🐛 causa raiz real do "só atualiza com clique manual": isso comparava
// com `!== 'pendente'` (nosso enum, em português) -- mas o status inicial
// vem do sessionStorage logo após gerar o PIX, e ali é o valor cru que o
// Mercado Pago devolve na criação ("pending", em inglês). Como "pending"
// nunca bate com "pendente", a conta dava "já é estado final" e o
// realtime/polling nem chegava a ser configurado na montagem da página --
// só funcionava se a página fosse aberta direto na URL (sem esse valor em
// cache), nunca no fluxo real (gerar PIX -> "Já paguei, continuar"). Lista
// explícita dos estados finais de verdade, em vez de uma negação frágil.
const statusFinal = computed(() =>
  statusAtual.value === 'pago' ||
  statusAtual.value === 'recusado' ||
  statusAtual.value === 'rejected' ||
  statusAtual.value === 'cancelado',
)

let canalRealtime: RealtimeChannel | null = null
let intervaloPolling: ReturnType<typeof setInterval> | null = null

function pararAtualizacaoAutomatica() {
  if (canalRealtime) {
    $supabase?.removeChannel(canalRealtime)
    canalRealtime = null
  }
  if (intervaloPolling) {
    clearInterval(intervaloPolling)
    intervaloPolling = null
  }
}

onMounted(() => {
  const bruto = sessionStorage.getItem(`mbb-pedido-${pedidoId}`)
  if (bruto) pedidoSalvo.value = JSON.parse(bruto)
  statusAtual.value = pedidoSalvo.value?.status ?? null

  if (statusFinal.value || !$supabase) return

  // 🔄 atualização automática, sem precisar de nenhum clique -- duas
  // camadas, a mesma ideia do padrão já usado nas mensagens do app do
  // bairro (channel + postgres_changes), adaptada pra broadcast porque
  // `pedidos` não tem policy de SELECT pra anon (checkout é anônimo por
  // design) -- uma inscrição via postgres_changes com a anon key nunca
  // receberia nada. O mp_webhook manda um broadcast nesse mesmo canal
  // assim que confirma o pagamento (ver supabase/functions/mp_webhook).
  canalRealtime = $supabase
    .channel(`pedido:${pedidoId}`)
    .on('broadcast', { event: 'status_atualizado' }, ({ payload }) => {
      if (payload?.status) statusAtual.value = payload.status
      if (statusFinal.value) pararAtualizacaoAutomatica()
    })
    .subscribe()

  // 🛟 polling de reserva (a cada 5s) -- cobre o caso do realtime não
  // conectar (rede/proxy bloqueando websocket) ou a pagina ter sido
  // aberta/reconectada num momento em que perdeu o broadcast.
  intervaloPolling = setInterval(async () => {
    const status = await consultarStatus(pedidoId)
    if (status) statusAtual.value = status
    if (statusFinal.value) pararAtualizacaoAutomatica()
  }, 5000)
})

onBeforeUnmount(() => {
  pararAtualizacaoAutomatica()
})

async function verificarPagamento() {
  verificando.value = true
  const status = await consultarStatus(pedidoId)
  if (status) statusAtual.value = status
  if (statusFinal.value) pararAtualizacaoAutomatica()
  verificando.value = false
}

const mensagemWhatsapp = computed(() =>
  encodeURIComponent(
    `Olá! Meu pedido #${pedidoId.slice(0, 8)} foi confirmado. Segue o material do anúncio (imagem/vídeo/texto):`,
  ),
)
const linkWhatsapp = computed(() => `https://wa.me/${config.public.whatsappNumero}?text=${mensagemWhatsapp.value}`)
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-16 text-center">
    <template v-if="statusAtual === 'pago'">
      <p class="text-4xl">✅</p>
      <h1 class="mt-4 font-serif text-2xl font-bold text-stone-900">Pagamento confirmado!</h1>
      <p class="mt-3 text-stone-600">
        Pedido <span class="font-mono">#{{ pedidoId.slice(0, 8) }}</span> pago com sucesso.
      </p>

      <div class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-left">
        <p class="font-semibold text-stone-900">Próximo passo: envie o material do seu anúncio</p>
        <p class="mt-2 text-sm text-stone-600">
          Nos mande a imagem, vídeo ou texto que você quer publicar, junto com a data/horário desejados,
          direto no nosso WhatsApp.
        </p>
        <a
          :href="linkWhatsapp"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 block rounded-full bg-orange-600 px-6 py-3 text-center font-semibold text-white hover:bg-orange-700"
        >
          Enviar material no WhatsApp
        </a>
      </div>
    </template>

    <template v-else-if="statusAtual === 'recusado' || statusAtual === 'rejected' || statusAtual === 'cancelado'">
      <p class="text-4xl">❌</p>
      <h1 class="mt-4 font-serif text-2xl font-bold text-stone-900">Pagamento não aprovado</h1>
      <p class="mt-3 text-stone-600">
        Pedido <span class="font-mono">#{{ pedidoId.slice(0, 8) }}</span> não foi aprovado pelo Mercado
        Pago. Volte ao carrinho pra tentar de novo com outro cartão ou PIX.
      </p>
      <NuxtLink
        to="/carrinho"
        class="mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
      >
        Voltar ao carrinho
      </NuxtLink>
    </template>

    <template v-else>
      <p class="text-4xl">⏳</p>
      <h1 class="mt-4 font-serif text-2xl font-bold text-stone-900">Aguardando confirmação do pagamento</h1>
      <p class="mt-3 text-stone-600">
        Pedido <span class="font-mono">#{{ pedidoId.slice(0, 8) }}</span> — assim que o pagamento for
        aprovado, esta página mostra os próximos passos.
      </p>
      <button
        type="button"
        :disabled="verificando"
        class="mt-6 rounded-full border border-stone-300 px-6 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        @click="verificarPagamento"
      >
        {{ verificando ? 'Verificando...' : 'Já paguei, verificar status' }}
      </button>
    </template>
  </div>
</template>
