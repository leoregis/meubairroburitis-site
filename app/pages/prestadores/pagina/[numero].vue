<script setup lang="ts">
const route = useRoute()
const pagina = Number(route.params.numero)

if (!Number.isInteger(pagina) || pagina < 2) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

const { data: categorias } = await useCategoriasPrestador()
const { data } = await usePrestadoresPagina(pagina)
if (pagina > (data.value?.totalPaginas ?? 1)) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

useSeoMeta({
  title: `Prestadores de serviço — página ${pagina} — Meu Bairro Buritis`,
  description: 'Encontre prestadores de serviço no bairro Buritis e Estoril: reformas, saúde, beleza, aulas e muito mais, por categoria.',
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <DiretorioCabecalho eyebrow="Serviços no bairro" titulo="Prestadores" />
    <DiretorioCategorias base="/prestadores" :categorias="categorias ?? []" />
    <PrestadoresListagem :pagina="pagina" />
  </div>
</template>
