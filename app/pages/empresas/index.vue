<script setup lang="ts">
const { data: categorias } = await useCategoriasEmpresa()

useSeoMeta({
  title: 'Empresas do Buritis e Estoril — Meu Bairro Buritis',
  description: 'Encontre empresas do bairro Buritis e Estoril: alimentação, moda, beleza, saúde e muito mais, por categoria.',
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <DiretorioCabecalho eyebrow="Comércio local" titulo="Empresas" descricao="Empresas do Buritis e do Estoril, por categoria: comércio, serviços, alimentação, saúde e muito mais." />
    <DiretorioCategorias base="/empresas" :categorias="categorias ?? []" />
    <EmpresasListagem :pagina="1" />
  </div>
</template>
