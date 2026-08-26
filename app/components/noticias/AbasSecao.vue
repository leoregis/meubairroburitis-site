<script setup lang="ts">
defineProps<{ ativa: 'noticias' | 'guias' }>()
</script>

<template>
  <nav class="mb-8 flex justify-center gap-2">
    <NuxtLink
      to="/noticias"
      class="rounded-full border px-4 py-1.5 text-sm font-semibold"
      :class="ativa === 'noticias' ? 'border-orange-600 bg-orange-50 text-orange-800' : 'border-stone-300 text-stone-600 hover:bg-stone-50'"
    >
      Notícias
    </NuxtLink>
    <NuxtLink
      to="/conteudo"
      class="rounded-full border px-4 py-1.5 text-sm font-semibold"
      :class="ativa === 'guias' ? 'border-orange-600 bg-orange-50 text-orange-800' : 'border-stone-300 text-stone-600 hover:bg-stone-50'"
    >
      Guias
    </NuxtLink>
  </nav>
</template>
