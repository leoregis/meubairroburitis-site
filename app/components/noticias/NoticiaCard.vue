<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

// Card editorial (redesign, fase 3). No celular é uma linha: texto à
// esquerda e miniatura quadrada à direita, separadas por linhas, como no
// protótipo. Do tablet em diante vira bloco com a capa em cima.
// `nivel`: h2 nas listagens (logo abaixo do h1 da página), h3 onde o card
// fica dentro de uma seção com h2 (Leia também, O Bairro).
// `prioridade`: só no primeiro card visível da listagem (LCP).
const props = withDefaults(defineProps<{
  noticia: Noticia
  nivel?: 'h2' | 'h3'
  prioridade?: boolean
}>(), { nivel: 'h3', prioridade: false })

const capa = useCapaNoticia()(props.noticia.imagem_destaque_url)
const link = computed(() => `/noticias/${props.noticia.slug}`)
const categoria = computed(() => props.noticia.categoria_info?.rotulo || props.noticia.categoria || '')
const linkCategoria = computed(() => {
  const id = props.noticia.categoria_info?.id
  if (!id) return null
  return id === 'guias' ? '/conteudo' : `/noticias/categoria/${id}`
})
const data = computed(() => formatarDataCurta(props.noticia.data_publicacao))
</script>

<template>
  <article class="flex flex-row-reverse items-start gap-3.5 border-t border-line py-4 sm:flex-col sm:gap-3 sm:pb-8 sm:pt-5">
    <NuxtLink :to="link" tabindex="-1" aria-hidden="true" class="block flex-none overflow-hidden rounded-mbb-md bg-chip sm:w-full sm:rounded-[18px]">
      <img
        v-if="capa"
        :src="capa.src"
        :srcset="capa.srcset"
        sizes="(max-width: 639px) 96px, (max-width: 1023px) 46vw, 380px"
        alt=""
        width="1200"
        height="630"
        :loading="prioridade ? 'eager' : 'lazy'"
        :fetchpriority="prioridade ? 'high' : undefined"
        decoding="async"
        class="h-24 w-24 object-cover sm:aspect-[1200/630] sm:h-auto sm:w-full"
      >
    </NuxtLink>
    <div class="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
      <p v-if="noticia.tipo_conteudo === 'patrocinado'" class="m-0 text-[11px] font-bold uppercase tracking-[0.1em] text-sponsor">Conteúdo publicitário</p>
      <p class="m-0 text-[11px] font-bold uppercase leading-[14px] tracking-[0.1em] text-brand-ink">
        <NuxtLink v-if="linkCategoria" :to="linkCategoria" class="hover:underline">{{ categoria }}</NuxtLink>
        <template v-else>{{ categoria }}</template>
        <template v-if="categoria && data"> · </template>{{ data }}
      </p>
      <component :is="nivel" class="m-0 text-base font-bold leading-[21px] text-ink sm:text-lg sm:leading-6 sm:tracking-[-0.01em]">
        <NuxtLink :to="link" class="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          {{ noticia.titulo }}
        </NuxtLink>
      </component>
      <p v-if="noticia.subtitulo" class="m-0 hidden text-sm leading-[21px] text-ink-muted sm:line-clamp-3">{{ noticia.subtitulo }}</p>
    </div>
  </article>
</template>
