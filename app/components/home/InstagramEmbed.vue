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
  <section class="mx-auto max-w-5xl px-4 py-16 text-center">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">No Instagram</p>
    <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">
      Um pouco do que já publicamos
    </h2>

    <div class="mt-8 grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3">
      <a
        v-for="post in posts"
        :key="post.id"
        :href="post.permalink"
        target="_blank"
        rel="noopener noreferrer"
        class="group block overflow-hidden rounded-xl shadow-sm transition hover:shadow-md sm:rounded-2xl"
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

    <a
      href="https://www.instagram.com/meubairroburitis/"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-8 inline-block text-sm font-semibold text-orange-700 hover:underline"
    >
      Ver mais no @meubairroburitis →
    </a>
  </section>
</template>
