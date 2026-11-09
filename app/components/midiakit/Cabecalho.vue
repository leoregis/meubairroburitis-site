<script setup lang="ts">
// Cabeçalho das páginas do midiakit (redesign, fase 5): chapéu "Midiakit",
// o mesmo h1 de antes e as abas das seções.
defineProps<{ titulo: string; descricao?: string }>()
</script>

<template>
  <header class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <BaseEyebrow>Midiakit</BaseEyebrow>
      <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">{{ titulo }}</h1>
      <p v-if="descricao" class="m-0 max-w-[640px] text-[15px] leading-[23px] text-ink-muted sm:text-[17px] sm:leading-[27px]">{{ descricao }}</p>
    </div>
    <MidiakitTabs />
  </header>
</template>
