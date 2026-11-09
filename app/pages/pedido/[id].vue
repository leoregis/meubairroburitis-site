<script setup lang="ts">
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

definePageMeta({ ssr: false })

// noindex explícito: rota client-only, o robots:false de routeRules não
// chega ao HTML (ver carrinho.vue).
useSeoMeta({ title: 'Pedido — Meu Bairro Buritis', robots: 'noindex' })
// o link de acompanhamento não vaza pelo Referer ao abrir uma publicação
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })

const route = useRoute()
const config = useRuntimeConfig()
const pedidoId = route.params.id as string
// /pedido/<token> (22 caracteres base64url, link de acompanhamento mandado
// pela Central) x /pedido/<uuid> (a volta do checkout, abaixo)
const ehAcompanhamento = /^[A-Za-z0-9_-]{22}$/.test(pedidoId)

const { consultarStatus } = useCheckout()
// o cliente do Supabase só é carregado no onMounted (item 1 da fase 5)
const obterSupabase = useSupabaseSite()
let clienteSupabase: SupabaseClient | null = null
let desmontado = false
const statusAtual = ref<string | null>(null)
const verificando = ref(false)

interface PedidoSalvo {
  pedido_id: string
  status: string
  qr_code?: string
  qr_code_base64?: string
  slugs?: string[]
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
    clienteSupabase?.removeChannel(canalRealtime)
    canalRealtime = null
  }
  if (intervaloPolling) {
    clearInterval(intervaloPolling)
    intervaloPolling = null
  }
}

onMounted(async () => {
  if (ehAcompanhamento) return
  const bruto = sessionStorage.getItem(`mbb-pedido-${pedidoId}`)
  if (bruto) pedidoSalvo.value = JSON.parse(bruto)
  statusAtual.value = pedidoSalvo.value?.status ?? null

  if (statusFinal.value) return
  const $supabase = await obterSupabase()
  if (!$supabase || desmontado) return
  clienteSupabase = $supabase

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
  desmontado = true
  pararAtualizacaoAutomatica()
})

// 22/out: pago -> link de acompanhamento (/pedido/<token>). O token vem da
// consulta (consultarStatus guarda no sessionStorage); se o "pago" chegou pelo
// broadcast, consulta uma vez para buscá-lo.
const tokenAcompanhamento = ref<string | null>(null)
watch(statusAtual, async (status) => {
  if (status !== 'pago' || ehAcompanhamento) return
  tokenAcompanhamento.value = sessionStorage.getItem(`mbb-acompanhamento-${pedidoId}`)
  if (!tokenAcompanhamento.value) {
    await consultarStatus(pedidoId)
    tokenAcompanhamento.value = sessionStorage.getItem(`mbb-acompanhamento-${pedidoId}`)
  }
}, { immediate: true })

async function verificarPagamento() {
  verificando.value = true
  const status = await consultarStatus(pedidoId)
  if (status) statusAtual.value = status
  if (statusFinal.value) pararAtualizacaoAutomatica()
  verificando.value = false
}

// próximo passo pelo tipo de produto comprado. Os slugs vêm do sessionStorage
// gravado no checkout; sem eles (outro aparelho, aba nova) ou com tipos
// diferentes no mesmo pedido, vale o passo genérico.
const numeroPedido = `#${pedidoId.slice(0, 8)}`
const PASSOS = {
  material: {
    titulo: 'Próximo passo: envie o seu material.',
    texto: 'Mande no nosso WhatsApp a imagem, o vídeo ou o texto que você quer publicar, com as datas e horários desejados.',
    botao: 'Enviar material no WhatsApp',
    mensagem: `Olá! Meu pedido ${numeroPedido} foi confirmado. Segue o material do anúncio, com as datas e horários desejados:`,
  },
  colab: {
    titulo: 'Próximo passo: vamos combinar a data do seu Colab.',
    texto: 'Quando publicar o Reels no seu perfil, convide o @meubairroburitis como colaborador.',
    botao: 'Combinar no WhatsApp',
    mensagem: `Olá! Meu pedido ${numeroPedido} foi confirmado. Quero combinar a data do meu Colab.`,
  },
  gravacao: {
    titulo: 'Próximo passo: vamos agendar a gravação.',
    texto: 'Fale com a gente no WhatsApp para escolher o dia e alinhar a ideia do seu vídeo.',
    botao: 'Agendar gravação no WhatsApp',
    mensagem: `Olá! Meu pedido ${numeroPedido} foi confirmado. Quero agendar a gravação do meu vídeo.`,
  },
  informacoes: {
    titulo: 'Próximo passo: conte pra gente sobre a sua empresa.',
    texto: 'Mande no WhatsApp o que você quer divulgar, com fotos, logotipo e o link de destino. Nossa equipe produz a matéria e você aprova antes da publicação.',
    botao: 'Enviar informações no WhatsApp',
    mensagem: `Olá! Meu pedido ${numeroPedido} foi confirmado. Seguem as informações para o Conteúdo Publicitário Especial:`,
  },
  misto: {
    titulo: 'Próximo passo: fale com a gente no WhatsApp para combinarmos o material e as datas de cada item do seu pedido.',
    texto: '',
    botao: 'Falar no WhatsApp',
    mensagem: `Olá! Meu pedido ${numeroPedido} foi confirmado. Quero combinar o material e as datas de cada item.`,
  },
} as const
const TIPO_POR_SLUG: Record<string, keyof typeof PASSOS> = {
  'stories-no-instagram': 'material',
  'mbb-basic': 'material',
  'mbb-premium': 'material',
  'colab-insta': 'colab',
  'producao-de-video-reels': 'gravacao',
  'conteudo-publicitario-especial': 'informacoes',
}
const proximoPasso = computed(() => {
  const tipos = new Set((pedidoSalvo.value?.slugs ?? []).map((s) => TIPO_POR_SLUG[s] ?? 'misto'))
  return PASSOS[tipos.size === 1 ? [...tipos][0]! : 'misto']
})
const linkWhatsapp = computed(
  () => `https://wa.me/${config.public.whatsappNumero}?text=${encodeURIComponent(proximoPasso.value.mensagem)}`,
)
</script>

<template>
  <PedidoAcompanhamento v-if="ehAcompanhamento" :token="pedidoId" />
  <div v-else class="mx-auto max-w-[620px] px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-[72px] sm:pt-14">
    <template v-if="statusAtual === 'pago'">
      <span class="mx-auto flex h-12 w-12 items-center justify-center text-success-ink" aria-hidden="true"><Icon name="lucide:circle-check" class="h-12 w-12" /></span>
      <h1 class="mt-4 text-balance text-2xl font-extrabold leading-8 tracking-[-0.02em] text-ink sm:text-[28px] sm:leading-9">Pagamento confirmado!</h1>
      <p class="mt-3 text-ink-muted">
        Pedido <span class="font-mono">#{{ pedidoId.slice(0, 8) }}</span> pago com sucesso.
      </p>

      <div class="mt-8 rounded-mbb-xl border border-line bg-white p-6 text-left">
        <p class="font-semibold text-ink">{{ proximoPasso.titulo }}</p>
        <p v-if="proximoPasso.texto" class="mt-2 text-sm text-ink-muted">{{ proximoPasso.texto }}</p>
        <a
          :href="linkWhatsapp"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 block rounded-mbb-md bg-brand min-h-[48px] px-6 py-3 text-center font-bold text-white hover:bg-brand-deep"
        >
          {{ proximoPasso.botao }}
        </a>
      </div>

      <div v-if="tokenAcompanhamento" class="mt-4 rounded-mbb-xl border border-line bg-ground p-6 text-left">
        <p class="font-semibold text-ink">Acompanhe o seu pedido</p>
        <p class="mt-2 text-sm text-ink-muted">
          Guarde este link: nele você vê a situação de cada entrega, as datas e o link de cada publicação.
        </p>
        <NuxtLink
          :to="`/pedido/${tokenAcompanhamento}`"
          class="mt-4 block rounded-mbb-md border border-brand min-h-[48px] px-6 py-3 text-center font-semibold text-brand-ink hover:bg-brand-tint"
        >
          Acompanhar meu pedido
        </NuxtLink>
      </div>
    </template>

    <template v-else-if="statusAtual === 'recusado' || statusAtual === 'rejected' || statusAtual === 'cancelado'">
      <span class="mx-auto flex h-12 w-12 items-center justify-center text-brand-ink" aria-hidden="true"><Icon name="lucide:circle-x" class="h-12 w-12" /></span>
      <h1 class="mt-4 text-balance text-2xl font-extrabold leading-8 tracking-[-0.02em] text-ink sm:text-[28px] sm:leading-9">Pagamento não aprovado</h1>
      <p class="mt-3 text-ink-muted">
        Pedido <span class="font-mono">#{{ pedidoId.slice(0, 8) }}</span> não foi aprovado pelo Mercado
        Pago. Volte ao carrinho pra tentar de novo com outro cartão ou PIX.
      </p>
      <NuxtLink
        to="/carrinho"
        class="mt-6 inline-block rounded-mbb-md bg-brand min-h-[48px] px-6 py-3 font-bold text-white hover:bg-brand-deep"
      >
        Voltar ao carrinho
      </NuxtLink>
    </template>

    <template v-else>
      <span class="mx-auto flex h-12 w-12 items-center justify-center text-ink-muted" aria-hidden="true"><Icon name="lucide:hourglass" class="h-12 w-12" /></span>
      <h1 class="mt-4 text-balance text-2xl font-extrabold leading-8 tracking-[-0.02em] text-ink sm:text-[28px] sm:leading-9">Aguardando confirmação do pagamento</h1>
      <p class="mt-3 text-ink-muted">
        Pedido <span class="font-mono">#{{ pedidoId.slice(0, 8) }}</span> — assim que o pagamento for
        aprovado, esta página mostra os próximos passos.
      </p>
      <button
        type="button"
        :disabled="verificando"
        class="mt-6 min-h-[44px] rounded-mbb-md border border-line px-6 py-2 text-sm font-semibold text-ink hover:bg-ground disabled:opacity-50"
        @click="verificarPagamento"
      >
        {{ verificando ? 'Verificando...' : 'Já paguei, verificar status' }}
      </button>
    </template>
  </div>
</template>
