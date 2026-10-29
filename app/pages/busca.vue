<script setup lang="ts">
// /busca (redesign, fase 2; decisão 9): noindex, fora do sitemap. O índice
// vem do build (useIndiceBusca) e a busca roda no navegador. O termo chega
// por ?q= (campo do hero, botão do cabeçalho); num site estático a query não
// existe no HTML gerado, então ela é lida depois de montar a página.
import { buscar } from '~/utils/busca'

useSeoMeta({
  title: 'Busca — Meu Bairro Buritis',
  description: 'Busque notícias, empresas e prestadores de serviço do Buritis e do Estoril.',
  robots: 'noindex',
})

const route = useRoute()
const router = useRouter()
const { data: indice } = await useIndiceBusca()

const campo = ref('')
const termo = ref('')
const pronto = ref(false)
const POR_GRUPO = 10
const mostrarTudo = reactive({ noticias: false, empresas: false, prestadores: false })

function lerQuery() {
  const q = String(route.query.q || '').trim()
  campo.value = q
  termo.value = q
  mostrarTudo.noticias = mostrarTudo.empresas = mostrarTudo.prestadores = false
}
onMounted(() => { lerQuery(); pronto.value = true })
watch(() => route.query.q, lerQuery)

function enviar() {
  router.replace({ query: campo.value.trim() ? { q: campo.value.trim() } : {} })
}

const resultado = computed(() => (indice.value && termo.value ? buscar(indice.value, termo.value) : null))
const total = computed(() => (resultado.value ? resultado.value.noticias.length + resultado.value.empresas.length + resultado.value.prestadores.length : 0))

const grupos = computed(() => {
  if (!resultado.value) return []
  return ([
    { chave: 'noticias', titulo: 'Notícias', itens: resultado.value.noticias },
    { chave: 'empresas', titulo: 'Empresas', itens: resultado.value.empresas },
    { chave: 'prestadores', titulo: 'Prestadores de serviço', itens: resultado.value.prestadores },
  ] as const).filter((g) => g.itens.length)
})
</script>

<template>
  <!-- min-h: os resultados entram depois de montar (a query não existe no
       HTML estático); a altura reservada impede o rodapé de pular -->
  <div class="mx-auto flex min-h-[110vh] max-w-[880px] flex-col gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
    <div class="flex flex-col gap-4">
      <h1 class="m-0 text-[28px] font-extrabold leading-9 tracking-[-0.02em] text-ink sm:text-4xl">Buscar no Meu Bairro Buritis</h1>
      <form role="search" class="flex flex-wrap gap-2" action="/busca" method="get" @submit.prevent="enviar">
        <label for="busca-campo" class="sr-only">Buscar notícias, empresas e prestadores</label>
        <input
          id="busca-campo"
          v-model="campo"
          name="q"
          type="search"
          placeholder="Ex.: padaria, eletricista, trânsito"
          autocomplete="off"
          class="h-[52px] min-w-0 flex-[1_1_220px] rounded-mbb-lg border border-line bg-white px-4 text-[15px] text-ink placeholder:text-ink-subtle focus:border-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
        <BaseBotao tipo="submit" class="h-[52px] px-6">Buscar</BaseBotao>
      </form>
      <!-- aria-live: o leitor de tela ouve a contagem quando o resultado muda -->
      <p class="m-0 min-h-5 text-sm text-ink-muted" aria-live="polite">
        <template v-if="pronto && termo && total">
          {{ total }} {{ total === 1 ? 'resultado' : 'resultados' }} para “{{ termo }}”
        </template>
      </p>
    </div>

    <template v-if="pronto && termo">
      <section v-for="g in grupos" :key="g.chave" :aria-labelledby="`busca-${g.chave}`" class="flex flex-col gap-2">
        <BaseSectionHeader :id="`busca-${g.chave}`" :titulo="`${g.titulo} (${g.itens.length})`" />
        <ul class="m-0 list-none p-0">
          <li v-for="item in (mostrarTudo[g.chave] ? g.itens : g.itens.slice(0, POR_GRUPO))" :key="item.to" class="border-b border-line">
            <NuxtLink :to="item.to" class="flex flex-col gap-1 py-3.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              <BaseEyebrow v-if="item.data" class="!text-xs">{{ item.data }}</BaseEyebrow>
              <span class="text-base font-bold leading-[22px] hover:underline">{{ item.titulo }}</span>
              <span v-if="item.detalhe" class="line-clamp-2 text-sm text-ink-muted">{{ item.detalhe }}</span>
            </NuxtLink>
          </li>
        </ul>
        <button
          v-if="g.itens.length > POR_GRUPO && !mostrarTudo[g.chave]"
          type="button"
          class="inline-flex min-h-[44px] items-center self-start text-sm font-bold text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          @click="mostrarTudo[g.chave] = true"
        >
          Ver mais {{ g.itens.length - POR_GRUPO }} em {{ g.titulo.toLowerCase() }}
        </button>
      </section>

      <div v-if="!total" class="flex flex-col gap-4 rounded-mbb-xl bg-ground p-6 sm:p-8">
        <h2 class="m-0 text-xl font-extrabold text-ink">Nada encontrado para “{{ termo }}”</h2>
        <p class="m-0 text-[15px] leading-[22px] text-ink-muted">
          Confira a grafia ou tente uma palavra mais curta (“pizza” em vez de “pizzaria do bairro”).
          Você também pode navegar pelas listas:
        </p>
        <div class="flex flex-wrap gap-2">
          <BaseBotao to="/noticias" variante="contorno">Todas as notícias</BaseBotao>
          <BaseBotao to="/empresas" variante="contorno">Empresas</BaseBotao>
          <BaseBotao to="/prestadores" variante="contorno">Prestadores</BaseBotao>
        </div>
      </div>
    </template>

    <div v-else-if="pronto" class="flex flex-col gap-3 text-[15px] text-ink-muted">
      <p class="m-0">Busque por notícias, empresas e prestadores do Buritis e do Estoril.</p>
      <p class="m-0">
        Ou navegue pelas
        <NuxtLink to="/noticias" class="font-bold text-brand-ink hover:underline">notícias</NuxtLink>,
        <NuxtLink to="/empresas" class="font-bold text-brand-ink hover:underline">empresas</NuxtLink> e
        <NuxtLink to="/prestadores" class="font-bold text-brand-ink hover:underline">prestadores</NuxtLink>.
      </p>
    </div>
  </div>
</template>
