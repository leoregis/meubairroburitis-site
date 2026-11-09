<script setup lang="ts">
// Paginação das listagens do diretório (mesmos links de antes:
// <base> e <base>/pagina/N).
const props = defineProps<{ base: string; pagina: number; totalPaginas: number; rotulo: string }>()

function link(numero: number) {
  return numero <= 1 ? props.base : `${props.base}/pagina/${numero}`
}
</script>

<template>
  <nav v-if="totalPaginas > 1" :aria-label="rotulo" class="flex flex-wrap items-center justify-center gap-3 pt-6">
    <BaseBotao v-if="pagina > 1" :to="link(pagina - 1)" variante="contorno">
      <Icon name="lucide:arrow-left" class="h-4 w-4" aria-hidden="true" />
      Anterior
    </BaseBotao>
    <span class="px-2 text-sm text-ink-muted">Página {{ pagina }} de {{ totalPaginas }}</span>
    <BaseBotao v-if="pagina < totalPaginas" :to="link(pagina + 1)" variante="contorno">
      Próxima
      <Icon name="lucide:arrow-right" class="h-4 w-4" aria-hidden="true" />
    </BaseBotao>
  </nav>
</template>
