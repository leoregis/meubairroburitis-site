<script setup lang="ts">
// Chip de categoria (link). `ativo` marca a categoria aberta.
defineProps<{
  to: string
  ativo?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="inline-flex min-h-[40px] flex-none items-center rounded-full border px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    :class="ativo ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink-muted'"
    :aria-current="ativo ? 'page' : undefined"
  >
    <slot />
  </NuxtLink>
</template>
