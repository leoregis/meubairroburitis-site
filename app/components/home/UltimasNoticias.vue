<script setup lang="ts">
// reaproveita o mesmo composable da listagem pública (/noticias) -- busca
// em build-time igual o resto da home, sem depender de fetch client-side.
// Página 1 já vem ordenada por data_publicacao desc; só pega as 3
// primeiras em vez de criar outro composable pra "top N".
const { data } = await useNoticiasPagina(1)

const ultimasTres = computed(() => (data.value?.itens ?? []).slice(0, 3))
</script>

<template>
  <section v-if="ultimasTres.length > 0" class="bg-white py-16">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-10 text-center">
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Fique por dentro</p>
        <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">
          Últimas notícias
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        <NoticiasNoticiaCard v-for="noticia in ultimasTres" :key="noticia.id" :noticia="noticia" />
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/noticias" class="text-sm font-semibold text-orange-700 hover:underline">
          Ver todas as notícias →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
