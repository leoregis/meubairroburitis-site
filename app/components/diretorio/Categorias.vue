<script setup lang="ts">
// Chips de categoria das listagens de empresas e prestadores (redesign,
// fase 4) -- substituem os FiltroCategorias de cada tipo. Mesmos links.
import type { CategoriaOpcao } from '~/composables/useEmpresasPrestadoresListagem'

defineProps<{ base: '/empresas' | '/prestadores'; categorias: CategoriaOpcao[]; ativa?: string }>()
</script>

<template>
  <nav aria-label="Filtrar por categoria" class="-mx-4 sm:mx-0">
    <ul class="flex list-none gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      <li class="flex-none"><BaseChip :to="base" :ativo="!ativa">Todas</BaseChip></li>
      <li v-for="c in categorias" :key="c.id" class="flex-none">
        <BaseChip :to="`${base}/categoria/${c.slug}`" :ativo="ativa === c.slug">{{ c.nome }}</BaseChip>
      </li>
    </ul>
  </nav>
</template>
