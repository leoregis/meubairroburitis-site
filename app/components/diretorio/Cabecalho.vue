<script setup lang="ts">
// Cabeçalho das listagens de empresas e prestadores (redesign, fase 4).
// O h1 é o mesmo de antes ("Empresas", "Prestadores" ou o nome da categoria).
defineProps<{ eyebrow: string; titulo: string; descricao?: string; voltar?: { to: string; rotulo: string } }>()
</script>

<template>
  <header class="flex flex-col gap-2">
    <NuxtLink
      v-if="voltar"
      :to="voltar.to"
      class="inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-bold text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
    >
      <Icon name="lucide:arrow-left" class="h-4 w-4" aria-hidden="true" />
      {{ voltar.rotulo }}
    </NuxtLink>
    <BaseEyebrow>{{ eyebrow }}</BaseEyebrow>
    <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">{{ titulo }}</h1>
    <p v-if="descricao" class="m-0 max-w-[640px] text-[15px] leading-[23px] text-ink-muted sm:text-[17px] sm:leading-[27px]">{{ descricao }}</p>
  </header>
</template>
