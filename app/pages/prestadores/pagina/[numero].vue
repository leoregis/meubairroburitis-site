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
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Quem faz no bairro</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">Prestadores de serviço</h1>
    </div>

    <PrestadoresFiltroCategorias :categorias="categorias ?? []" />
    <PrestadoresListagem :pagina="pagina" />
  </div>
</template>
