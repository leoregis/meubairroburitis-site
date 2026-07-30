<script setup lang="ts">
const numeros = [
  { valor: '150 mil+', legenda: 'membros no maior grupo de bairro de BH, no Facebook' },
  { valor: '~55 mil', legenda: 'seguidores no Instagram' },
  { valor: 'desde 2012', legenda: 'site e comunidade no ar, sem interrupção' },
  { valor: '5', legenda: 'redes sociais ativas: Instagram, Facebook, TikTok, Telegram, YouTube' },
]
</script>

<template>
  <section class="border-b border-stone-200 bg-white">
    <div class="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-4">
      <div v-for="n in numeros" :key="n.legenda" class="text-center">
        <p class="font-serif text-3xl font-bold text-orange-800 sm:text-4xl">{{ n.valor }}</p>
        <p class="mt-2 text-sm text-stone-500">{{ n.legenda }}</p>
      </div>
    </div>
  </section>
</template>
