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
  <article class="mx-auto max-w-[760px] px-4 pb-16 pt-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <header class="flex flex-col gap-2">
      <nav aria-label="Breadcrumb" class="text-sm text-ink-muted">
        <ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
          <li><NuxtLink to="/" class="inline-flex min-h-[44px] items-center font-bold text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Início</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li><span aria-current="page" class="text-ink">{{ titulo }}</span></li>
        </ol>
      </nav>

      <BaseEyebrow class="mt-2">Institucional</BaseEyebrow>
      <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">
        {{ titulo }}
      </h1>
    </header>

    <div class="prose prose-lg mt-8 max-w-none text-ink prose-p:text-ink prose-li:text-ink prose-headings:font-extrabold prose-headings:tracking-[-0.015em] prose-headings:text-ink prose-strong:text-ink prose-a:font-semibold prose-a:text-brand-ink prose-a:underline-offset-2 hover:prose-a:text-brand-deep">
      <slot />
    </div>

    <nav aria-labelledby="institucional-titulo" class="mt-14 rounded-mbb-xl border border-line bg-ground p-5 sm:p-6">
      <h2 id="institucional-titulo" class="m-0 text-lg font-extrabold text-ink">Páginas institucionais</h2>
      <ul class="m-0 mt-3 grid list-none gap-x-6 gap-y-1 p-0 text-[15px] sm:grid-cols-2">
        <li v-for="link in outrasPaginas" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="inline-flex min-h-[44px] items-center font-semibold text-ink underline decoration-line underline-offset-4 hover:text-brand-ink hover:decoration-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </article>
</template>
