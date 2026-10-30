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
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <DiretorioCabecalho eyebrow="Serviços no bairro" :titulo="categoria?.nome ?? ''" :voltar="{ to: '/prestadores', rotulo: 'Todas as categorias' }" />
    <DiretorioCategorias base="/prestadores" :categorias="categorias ?? []" :ativa="categoriaSlug" />
    <PrestadoresListagem :pagina="pagina" :categoria-slug="categoriaSlug" />
  </div>
</template>
