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
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <DiretorioCabecalho eyebrow="Comércio local" :titulo="categoria?.nome ?? ''" :voltar="{ to: '/empresas', rotulo: 'Todas as categorias' }" />
    <DiretorioCategorias base="/empresas" :categorias="categorias ?? []" :ativa="categoriaSlug" />
    <EmpresasListagem :pagina="1" :categoria-slug="categoriaSlug" />
  </div>
</template>
