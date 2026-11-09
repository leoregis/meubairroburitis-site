<script setup lang="ts">
// Botão/link da marca. Com `to` vira NuxtLink, com `href` vira <a> (externo
// ou o app em /guia/), sem os dois vira <button>.
//   primario        vermelho, texto branco (4,85:1) -- ação principal
//   escuro          ink, texto branco -- ação secundária forte ("Ver planos")
//   contorno        borda line, texto ink -- ação terciária
//   claro           branco, texto vermelho -- sobre fundo vermelho
//   contorno-claro  borda branca, texto branco -- sobre fundo vermelho/escuro
const props = withDefaults(defineProps<{
  variante?: 'primario' | 'escuro' | 'contorno' | 'claro' | 'contorno-claro'
  to?: string
  href?: string
  novaAba?: boolean
  tipo?: 'button' | 'submit'
  largo?: boolean
}>(), { variante: 'primario', tipo: 'button' })

const VARIANTES = {
  'primario': 'bg-brand text-white hover:bg-brand-deep focus-visible:outline-brand-ink',
  'escuro': 'bg-ink text-white hover:bg-black focus-visible:outline-ink',
  'contorno': 'border border-line bg-white text-ink hover:border-ink-muted hover:bg-ground focus-visible:outline-ink',
  'claro': 'bg-white text-brand-ink hover:bg-brand-tint focus-visible:outline-white',
  'contorno-claro': 'border-[1.5px] border-white text-white hover:bg-white/10 focus-visible:outline-white',
}

const classes = computed(() => [
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-mbb-md px-4 text-sm font-bold transition-colors',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-60',
  props.largo ? 'w-full' : '',
  VARIANTES[props.variante],
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes"><slot /></NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="classes"
    :target="novaAba ? '_blank' : undefined"
    :rel="novaAba ? 'noopener noreferrer' : undefined"
  >
    <slot />
    <span v-if="novaAba" class="sr-only">(abre em nova aba)</span>
  </a>
  <button v-else :type="tipo" :class="classes"><slot /></button>
</template>
