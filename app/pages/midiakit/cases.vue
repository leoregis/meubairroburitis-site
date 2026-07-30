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
  <div class="mx-auto max-w-2xl px-4 py-16">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Midiakit</p>
    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">Cases de sucesso</h1>

    <div class="mt-8">
      <MidiakitTabs />
    </div>

    <div class="space-y-10">
      <article v-for="c in cases" :key="c.empresa" class="border-l-4 border-orange-600 pl-6">
        <h2 class="font-serif text-xl font-bold text-stone-900">{{ c.empresa }}</h2>
        <p class="mt-2 text-stone-600">{{ c.resumo }}</p>
        <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums text-orange-700">
          <li v-for="stat in c.stats" :key="stat">{{ stat }}</li>
        </ul>
        <blockquote v-if="c.citacao" class="mt-3 border-l-2 border-stone-300 pl-4 text-sm italic text-stone-500">
          “{{ c.citacao }}” — {{ c.autor }}
        </blockquote>
      </article>
    </div>
  </div>
</template>
