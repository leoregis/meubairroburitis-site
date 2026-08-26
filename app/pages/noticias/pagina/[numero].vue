<script setup lang="ts">
const route = useRoute()
const pagina = Number(route.params.numero)

if (!Number.isInteger(pagina) || pagina < 2) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

// mesma chave de useAsyncData que NoticiasListagem usa pra essa página --
// Nuxt deduplica, não faz a busca duas vezes -- só usamos aqui pra saber
// se a página pedida existe de verdade antes de renderizar
const { data } = await useNoticiasPagina(pagina)
if (pagina > (data.value?.totalPaginas ?? 1)) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

useSeoMeta({
  title: `Notícias — página ${pagina} — Meu Bairro Buritis`,
  description: 'Fique por dentro das notícias do bairro Buritis: eventos, segurança, comércio local e mais.',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Fique por dentro</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">Notícias</h1>
    </div>

    <NoticiasAbasSecao ativa="noticias" />
    <NoticiasListagem :pagina="pagina" />
  </div>
</template>
