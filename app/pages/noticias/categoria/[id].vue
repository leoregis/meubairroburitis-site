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

const { data: noticias } = await useNoticiasPorCategoria(categoriaId, { resumo: true })

useSeoMeta({
  title: () => `${categoria.value?.rotulo} — Meu Bairro Buritis`,
  description: () => `Notícias e conteúdos do Buritis sobre ${categoria.value?.rotulo}.`,
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <header class="flex flex-col gap-2">
      <NuxtLink to="/noticias" class="inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-bold text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
        <Icon name="lucide:arrow-left" class="h-4 w-4" aria-hidden="true" />
        Todas as notícias
      </NuxtLink>
      <BaseEyebrow>Editoria</BaseEyebrow>
      <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">{{ categoria?.rotulo }}</h1>
    </header>

    <NoticiasEditorias :ativa="categoriaId" />

    <p v-if="!noticias?.length" class="text-ink-muted">Nenhuma notícia publicada nessa editoria ainda.</p>
    <div v-else class="grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="(noticia, i) in noticias" :key="noticia.id" :noticia="noticia" nivel="h2" :prioridade="i === 0" />
    </div>
  </div>
</template>
