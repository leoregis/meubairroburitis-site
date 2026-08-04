<script setup lang="ts">
const { data: artigos } = await useConteudoLista()
</script>

<template>
  <div>
    <p v-if="!artigos?.length" class="text-center text-stone-500">Nenhum conteúdo publicado ainda.</p>

    <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <ConteudoCard v-for="artigo in artigos" :key="artigo.id" :artigo="artigo" />
    </div>
  </div>
</template>
