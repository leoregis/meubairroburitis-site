<script setup lang="ts">
const route = useRoute()
const categoriaSlug = route.params.categoriaSlug as string
const pagina = Number(route.params.numero)

if (!Number.isInteger(pagina) || pagina < 2) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

const { data: categorias } = await useCategoriasPrestador()
const categoria = computed(() => categorias.value?.find((c) => c.slug === categoriaSlug))

if (!categoria.value) {
  throw createError({ statusCode: 404, message: 'Categoria não encontrada' })
}

const { data } = await usePrestadoresPagina(pagina, categoriaSlug)
if (pagina > (data.value?.totalPaginas ?? 1)) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

useSeoMeta({
  title: () => `${categoria.value?.nome} — Prestadores — página ${pagina} — Meu Bairro Buritis`,
  description: () => `Prestadores de serviço de ${categoria.value?.nome} no bairro Buritis e Estoril.`,
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Quem faz no bairro</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">{{ categoria?.nome }}</h1>
    </div>

    <PrestadoresFiltroCategorias :categorias="categorias ?? []" :categoria-ativa="categoriaSlug" />
    <PrestadoresListagem :pagina="pagina" :categoria-slug="categoriaSlug" />
  </div>
</template>
