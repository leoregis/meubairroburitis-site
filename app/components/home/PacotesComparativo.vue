<script setup lang="ts">
const { data: produtos } = await useProdutos()
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Pacotes de anúncio</p>
      <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">
        Escolha o formato certo pro seu negócio
      </h2>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <NuxtLink
        v-for="produto in produtos"
        :key="produto.id"
        :to="`/loja/${produto.slug}`"
        class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-md sm:rounded-2xl"
      >
        <NuxtPicture
          v-if="produto.imagem_url"
          :src="produto.imagem_url"
          :alt="produto.nome"
          format="avif,webp"
          :width="480"
          :height="320"
          loading="lazy"
          :img-attrs="{ class: 'h-24 w-full object-cover sm:h-36' }"
        />
        <div class="flex flex-1 flex-col p-3 sm:p-6">
          <h3 class="font-serif text-sm font-bold text-stone-900 sm:text-lg">{{ produto.nome }}</h3>
          <p class="mt-1 hidden flex-1 text-sm text-stone-500 sm:mt-2 sm:block">{{ produto.descricao_curta }}</p>
          <p class="mt-2 text-base font-bold tabular-nums text-orange-800 sm:mt-4 sm:text-2xl">
            {{ formatarPreco(produto.preco_centavos) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
