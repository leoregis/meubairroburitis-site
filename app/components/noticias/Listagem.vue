<script setup lang="ts">
const props = defineProps<{ pagina: number }>()

const { data } = await useNoticiasPagina(props.pagina)

const itens = computed(() => data.value?.itens ?? [])
const totalPaginas = computed(() => data.value?.totalPaginas ?? 1)

function linkPagina(numero: number) {
  return numero <= 1 ? '/noticias' : `/noticias/pagina/${numero}`
}
</script>

<template>
  <div>
    <p v-if="itens.length === 0" class="text-center text-stone-500">Nenhuma notícia publicada ainda.</p>

    <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="noticia in itens" :key="noticia.id" :noticia="noticia" />
    </div>

    <nav v-if="totalPaginas > 1" class="mt-10 flex items-center justify-center gap-2">
      <NuxtLink
        v-if="pagina > 1"
        :to="linkPagina(pagina - 1)"
        class="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
      >
        ← Anterior
      </NuxtLink>

      <span class="px-3 text-sm text-stone-500">Página {{ pagina }} de {{ totalPaginas }}</span>

      <NuxtLink
        v-if="pagina < totalPaginas"
        :to="linkPagina(pagina + 1)"
        class="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
      >
        Próxima →
      </NuxtLink>
    </nav>
  </div>
</template>
