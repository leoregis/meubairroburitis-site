<script setup lang="ts">
// Nota de avaliação: estrela + "5,0" + "(18)". O leitor de tela ouve a frase
// inteira ("Nota 5,0 de 5, 18 avaliações"); o visual fica aria-hidden.
const props = defineProps<{
  nota: number
  total?: number
}>()

const notaTexto = computed(() => props.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
const descricao = computed(() => {
  const avaliacoes = props.total ? `, ${props.total} ${props.total === 1 ? 'avaliação' : 'avaliações'}` : ''
  return `Nota ${notaTexto.value} de 5${avaliacoes}`
})
</script>

<template>
  <span class="inline-flex items-center gap-1 text-sm text-ink">
    <span class="sr-only">{{ descricao }}</span>
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" class="flex-none">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" class="fill-star" />
    </svg>
    <strong aria-hidden="true">{{ notaTexto }}</strong>
    <span v-if="total" class="text-ink-muted" aria-hidden="true">({{ total }})</span>
  </span>
</template>
