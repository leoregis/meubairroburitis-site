<script setup lang="ts">
const cases = [
  {
    empresa: 'Romeo Pizza Bar',
    citacao:
      'Muito, muito bom! Até me desculpem por não ter agradecido antes. Foi muito legal! Estou patrocinando até hoje e muita gente entra em contato.',
    autor: 'Fabrício, proprietário',
    stats: '174 mil visualizações · 99 mil contas alcançadas · 159 novos seguidores',
    logo: '/anunciantes/romeo1-1.png',
  },
  {
    empresa: 'Shopping Paragem',
    citacao:
      'Vídeo sobre as atrações infantis do shopping teve excelente desempenho já nas primeiras 24 horas, com alto número de compartilhamentos.',
    autor: 'Case — atrações infantis',
    stats: '70 mil visualizações · 48 mil contas alcançadas',
    logo: '/anunciantes/paragem1-2.png',
  },
  {
    empresa: 'Bendito Japa',
    citacao:
      'O vídeo gerou grande interesse entre os seguidores em menos de dois dias no ar, se posicionando como referência local em alta gastronomia japonesa.',
    autor: 'Case — rodízio japonês premium',
    stats: '142 mil visualizações · 54 mil contas alcançadas',
    logo: '/anunciantes/benditojapa1-2.png',
  },
]
</script>

<template>
  <section class="bg-stone-50 py-16">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-10 text-center">
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Resultados reais</p>
        <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">
          Quem já anunciou, comprova
        </h2>
      </div>

      <div class="grid gap-6 sm:grid-cols-3">
        <figure
          v-for="c in cases"
          :key="c.empresa"
          class="flex flex-col rounded-2xl border border-stone-200 bg-white p-6"
        >
          <NuxtPicture
            v-if="c.logo"
            :src="c.logo"
            :alt="c.empresa"
            format="avif,webp"
            :width="220"
            :height="164"
            :img-attrs="{ class: 'mb-4 h-16 w-auto object-contain' }"
          />
          <p v-else class="mb-4 font-serif font-bold text-stone-900">{{ c.empresa }}</p>
          <blockquote class="flex-1 text-sm italic text-stone-600">“{{ c.citacao }}”</blockquote>
          <figcaption class="mt-4 text-xs font-medium text-stone-500">{{ c.autor }}</figcaption>
          <p class="mt-1 text-xs tabular-nums text-orange-700">{{ c.stats }}</p>
        </figure>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/midiakit/cases" class="text-sm font-semibold text-orange-700 hover:underline">
          Ver todos os cases de sucesso →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
