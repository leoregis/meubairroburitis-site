<script setup lang="ts">
const tituloHome = 'Meu Bairro Buritis — Anuncie no Buritis e Estoril'
const descricaoHome =
  'A maior comunidade online do Buritis e Estoril desde 2012. Mais de 150 mil pessoas no Facebook e 55 mil no Instagram. Anuncie sua empresa com quem realmente vive o bairro.'

// og:image precisa ser URL absoluta -- WhatsApp/Facebook não resolvem
// caminho relativo, e a home saía sem preview nenhum ao ser compartilhada.
useSeoMeta({
  title: tituloHome,
  description: descricaoHome,
  ogTitle: tituloHome,
  ogDescription: descricaoHome,
  ogImage: 'https://meubairroburitis.com.br/og/capa-buritis.jpg',
  twitterCard: 'summary_large_image',
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
    <!-- depois das notícias de propósito: o topo da home é o funil do
    anunciante (hero -> números -> app -> pacotes) e não deve ser empurrado;
    notícias + vitrine do comércio formam o bloco de conteúdo pro morador. -->
    <HomeGuiaLocalDestaque />
    <HomeDepoimentos />
    <HomeTimeSection />
    <HomeMidiakitResumo />
  </div>
</template>
