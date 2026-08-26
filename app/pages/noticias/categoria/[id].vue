<script setup lang="ts">
// "Guias" tem hub próprio (reaproveitando a rota /conteudo, já reservada
// pra isso) -- evita ter duas URLs mostrando o mesmo conteúdo. Middleware
// de página é o jeito correto de redirecionar antes do resto do setup
// rodar (um `navigateTo` solto no meio do script não interrompe o
// carregamento do resto da página).
definePageMeta({
  middleware: [
    (to) => {
      if (to.params.id === 'guias') return navigateTo('/conteudo', { redirectCode: 301 })
    },
  ],
})

const route = useRoute()
const categoriaId = route.params.id as string

const { data: categoria } = await useCategoria(categoriaId)

if (!categoria.value) {
  throw createError({ statusCode: 404, message: 'Categoria não encontrada' })
}

const { data: noticias } = await useNoticiasPorCategoria(categoriaId)

useSeoMeta({
  title: () => `${categoria.value?.rotulo} — Meu Bairro Buritis`,
  description: () => `Notícias e conteúdos do Buritis sobre ${categoria.value?.rotulo}.`,
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <NuxtLink to="/noticias" class="text-sm text-stone-500 hover:text-orange-700">← Todas as notícias</NuxtLink>
      <p class="mt-4 text-sm font-semibold uppercase tracking-wide text-orange-700">Categoria</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">{{ categoria?.rotulo }}</h1>
    </div>

    <p v-if="!noticias?.length" class="text-center text-stone-500">
      Nenhuma notícia publicada nessa categoria ainda.
    </p>
    <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="noticia in noticias" :key="noticia.id" :noticia="noticia" />
    </div>
  </div>
</template>
