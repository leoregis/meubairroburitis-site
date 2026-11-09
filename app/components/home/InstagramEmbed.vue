<script setup lang="ts">
// 🖼️ o widget oficial do Instagram (embed.js) força min-width: 326px no
// iframe convertido, não importa a largura do container -- numa grade de
// 2 colunas no mobile (coluna com menos de 200px) isso estoura a coluna e
// corta o conteúdo (texto truncado, vídeo cortado ao meio). Por isso os
// posts abaixo usam miniaturas estáticas (recorte só do quadro de mídia,
// sem o cabeçalho/rodapé do widget) -- cabe em qualquer tamanho de coluna
// e ainda linka pro post real no Instagram.
const posts = [
  { id: 'DaSeN3RCzWV', permalink: 'https://www.instagram.com/reel/DaSeN3RCzWV/' },
  { id: 'DaVpZ16xyLG', permalink: 'https://www.instagram.com/reel/DaVpZ16xyLG/' },
  { id: 'DajDsbFRHhV', permalink: 'https://www.instagram.com/reel/DajDsbFRHhV/' },
  { id: 'DaP2zVjxY-5', permalink: 'https://www.instagram.com/reel/DaP2zVjxY-5/' },
  { id: 'DZa3ZRJx81Q', permalink: 'https://www.instagram.com/reel/DZa3ZRJx81Q/' },
  { id: 'DXrgiz8gvtp', permalink: 'https://www.instagram.com/reel/DXrgiz8gvtp/' },
]
</script>

<template>
  <section aria-labelledby="instagram-titulo" class="mx-auto max-w-[1248px] px-4 py-14 sm:px-6 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-line pb-3">
      <div class="flex flex-col gap-2">
        <BaseEyebrow>No Instagram</BaseEyebrow>
        <h2 id="instagram-titulo" class="m-0 text-balance text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[40px]">
          Um pouco do que já publicamos
        </h2>
      </div>
      <a
        href="https://www.instagram.com/meubairroburitis/"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-[44px] items-center text-sm font-bold text-brand-ink hover:text-brand-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
      >
        Ver mais no @meubairroburitis →
        <span class="sr-only">(abre em nova aba)</span>
      </a>
    </div>

    <div class="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      <a
        v-for="post in posts"
        :key="post.id"
        :href="post.permalink"
        target="_blank"
        rel="noopener noreferrer"
        class="group block overflow-hidden rounded-mbb-lg border border-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:rounded-mbb-xl"
      >
        <NuxtPicture
          :src="`/instagram/${post.id}.jpg`"
          :alt="`Publicação do @meubairroburitis no Instagram`"
          format="avif,webp"
          :width="326"
          :height="404"
          :img-attrs="{ class: 'h-full w-full object-cover transition duration-300 group-hover:scale-105' }"
        />
      </a>
    </div>
  </section>
</template>
