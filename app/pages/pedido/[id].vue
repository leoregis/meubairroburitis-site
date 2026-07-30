<script setup lang="ts">
definePageMeta({ ssr: false })

useSeoMeta({ title: 'Pedido — Meu Bairro Buritis' })

const route = useRoute()
const config = useRuntimeConfig()
const pedidoId = route.params.id as string

const { consultarStatus } = useCheckout()
const statusAtual = ref<string | null>(null)
const verificando = ref(false)

interface PedidoSalvo {
  pedido_id: string
  status: string
  qr_code?: string
  qr_code_base64?: string
}

const pedidoSalvo = ref<PedidoSalvo | null>(null)

onMounted(() => {
  const bruto = sessionStorage.getItem(`mbb-pedido-${pedidoId}`)
  if (bruto) pedidoSalvo.value = JSON.parse(bruto)
  statusAtual.value = pedidoSalvo.value?.status ?? null
})

async function verificarPagamento() {
  verificando.value = true
  const status = await consultarStatus(pedidoId)
  if (status) statusAtual.value = status
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
