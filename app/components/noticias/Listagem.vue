<script setup lang="ts">
// Listagem paginada de /noticias em grade de revista (redesign, fase 3).
// Página 1: a matéria mais recente em destaque + a grade. Demais páginas:
// só a grade. Modo resumo: o payload não leva o texto das matérias.
const props = defineProps<{ pagina: number }>()

const { data } = await useNoticiasPagina(props.pagina, { resumo: true })

const itens = computed(() => data.value?.itens ?? [])
const totalPaginas = computed(() => data.value?.totalPaginas ?? 1)
const destaque = computed(() => (props.pagina === 1 ? itens.value[0] : undefined))
const grade = computed(() => (destaque.value ? itens.value.slice(1) : itens.value))

function linkPagina(numero: number) {
  return numero <= 1 ? '/noticias' : `/noticias/pagina/${numero}`
}
</script>

<template>
  <div class="flex flex-col gap-6 sm:gap-8">
    <p v-if="itens.length === 0" class="text-ink-muted">Nenhuma notícia publicada ainda.</p>

    <NoticiasDestaque v-if="destaque" :noticia="destaque" />

    <div v-if="grade.length" class="grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="(noticia, i) in grade" :key="noticia.id" :noticia="noticia" nivel="h2" :prioridade="!destaque && i === 0" />
    </div>

    <nav v-if="totalPaginas > 1" aria-label="Páginas de notícias" class="flex flex-wrap items-center justify-center gap-3 border-t border-line pt-6">
      <BaseBotao v-if="pagina > 1" :to="linkPagina(pagina - 1)" variante="contorno">
        <Icon name="lucide:arrow-left" class="h-4 w-4" aria-hidden="true" />
        Anterior
      </BaseBotao>
      <span class="px-2 text-sm text-ink-muted">Página {{ pagina }} de {{ totalPaginas }}</span>
      <BaseBotao v-if="pagina < totalPaginas" :to="linkPagina(pagina + 1)" variante="contorno">
        Próxima
        <Icon name="lucide:arrow-right" class="h-4 w-4" aria-hidden="true" />
      </BaseBotao>
    </nav>
  </div>
</template>
