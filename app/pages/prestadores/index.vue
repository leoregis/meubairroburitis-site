<script setup lang="ts">
const { data: categorias } = await useCategoriasPrestador()

useSeoMeta({
  title: 'Prestadores de serviço do Buritis e Estoril — Meu Bairro Buritis',
  description: 'Encontre prestadores de serviço no bairro Buritis e Estoril: reformas, saúde, beleza, aulas e muito mais, por categoria.',
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <DiretorioCabecalho eyebrow="Serviços no bairro" titulo="Prestadores" descricao="Profissionais que atendem o Buritis e o Estoril, por categoria de serviço." />
    <DiretorioCategorias base="/prestadores" :categorias="categorias ?? []" />
    <PrestadoresListagem :pagina="1" />
  </div>
</template>
