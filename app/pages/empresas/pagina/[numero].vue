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
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <DiretorioCabecalho eyebrow="Comércio local" titulo="Empresas" />
    <DiretorioCategorias base="/empresas" :categorias="categorias ?? []" />
    <EmpresasListagem :pagina="pagina" />
  </div>
</template>
