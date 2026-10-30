<script setup lang="ts">
useSeoMeta({
  title: 'Cases de sucesso — Midiakit Meu Bairro Buritis',
  description: 'Romeo Pizza Bar, Shopping Paragem e Bendito Japa: resultados reais de quem já anunciou no Meu Bairro Buritis.',
})

const cases = [
  {
    empresa: 'Romeo Pizza Bar',
    resumo: 'Em março de 2024, realizamos uma produção exclusiva para apresentar o Romeo Pizza Bar, novo restaurante inaugurado no Buritis.',
    stats: ['174 mil visualizações', '99 mil contas alcançadas', '3.649 curtidas', '2.509 compartilhamentos', '159 novos seguidores'],
    citacao: 'Muito, muito bom! Até me desculpem por não ter agradecido antes. Foi muito legal! Estou patrocinando até hoje e muita gente entra em contato.',
    autor: 'Fabrício, proprietário do Romeo Pizza Bar',
  },
  {
    empresa: 'Shopping Paragem — atrações infantis',
    resumo: 'Produzimos um vídeo especial destacando as atrações infantis oferecidas pelo Shopping Paragem, mostrando que o espaço é ideal para momentos em família.',
    stats: ['70 mil visualizações', '48 mil contas alcançadas', '750 interações totais'],
    citacao: null,
    autor: null,
  },
  {
    empresa: 'Bendito Japa — rodízio japonês premium',
    resumo: 'Produzimos um vídeo especial para transmitir a experiência sofisticada do rodízio japonês premium do Bendito Japa.',
    stats: ['142 mil visualizações', '54 mil contas alcançadas', '1.036 interações totais', '17 novos seguidores'],
    citacao: null,
    autor: null,
  },
]
</script>

<template>
  <div class="mx-auto flex max-w-[960px] flex-col gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-[72px] sm:pt-10">
    <MidiakitCabecalho titulo="Cases de sucesso" />

    <div class="flex flex-col gap-4">
      <article v-for="c in cases" :key="c.empresa" class="flex flex-col gap-3 rounded-mbb-xl border border-line bg-white p-5 sm:p-7">
        <h2 class="m-0 text-xl font-extrabold leading-7 tracking-[-0.015em] text-ink sm:text-2xl">{{ c.empresa }}</h2>
        <p class="m-0 text-base leading-[26px] text-ink-muted sm:text-[17px] sm:leading-[28px]">{{ c.resumo }}</p>
        <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
          <li v-for="stat in c.stats" :key="stat" class="rounded-full bg-chip px-3 py-1.5 text-[13px] font-bold tabular-nums text-ink">{{ stat }}</li>
        </ul>
        <blockquote v-if="c.citacao" class="m-0 border-l-[3px] border-brand pl-4 text-[15px] leading-[24px] text-ink">
          “{{ c.citacao }}” <span class="text-ink-muted">— {{ c.autor }}</span>
        </blockquote>
      </article>
    </div>
  </div>
</template>
