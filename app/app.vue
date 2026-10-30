<script setup lang="ts">
// Preload da Plus Jakarta Sans (latin) -- é a fonte do cabeçalho e do título
// do hero, acima da dobra em toda página. Arquivo variável: um só woff2
// (~27 KB) cobre todos os pesos, então é o único preload. O ?url dá o mesmo
// nome com hash que o fonte.css usa, e o navegador baixa uma vez só.
// Só no servidor: declarado também no cliente, a hidratação trocava o href
// pelo endereço absoluto e o navegador baixava a fonte de novo (visto no
// Lighthouse da fase 3).
import fonteLatin from '~/assets/fontes/plus-jakarta-sans-latin.woff2?url'

if (import.meta.server) {
  useHead({
    link: [{ rel: 'preload', as: 'font', type: 'font/woff2', href: fonteLatin, crossorigin: 'anonymous' }],
  })
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
