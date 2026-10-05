<script setup lang="ts">
import { LINKS_INSTITUCIONAIS } from '~/constants/navegacao'

// Moldura comum das páginas institucionais (Expediente, Política
// Editorial, Correções, Publicidade) -- mesmo padrão de cabeçalho da
// página O Bairro Buritis (breadcrumb + chapéu + h1) e corpo em prose,
// com a navegação entre as páginas institucionais no fim.
const props = defineProps<{ titulo: string }>()

const route = useRoute()
const siteConfig = useSiteConfig()

// sem a barra final: o Apache pode servir /expediente/ (diretório com
// index.html) e o filtro não pode depender disso
const caminhoAtual = computed(() => route.path.replace(/\/+$/, ''))
const outrasPaginas = computed(() => LINKS_INSTITUCIONAIS.filter((link) => link.to !== caminhoAtual.value))

useJsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteConfig.url}/` },
    { '@type': 'ListItem', position: 2, name: props.titulo, item: `${siteConfig.url}${route.path}` },
  ],
})
</script>

<template>
  <article class="mx-auto max-w-2xl px-4 py-10 sm:py-14">
    <header>
      <nav aria-label="Breadcrumb" class="text-sm text-stone-500">
        <ol class="flex flex-wrap items-center gap-1">
          <li><NuxtLink to="/" class="hover:text-orange-700 hover:underline">Início</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li><span aria-current="page" class="text-stone-700">{{ titulo }}</span></li>
        </ol>
      </nav>

      <p class="mt-6 text-sm font-semibold uppercase tracking-wide text-orange-700">Institucional</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
        {{ titulo }}
      </h1>
    </header>

    <div class="prose prose-stone mt-8 max-w-none sm:prose-lg prose-headings:font-serif prose-headings:text-stone-900 prose-a:text-orange-800 prose-a:underline-offset-2 hover:prose-a:text-orange-700">
      <slot />
    </div>

    <nav aria-labelledby="institucional-titulo" class="mt-14 rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
      <h2 id="institucional-titulo" class="font-serif text-lg font-bold text-stone-900">Páginas institucionais</h2>
      <ul class="mt-3 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-2">
        <li v-for="link in outrasPaginas" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="inline-flex min-h-[44px] items-center text-stone-800 underline decoration-stone-300 underline-offset-4 hover:text-orange-700 hover:decoration-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-700"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </article>
</template>
