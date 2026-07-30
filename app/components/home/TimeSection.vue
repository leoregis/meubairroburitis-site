<script setup lang="ts">
// Fonte: Home do WordPress atual — versão adotada por decisão do usuário
// (o PDF do Midiakit tem um roster desatualizado e não deve ser usado).
const time = [
  {
    nome: 'Leonardo Orrico',
    descricao: 'Criador e administrador do projeto. Publicitário, empreendedor e especialista em marketing digital.',
    foto: '/time/leonardo-orrico.jpg',
  },
  {
    nome: 'Mirian Maria',
    descricao: 'Personal trainer, empresária e criadora de conteúdo especializada no mercado fitness.',
    foto: '/time/mirian-maria.jpg',
  },
  {
    nome: 'Luanna Gomide',
    descricao: 'Criadora de conteúdo, transforma qualquer vídeo em uma experiência envolvente e divertida.',
    foto: '/time/luanna-gomide.jpg',
  },
  {
    nome: 'Ana Júlia Goulart',
    descricao: 'Jornalista e influencer. Música, moda, beleza e gastronomia. No ar também na rádio BHFM.',
    foto: '/time/ana-julia-goulart.jpeg',
  },
  {
    nome: 'Henrique di Spirito',
    descricao: 'Jornalista e músico. Influenciador com foco em humor, tecnologia e lifestyle.',
    foto: '/time/henrique-di-spirito.jpg',
  },
]
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Nosso time</p>
      <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">Influenciadores locais</h2>
    </div>

    <div class="grid grid-cols-2 gap-6 sm:grid-cols-5">
      <div v-for="pessoa in time" :key="pessoa.nome" class="text-center">
        <NuxtPicture
          :src="pessoa.foto"
          :alt="pessoa.nome"
          format="avif,webp"
          :width="190"
          :height="260"
          loading="lazy"
          :img-attrs="{ class: 'mx-auto h-32 w-24 rounded-lg object-cover' }"
        />
        <p class="mt-3 font-semibold text-stone-900">{{ pessoa.nome }}</p>
        <p class="mt-1 text-xs text-stone-500">{{ pessoa.descricao }}</p>
      </div>
    </div>
  </section>
</template>
