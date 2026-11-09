<script setup lang="ts">
// Espaço publicitário (decisão 11): enquanto não há anúncio vendido, a peça
// é da casa e o rótulo é "ESPAÇO PUBLICITÁRIO" -- "PATROCINADO" só quando
// houver a peça de um cliente.
</script>

<template>
  <section aria-label="Espaço publicitário" class="flex flex-col gap-2">
    <BaseEyebrow tom="publicidade">Espaço publicitário</BaseEyebrow>
    <NuxtLink
      to="/loja"
      class="group flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-[18px] border-2 border-dashed border-line bg-ground px-5 py-6 text-center transition-colors hover:border-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:min-h-[160px] sm:rounded-mbb-xl"
    >
      <span class="text-lg font-extrabold tracking-[-0.01em] text-ink sm:text-2xl">Seu anúncio aqui</span>
      <span class="text-sm text-ink-muted">Fale com quem vive o Buritis e o Estoril.
        <span class="font-bold text-brand-ink group-hover:underline">Veja os formatos</span></span>
    </NuxtLink>
  </section>
</template>
