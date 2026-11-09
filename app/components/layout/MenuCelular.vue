<script setup lang="ts">
// Menu do celular: folha de tela cheia, aberta pelo botão do Header.
// Fecha com Esc, com o X, ao escolher um link e ao trocar de rota; ao
// fechar, o foco volta ao botão que abriu (Header.fecharMenu).
import {
  LINK_ULTIMAS, EDITORIAS, LINKS_DIRETORIO, LINK_ANUNCIE, LINK_MEUS_PEDIDOS,
  LINK_APP_GUIA, redesOficiais,
} from '~/constants/navegacao'

const emit = defineEmits<{ fechar: [] }>()

const config = useRuntimeConfig()
const route = useRoute()
const { quantidadeTotal } = useCarrinho()
const redes = redesOficiais(config.public.whatsappNumero)

const MAIS = [
  { label: 'Guias do bairro', to: '/conteudo' },
  { label: 'Midiakit', to: '/midiakit' },
  { label: 'Quem Somos', to: '/quem-somos' },
  { label: 'Canais', to: '/canais' },
]

const painel = ref<HTMLElement | null>(null)

function aoTeclar(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('fechar')
  // mantém o Tab dentro do menu enquanto ele está aberto
  if (e.key === 'Tab' && painel.value) {
    const focaveis = painel.value.querySelectorAll<HTMLElement>('a[href], button')
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo?.focus() }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro?.focus() }
  }
}

watch(() => route.fullPath, () => emit('fechar'))

onMounted(() => {
  document.addEventListener('keydown', aoTeclar)
  document.body.style.overflow = 'hidden'
  painel.value?.querySelector<HTMLElement>('button')?.focus()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', aoTeclar)
  document.body.style.overflow = ''
})

const item = 'flex min-h-[48px] items-center border-b border-line text-base font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink'
const titulo = 'm-0 pt-6 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted'
</script>

<template>
  <div
    id="menu-celular"
    ref="painel"
    role="dialog"
    aria-modal="true"
    aria-label="Menu"
    class="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden"
  >
    <div class="sticky top-0 flex items-center justify-between border-b-3 border-brand bg-white px-4 py-2">
      <span class="text-base font-extrabold text-ink">Menu</span>
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-mbb-md border border-line text-ink hover:bg-ground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        aria-label="Fechar menu"
        @click="emit('fechar')"
      >
        <Icon name="lucide:x" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <nav aria-label="Menu do site" class="px-4 pb-10">
      <div class="flex flex-col gap-2 pt-4">
        <BaseBotao :href="LINK_APP_GUIA.href" largo>
          <Icon name="lucide:smartphone" class="h-[18px] w-[18px]" aria-hidden="true" />
          Abrir o app {{ LINK_APP_GUIA.label }}
        </BaseBotao>
      </div>

      <p :class="titulo">Notícias</p>
      <ul class="list-none p-0">
        <li v-for="link in [LINK_ULTIMAS, ...EDITORIAS]" :key="link.to">
          <NuxtLink :to="link.to" :class="item" @click="emit('fechar')">{{ link.label }}</NuxtLink>
        </li>
      </ul>

      <p :class="titulo">Empresas e profissionais</p>
      <ul class="list-none p-0">
        <li v-for="link in LINKS_DIRETORIO" :key="link.to">
          <NuxtLink :to="link.to" :class="item" @click="emit('fechar')">{{ link.label }}</NuxtLink>
        </li>
      </ul>

      <p :class="titulo">Para você e sua empresa</p>
      <ul class="list-none p-0">
        <li>
          <NuxtLink :to="LINK_ANUNCIE.to" :class="item" class="!text-brand-ink !font-bold" @click="emit('fechar')">{{ LINK_ANUNCIE.label }}</NuxtLink>
        </li>
        <li>
          <NuxtLink :to="LINK_MEUS_PEDIDOS.to" :class="item" @click="emit('fechar')">{{ LINK_MEUS_PEDIDOS.label }}</NuxtLink>
        </li>
        <li v-if="quantidadeTotal > 0">
          <NuxtLink to="/carrinho" :class="item" @click="emit('fechar')">Carrinho ({{ quantidadeTotal }})</NuxtLink>
        </li>
        <li v-for="link in MAIS" :key="link.to">
          <NuxtLink :to="link.to" :class="item" @click="emit('fechar')">{{ link.label }}</NuxtLink>
        </li>
      </ul>

      <p :class="titulo">Redes</p>
      <ul class="flex list-none flex-wrap gap-x-5 p-0">
        <li v-for="rede in redes" :key="rede.label">
          <a :href="rede.href" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-[44px] items-center text-sm font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline">
            {{ rede.label }}<span class="sr-only"> (abre em nova aba)</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>
