<script setup lang="ts">
useSeoMeta({
  title: 'Guias do Buritis — Meu Bairro Buritis',
  description: 'Guias práticos sobre o Buritis e o Estoril: alimentação, comércio, serviços, saúde, educação e mais.',
})

const { data: subcategorias } = await useSubcategoriasGuia()
const { data: guias } = await useGuias()

const subcategoriaAtiva = ref<string | null>(null)

const guiasFiltrados = computed(() => {
  if (!subcategoriaAtiva.value) return guias.value ?? []
  return (guias.value ?? []).filter((g) => g.subcategoria_guia_id === subcategoriaAtiva.value)
})

// só mostra chip de subcategoria que realmente tem guia publicado nela
const subcategoriasComConteudo = computed(() => {
  const idsUsados = new Set((guias.value ?? []).map((g) => g.subcategoria_guia_id))
  return (subcategorias.value ?? []).filter((s) => idsUsados.has(s.id))
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Guias do bairro</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">
        Guias práticos do Buritis e Estoril
      </h1>
      <p class="mx-auto mt-3 max-w-2xl text-stone-500">
        Recomendações e informações práticas sobre o dia a dia no bairro — de onde comer a quem chamar
        pra resolver um problema em casa.
      </p>
    </div>

    <NoticiasAbasSecao ativa="guias" />

    <div v-if="subcategoriasComConteudo.length" class="mb-8 flex flex-wrap justify-center gap-2">
      <button
        class="rounded-full border px-4 py-1.5 text-sm font-semibold"
        :class="subcategoriaAtiva === null ? 'border-orange-600 bg-orange-50 text-orange-800' : 'border-stone-300 text-stone-600 hover:bg-stone-50'"
        @click="subcategoriaAtiva = null"
      >
        Todos
      </button>
      <button
        v-for="sub in subcategoriasComConteudo"
        :key="sub.id"
        class="rounded-full border px-4 py-1.5 text-sm font-semibold"
        :class="subcategoriaAtiva === sub.id ? 'border-orange-600 bg-orange-50 text-orange-800' : 'border-stone-300 text-stone-600 hover:bg-stone-50'"
        @click="subcategoriaAtiva = sub.id"
      >
        {{ sub.rotulo }}
      </button>
    </div>

    <p v-if="!guiasFiltrados.length" class="text-center text-stone-500">
      Nenhum guia publicado nessa categoria ainda.
    </p>
    <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="guia in guiasFiltrados" :key="guia.id" :noticia="guia" />
    </div>
  </div>
</template>
