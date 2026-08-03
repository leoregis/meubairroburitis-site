<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

defineProps<{ noticia: Noticia }>()
</script>

<template>
  <NuxtLink
    :to="`/noticias/${noticia.slug}`"
    class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:rounded-2xl"
  >
    <img
      v-if="noticia.imagem_destaque_url"
      :src="noticia.imagem_destaque_url"
      :alt="noticia.imagem_destaque_alt || noticia.titulo"
      loading="lazy"
      class="h-32 w-full object-cover sm:h-44"
    />
    <div class="flex flex-1 flex-col p-3 sm:p-6">
      <p v-if="noticia.categoria" class="text-xs font-semibold uppercase tracking-wide text-orange-700">
        {{ noticia.categoria }}
      </p>
      <h3 class="mt-1 font-serif text-sm font-bold text-stone-900 sm:text-lg">{{ noticia.titulo }}</h3>
      <p class="mt-1 flex-1 text-sm text-stone-500">{{ noticia.subtitulo }}</p>
      <p class="mt-2 text-xs text-stone-400">{{ formatarDataNoticia(noticia.data_publicacao) }}</p>
    </div>
  </NuxtLink>
</template>
