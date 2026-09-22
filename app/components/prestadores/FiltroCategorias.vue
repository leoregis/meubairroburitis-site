<script setup lang="ts">
import type { CategoriaOpcao } from '~/composables/useEmpresasPrestadoresListagem'

defineProps<{ categorias: CategoriaOpcao[]; categoriaAtiva?: string }>()
</script>

<template>
  <nav class="mb-8 flex flex-wrap justify-center gap-2" aria-label="Filtrar por categoria">
    <NuxtLink
      to="/prestadores"
      class="rounded-full border px-4 py-1.5 text-sm font-semibold"
      :class="!categoriaAtiva ? 'border-orange-600 bg-orange-50 text-orange-800' : 'border-stone-300 text-stone-600 hover:bg-stone-50'"
    >
      Todos
    </NuxtLink>
    <NuxtLink
      v-for="categoria in categorias"
      :key="categoria.id"
      :to="`/prestadores/categoria/${categoria.slug}`"
      class="rounded-full border px-4 py-1.5 text-sm font-semibold"
      :class="categoriaAtiva === categoria.slug ? 'border-orange-600 bg-orange-50 text-orange-800' : 'border-stone-300 text-stone-600 hover:bg-stone-50'"
    >
      {{ categoria.nome }}
    </NuxtLink>
  </nav>
</template>
