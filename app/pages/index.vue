<script setup lang="ts">
useSeoMeta({
  title: 'Meu Bairro Buritis — Anuncie no Buritis e Estoril',
  description:
    'A maior comunidade online do Buritis e Estoril desde 2012. Mais de 150 mil pessoas no Facebook e 55 mil no Instagram. Anuncie sua empresa com quem realmente vive o bairro.',
  ogImage: '/og/capa-buritis.jpg',
})

useJsonLd({
  '@type': 'Organization',
  name: 'Meu Bairro Buritis',
  logo: 'https://meubairroburitis.com.br/logo/logo_mbb_rodape.png',
  sameAs: [
    'https://www.instagram.com/meubairroburitis/',
    'https://www.facebook.com/MeuBairroBuritis/',
    'https://www.tiktok.com/@meubairroburitis',
  ],
})
</script>

<template>
  <div>
    <HomeHeroConversao />
    <HomeNumerosDestaque />
    <HomeAppDestaque />
    <HomePacotesComparativo />
    <HomeInstagramEmbed />
    <HomeUltimasNoticias />
    <HomeDepoimentos />
    <HomeTimeSection />
    <HomeMidiakitResumo />
  </div>
</template>
