<script setup lang="ts">
useSeoMeta({
  title: 'Notícias — Meu Bairro Buritis',
  description: 'Fique por dentro das notícias do bairro Buritis: eventos, segurança, comércio local e mais.',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Fique por dentro</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">Notícias</h1>
    </div>

    <NoticiasListagem :pagina="1" />
  </div>
</template>
