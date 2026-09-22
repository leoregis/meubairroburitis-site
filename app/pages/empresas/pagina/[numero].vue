<script setup lang="ts">
const route = useRoute()
const pagina = Number(route.params.numero)

if (!Number.isInteger(pagina) || pagina < 2) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

const { data: categorias } = await useCategoriasEmpresa()
const { data } = await useEmpresasPagina(pagina)
if (pagina > (data.value?.totalPaginas ?? 1)) {
  throw createError({ statusCode: 404, message: 'Página não encontrada' })
}

useSeoMeta({
  title: `Empresas — página ${pagina} — Meu Bairro Buritis`,
  description: 'Encontre empresas do bairro Buritis e Estoril: alimentação, moda, beleza, saúde e muito mais, por categoria.',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Comércio local</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">Empresas</h1>
    </div>

    <EmpresasFiltroCategorias :categorias="categorias ?? []" />
    <EmpresasListagem :pagina="pagina" />
  </div>
</template>
