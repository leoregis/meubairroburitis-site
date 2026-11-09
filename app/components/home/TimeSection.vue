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
  <section aria-labelledby="time-titulo" class="mx-auto max-w-[1248px] px-4 py-14 sm:px-6 sm:py-16">
    <div class="flex flex-col gap-2 border-b border-line pb-3">
      <BaseEyebrow>Nosso time</BaseEyebrow>
      <h2 id="time-titulo" class="m-0 text-balance text-[26px] font-extrabold leading-8 tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[40px]">Influenciadores locais</h2>
    </div>

    <ul class="m-0 mt-8 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-5">
      <li v-for="pessoa in time" :key="pessoa.nome" class="flex min-w-0 flex-col gap-2">
        <NuxtPicture
          :src="pessoa.foto"
          :alt="pessoa.nome"
          format="avif,webp"
          :width="190"
          :height="260"
          loading="lazy"
          :img-attrs="{ class: 'aspect-[3/4] w-full rounded-mbb-lg border border-line object-cover' }"
        />
        <p class="m-0 mt-1 text-base font-extrabold leading-5 text-ink">{{ pessoa.nome }}</p>
        <p class="m-0 text-[13px] leading-5 text-ink-muted">{{ pessoa.descricao }}</p>
      </li>
    </ul>
  </section>
</template>
