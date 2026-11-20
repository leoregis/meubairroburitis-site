<script setup lang="ts">
// /games -- "MB Buritis Games" (20/11/2026). Lista os jogos do banco do site
// (tabela games, aba Games do admin), lidos no build. Ao salvar no admin, a
// fila de deploy regera esta página (item 'game', build incremental).
const TITULO = 'MB Buritis Games'
const SUBTITULO = 'Os jogos criados pelo Meu Bairro Buritis'
const TITULO_SEO = 'MB Buritis Games — Os jogos do Meu Bairro Buritis'
const DESCRICAO_SEO = 'Conheça os jogos criados pelo Meu Bairro Buritis: aventura no bairro, duelo de cartas e mais. Jogue no celular ou no computador.'
const URL_PAGINA = 'https://meubairroburitis.com.br/games'

const { data: games } = await useGames()
const lista = computed(() => games.value ?? [])

// og:image: imagem do primeiro jogo que tiver uma; senão a capa padrão do site
const imagemAbsoluta = useImagemGameAbsoluta()
const comImagem = computed(() => lista.value.find((g) => g.imagem_url))
const ogImagem = computed(() => imagemAbsoluta(comImagem.value?.imagem_url) || 'https://meubairroburitis.com.br/og/capa-buritis.jpg')
const ogImagemAlt = computed(() => (comImagem.value ? comImagem.value.imagem_alt || comImagem.value.nome : TITULO))

useSeoMeta({
  title: TITULO_SEO,
  description: DESCRICAO_SEO,
  ogTitle: TITULO_SEO,
  ogDescription: DESCRICAO_SEO,
  ogUrl: URL_PAGINA,
  ogType: 'website',
  ogImage: ogImagem,
  ogImageAlt: ogImagemAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: TITULO_SEO,
  twitterDescription: DESCRICAO_SEO,
  twitterImage: ogImagem,
  twitterImageAlt: ogImagemAlt,
}, { tagPriority: 15 })

useJsonLd({
  '@type': 'ItemList',
  name: TITULO,
  description: SUBTITULO,
  url: URL_PAGINA,
  numberOfItems: lista.value.length,
  itemListElement: lista.value.map((g, i) => {
    const link = linkDoGame(g)
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoGame',
        name: g.nome,
        description: g.descricao,
        ...(g.imagem_url ? { image: imagemAbsoluta(g.imagem_url) } : {}),
        ...(link ? { url: link } : {}),
        publisher: { '@type': 'Organization', name: 'Meu Bairro Buritis', url: 'https://meubairroburitis.com.br/' },
      },
    }
  }),
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-8 px-4 pb-14 pt-6 sm:gap-10 sm:px-6 sm:pb-20 sm:pt-10">
    <header class="flex max-w-[760px] flex-col gap-2">
      <BaseEyebrow>Games</BaseEyebrow>
      <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">
        {{ TITULO }}
      </h1>
      <p class="m-0 text-balance text-lg leading-7 text-ink-muted sm:text-xl sm:leading-8">{{ SUBTITULO }}</p>
    </header>

    <ul v-if="lista.length" class="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      <li v-for="(game, i) in lista" :key="game.id">
        <GamesCard :game="game" :prioridade="i === 0" />
      </li>
    </ul>
    <p v-else class="m-0 text-ink-muted">Novos jogos em breve.</p>
  </div>
</template>
