<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

// Matéria em destaque no topo da primeira página de /noticias: capa grande
// à esquerda e texto à direita no computador; empilhado no celular. A capa
// é o LCP da listagem: carregamento imediato e prioridade alta.
const props = defineProps<{ noticia: Noticia }>()

const capa = useCapaNoticia()(props.noticia.imagem_destaque_url)
const link = computed(() => `/noticias/${props.noticia.slug}`)
const categoria = computed(() => props.noticia.categoria_info?.rotulo || props.noticia.categoria || '')

if (capa?.srcset) {
  useHead({
    link: [{ rel: 'preload', as: 'image', imagesrcset: capa.srcset, imagesizes: '(min-width: 1024px) 700px, 100vw', fetchpriority: 'high', key: 'capa-destaque' }],
  })
}
</script>

<template>
  <article class="grid gap-4 border-t border-line pt-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:pt-6">
    <NuxtLink :to="link" tabindex="-1" aria-hidden="true" class="block overflow-hidden rounded-[18px] bg-chip sm:rounded-mbb-xl">
      <img
        v-if="capa"
        :src="capa.src"
        :srcset="capa.srcset"
        sizes="(min-width: 1024px) 700px, 100vw"
        :alt="noticia.imagem_destaque_alt || ''"
        width="1200"
        height="630"
        loading="eager"
        fetchpriority="high"
        class="aspect-[1200/630] h-auto w-full object-cover"
      >
    </NuxtLink>
    <div class="flex flex-col gap-3 lg:justify-center">
      <p v-if="noticia.tipo_conteudo === 'patrocinado'" class="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-sponsor">Conteúdo publicitário</p>
      <p class="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-ink">
        {{ categoria }}<template v-if="categoria && noticia.data_publicacao"> · </template>{{ formatarDataNoticia(noticia.data_publicacao) }}
      </p>
      <h2 class="m-0 text-balance text-2xl font-extrabold leading-[30px] tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-10">
        <NuxtLink :to="link" class="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          {{ noticia.titulo }}
        </NuxtLink>
      </h2>
      <p v-if="noticia.subtitulo" class="m-0 text-[15px] leading-[23px] text-ink-muted sm:text-[17px] sm:leading-[27px]">{{ noticia.subtitulo }}</p>
    </div>
  </article>
</template>
