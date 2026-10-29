<script setup lang="ts">
import { ORGANIZACAO_SCHEMA, URL_SITE } from '~/constants/institucional'

// Redesign (fase 2): a home passa a ser editorial -- conteúdo primeiro, o
// funil do anunciante no bloco "Para empresas" e no "Anuncie" fixo do
// cabeçalho. Title/description aprovados pelo Leo (decisão 1 do
// docs/redesign/plano.md); a intenção "anunciar" fica com a /loja.
const tituloHome = 'Meu Bairro Buritis — Notícias e guia do Buritis e Estoril'
const descricaoHome =
  'Notícias, empresas e serviços do Buritis e do Estoril, em BH, desde 2012. A maior comunidade do bairro: 150 mil+ no Facebook e 55 mil+ no Instagram.'

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

// Organization (como antes) + WebSite (decisão 2). Sem SearchAction por
// enquanto: a /busca é noindex e roda no navegador.
useJsonLd({
  '@graph': [
    {
      ...ORGANIZACAO_SCHEMA,
      sameAs: [
        'https://www.instagram.com/meubairroburitis/',
        'https://www.facebook.com/MeuBairroBuritis/',
        'https://www.tiktok.com/@meubairroburitis',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${URL_SITE}/#website`,
      name: 'Meu Bairro Buritis',
      url: `${URL_SITE}/`,
      inLanguage: 'pt-BR',
      publisher: { '@id': ORGANIZACAO_SCHEMA['@id'] },
    },
  ],
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-10 px-4 pb-16 pt-4 sm:gap-16 sm:px-6 sm:pb-[72px] sm:pt-8">
    <HomeHero />
    <HomeUltimas />
    <HomeCanais />
    <HomeGuia />
    <HomeEspacoPublicitario />
    <HomeParaEmpresas />
  </div>
</template>
