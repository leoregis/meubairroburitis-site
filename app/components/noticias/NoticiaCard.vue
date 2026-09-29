<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

const props = defineProps<{ noticia: Noticia }>()

// capas locais (arquivo estático em public/) ganham otimização real via
// NuxtPicture; imagens de Storage (upload pelo admin) continuam via <img>
// simples, como sempre foram.
const imagemEhLocal = computed(() => props.noticia.imagem_destaque_url?.startsWith('/') ?? false)
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:rounded-2xl">
    <NuxtLink :to="`/noticias/${noticia.slug}`" class="contents">
      <NuxtPicture
        v-if="noticia.imagem_destaque_url && imagemEhLocal"
        :src="noticia.imagem_destaque_url"
        :alt="noticia.imagem_destaque_alt || noticia.titulo"
        format="avif,webp"
        :width="400"
        :height="210"
        loading="lazy"
        :img-attrs="{ class: 'h-32 w-full object-cover sm:h-44' }"
      />
      <img
        v-else-if="noticia.imagem_destaque_url"
        :src="noticia.imagem_destaque_url"
        :alt="noticia.imagem_destaque_alt || noticia.titulo"
        loading="lazy"
        class="h-32 w-full object-cover sm:h-44"
      />
    </NuxtLink>
    <div class="flex flex-1 flex-col p-3 sm:p-6">
      <NuxtLink
        v-if="noticia.categoria_info"
        :to="noticia.categoria_info.id === 'guias' ? '/conteudo' : `/noticias/categoria/${noticia.categoria_info.id}`"
        class="-mt-3 inline-flex min-h-[44px] items-center self-start text-xs font-semibold uppercase tracking-wide text-orange-700 hover:underline"
      >
        {{ noticia.categoria_info.rotulo }}
      </NuxtLink>
      <p v-else-if="noticia.categoria" class="text-xs font-semibold uppercase tracking-wide text-orange-700">
        {{ noticia.categoria }}
      </p>
      <NuxtLink :to="`/noticias/${noticia.slug}`">
        <h3 class="mt-1 font-serif text-sm font-bold text-stone-900 sm:text-lg">{{ noticia.titulo }}</h3>
        <p class="mt-1 flex-1 text-sm text-stone-500">{{ noticia.subtitulo }}</p>
        <p class="mt-2 text-xs text-stone-500">{{ formatarDataNoticia(noticia.data_publicacao) }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
