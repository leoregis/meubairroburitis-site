<script setup lang="ts">
// Chips das editorias no topo das listagens de notícias (redesign, fase 3).
// "Guias" é a editoria com hub próprio em /conteudo (ver noticias/categoria/[id]).
const props = defineProps<{ ativa?: string }>()

const { data: categorias } = await useCategorias()

const itens = computed(() => [
  { id: '', rotulo: 'Todas', to: '/noticias' },
  ...(categorias.value ?? []).map((c) => ({ id: c.id, rotulo: c.rotulo, to: c.id === 'guias' ? '/conteudo' : `/noticias/categoria/${c.id}` })),
])
</script>

<template>
  <nav aria-label="Filtrar notícias por editoria" class="-mx-4 sm:mx-0">
    <ul class="flex list-none gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      <li v-for="item in itens" :key="item.to" class="flex-none">
        <BaseChip :to="item.to" :ativo="(props.ativa ?? '') === item.id">{{ item.rotulo }}</BaseChip>
      </li>
    </ul>
  </nav>
</template>
