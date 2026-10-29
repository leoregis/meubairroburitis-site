<script setup lang="ts">
// Cabeçalho de seção editorial: título forte, link "Ver tudo" à direita e
// uma linha fina embaixo. `id` serve ao aria-labelledby da <section>.
defineProps<{
  titulo: string
  id?: string
  linkTo?: string
  linkLabel?: string
  subtitulo?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-3">
    <div class="flex flex-col gap-1">
      <h2 :id="id" class="m-0 text-[22px] font-extrabold leading-7 tracking-[-0.02em] text-ink sm:text-[30px] sm:leading-9">
        {{ titulo }}
      </h2>
      <p v-if="subtitulo" class="m-0 text-sm text-ink-muted">{{ subtitulo }}</p>
    </div>
    <NuxtLink
      v-if="linkTo"
      :to="linkTo"
      class="inline-flex min-h-[44px] items-center text-sm font-bold text-brand-ink hover:text-brand-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
    >
      {{ linkLabel || 'Ver tudo' }}
    </NuxtLink>
  </div>
</template>
