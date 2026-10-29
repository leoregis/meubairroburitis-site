<script setup lang="ts">
// Bloco escuro (decisão 10): no lugar da newsletter, que é o próximo projeto
// depois do redesign, leva aos canais que já existem.
</script>

<template>
  <section aria-labelledby="canais-titulo" class="flex flex-wrap items-center justify-between gap-6 rounded-mbb-xl bg-ink px-5 py-6 text-white sm:gap-8 sm:p-10">
    <div class="flex flex-[1_1_420px] flex-col gap-2">
      <BaseEyebrow tom="escuro">Canais gratuitos</BaseEyebrow>
      <h2 id="canais-titulo" class="m-0 text-balance text-xl font-extrabold leading-[26px] tracking-[-0.02em] sm:text-[28px] sm:leading-[34px]">
        Receba as notícias do bairro no WhatsApp e no Instagram.
      </h2>
      <p class="m-0 text-[15px] leading-[22px] text-white/90">
        Alertas, o que abriu ou fechou por aqui e a agenda do fim de semana, de graça, onde você já está.
      </p>
    </div>
    <BaseBotao to="/canais" class="w-full sm:w-auto">
      Ver os canais
      <Icon name="lucide:arrow-right" class="h-[18px] w-[18px]" aria-hidden="true" />
    </BaseBotao>
  </section>
</template>
