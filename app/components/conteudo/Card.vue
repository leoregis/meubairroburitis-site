<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

defineProps<{ artigo: Noticia }>()
</script>

<template>
  <NuxtLink
    :to="`/conteudo/${artigo.slug}`"
    class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:rounded-2xl"
  >
    <NuxtPicture
      v-if="artigo.imagem_destaque_url"
      :src="artigo.imagem_destaque_url"
      :alt="artigo.imagem_destaque_alt || artigo.titulo"
      format="avif,webp"
      :width="400"
      :height="210"
      loading="lazy"
      :img-attrs="{ class: 'h-32 w-full object-cover sm:h-44' }"
    />
    <div class="flex flex-1 flex-col p-3 sm:p-6">
      <p v-if="artigo.categoria" class="text-xs font-semibold uppercase tracking-wide text-orange-700">
        {{ artigo.categoria }}
      </p>
      <h3 class="mt-1 font-serif text-sm font-bold text-stone-900 sm:text-lg">{{ artigo.titulo }}</h3>
      <p class="mt-1 flex-1 text-sm text-stone-500">{{ artigo.subtitulo }}</p>
      <p class="mt-2 text-xs text-stone-400">{{ formatarDataNoticia(artigo.data_publicacao) }}</p>
    </div>
  </NuxtLink>
</template>
