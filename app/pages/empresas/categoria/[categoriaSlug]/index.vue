<script setup lang="ts">
const route = useRoute()
const categoriaSlug = route.params.categoriaSlug as string

const { data: categorias } = await useCategoriasEmpresa()
const categoria = computed(() => categorias.value?.find((c) => c.slug === categoriaSlug))

if (!categoria.value) {
  throw createError({ statusCode: 404, message: 'Categoria não encontrada' })
}

useSeoMeta({
  title: () => `${categoria.value?.nome} — Empresas — Meu Bairro Buritis`,
  description: () => `Empresas de ${categoria.value?.nome} no bairro Buritis e Estoril.`,
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Comércio local</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900">{{ categoria?.nome }}</h1>
    </div>

    <EmpresasFiltroCategorias :categorias="categorias ?? []" :categoria-ativa="categoriaSlug" />
    <EmpresasListagem :pagina="1" :categoria-slug="categoriaSlug" />
  </div>
</template>
