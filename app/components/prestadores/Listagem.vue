<script setup lang="ts">
const props = defineProps<{ pagina: number; categoriaSlug?: string }>()

const { data } = await usePrestadoresPagina(props.pagina, props.categoriaSlug)

const itens = computed(() => data.value?.itens ?? [])
const totalPaginas = computed(() => data.value?.totalPaginas ?? 1)

function linkPagina(numero: number) {
  const base = props.categoriaSlug ? `/prestadores/categoria/${props.categoriaSlug}` : '/prestadores'
  return numero <= 1 ? base : `${base}/pagina/${numero}`
}
</script>

<template>
  <div>
    <h2 class="sr-only">Lista de prestadores</h2>
    <p v-if="itens.length === 0" class="text-center text-stone-500">Nenhum prestador encontrado nesta categoria.</p>

    <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      <PrestadoresCard v-for="prestador in itens" :key="prestador.id" :prestador="prestador" />
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
