<script setup lang="ts">
// Abas Notícias | Guias da /conteudo (hub de guias). As listagens de
// /noticias usam os chips de editoria (NoticiasEditorias) desde o redesign.
defineProps<{ ativa: 'noticias' | 'guias' }>()
</script>

<template>
  <nav aria-label="Seções" class="mb-8 flex justify-center gap-2">
    <BaseChip to="/noticias" :ativo="ativa === 'noticias'">Notícias</BaseChip>
    <BaseChip to="/conteudo" :ativo="ativa === 'guias'">Guias</BaseChip>
  </nav>
</template>
