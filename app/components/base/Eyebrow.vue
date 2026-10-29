<script setup lang="ts">
// Rótulo pequeno em caixa alta acima de títulos ("SEGURANÇA · 26 OUT",
// "PARA EMPRESAS"). Tons conferidos para 4,5:1:
//   marca      brand-ink sobre branco/ground
//   escuro     brand-soft, só sobre fundo ink
//   publicidade sponsor sobre branco/ground ("ESPAÇO PUBLICITÁRIO")
withDefaults(defineProps<{
  tom?: 'marca' | 'escuro' | 'publicidade'
  tag?: string
}>(), { tom: 'marca', tag: 'p' })

const TONS = {
  marca: 'text-brand-ink',
  escuro: 'text-brand-soft',
  publicidade: 'text-sponsor',
}
</script>

<template>
  <component :is="tag" class="m-0 text-[11px] font-bold uppercase leading-[14px] tracking-[0.1em]" :class="TONS[tom]">
    <slot />
  </component>
</template>
