<script setup lang="ts">
useSeoMeta({
  title: 'Conteúdo — Meu Bairro Buritis',
  description: 'Guias e dicas práticas pra quem mora no Buritis e no Estoril: como contratar prestadores de confiança, quanto custa cada serviço e o que perguntar antes de fechar negócio.',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Guias do bairro</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">Conteúdo</h1>
    </div>

    <ConteudoListagem />
  </div>
</template>
