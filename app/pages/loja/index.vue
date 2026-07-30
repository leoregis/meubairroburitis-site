<script setup lang="ts">
useSeoMeta({
  title: 'Anuncie no Meu Bairro Buritis — Pacotes de anúncio',
  description: 'Escolha entre 5 pacotes de anúncio no Meu Bairro Buritis, do Story avulso ao pacote mensal Premium.',
})

const { data: produtos } = await useProdutos()
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Vitrine</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">
        Pacotes de anúncio
      </h1>
      <p class="mx-auto mt-3 max-w-lg text-stone-600">
        Sem processamento de cartão por aqui — monte seu pedido e finalize a contratação direto no
        WhatsApp.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <LojaProdutoCard v-for="produto in produtos" :key="produto.id" :produto="produto" />
    </div>
  </div>
</template>
