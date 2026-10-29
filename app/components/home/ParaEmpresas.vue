<script setup lang="ts">
// Bloco "Para empresas" -- o funil do anunciante, agora no fim da home
// (decisão 12): números e preço de entrada, levando à /loja. O "Anuncie"
// fixo no cabeçalho continua sendo o atalho do topo.
const NUMEROS = [
  { valor: '150 mil+', rotulo: 'no grupo do Facebook' },
  { valor: '55 mil+', rotulo: 'seguidores no Instagram' },
  { valor: 'desde 2012', rotulo: 'no Buritis e no Estoril' },
]
</script>

<template>
  <section aria-labelledby="empresas-titulo" class="flex flex-wrap items-center justify-between gap-6 rounded-mbb-xl border border-line px-5 py-6 sm:px-9 sm:py-8">
    <div class="flex flex-[1_1_520px] flex-col gap-2">
      <BaseEyebrow>Para empresas</BaseEyebrow>
      <h2 id="empresas-titulo" class="m-0 text-balance text-[19px] font-extrabold leading-[25px] tracking-[-0.015em] sm:text-[26px] sm:leading-8">
        Apareça para quem vive o Buritis e o Estoril
      </h2>
      <dl class="m-0 mt-2 grid grid-cols-3 gap-3 sm:max-w-lg">
        <div v-for="n in NUMEROS" :key="n.valor" class="flex flex-col-reverse gap-0.5">
          <dt class="text-xs leading-4 text-ink-muted sm:text-[13px]">{{ n.rotulo }}</dt>
          <dd class="m-0 text-lg font-extrabold tracking-[-0.02em] text-ink sm:text-2xl">{{ n.valor }}</dd>
        </div>
      </dl>
      <p class="m-0 mt-2 text-sm leading-[21px] text-ink-muted sm:text-[15px] sm:leading-[22px]">
        Planos mensais <strong class="font-bold text-ink">a partir de R$ 249/mês</strong> e anúncios avulsos, como Stories e Colab no Instagram.
      </p>
    </div>
    <div class="flex w-full flex-wrap gap-2 sm:w-auto">
      <BaseBotao to="/loja" variante="escuro" class="flex-1 sm:flex-none">Ver planos e preços</BaseBotao>
      <BaseBotao to="/midiakit" variante="contorno" class="flex-1 sm:flex-none">Midiakit</BaseBotao>
    </div>
  </section>
</template>
