<script setup lang="ts">
useSeoMeta({
  title: 'Midiakit — Anuncie no Meu Bairro Buritis',
  description: 'Conecte sua marca ao coração do Buritis. Veja alcance, formatos e resultados reais de quem já anunciou.',
})

const anunciantes = [
  { nome: 'UNA', logo: '/anunciantes/una1-2.png' },
  { nome: 'SuperNosso', logo: '/anunciantes/supernosso1-2.png' },
  { nome: 'Vila Chalezinho', logo: '/anunciantes/vilachalezinho1-2.png' },
  { nome: 'Sátira', logo: '/anunciantes/satira1-2.png' },
  { nome: 'Shopping Paragem', logo: '/anunciantes/paragem1-2.png' },
  { nome: 'Novolar', logo: '/anunciantes/novolar1-2.png' },
  { nome: 'Inimaginável', logo: '/anunciantes/inimaginavel1-2.png' },
  { nome: 'Cobasi', logo: '/anunciantes/cobasi1-2.png' },
  { nome: 'Cidade Junina', logo: '/anunciantes/cidadejunina1-2.png' },
  { nome: 'Romeo Pizza Bar', logo: '/anunciantes/romeo1-1.png' },
  { nome: 'Bendito Japa', logo: '/anunciantes/benditojapa1-2.png' },
]

const links = [
  { to: '/midiakit/dados', label: 'Dados de alcance' },
  { to: '/midiakit/formatos', label: 'Formatos de anúncio' },
  { to: '/midiakit/duvidas', label: 'Dúvidas frequentes' },
  { to: '/midiakit/cases', label: 'Cases de sucesso' },
]
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-16">
    <p class="text-center text-sm font-semibold uppercase tracking-wide text-orange-700">Midiakit</p>
    <h1 class="mt-2 text-balance text-center font-serif text-3xl font-bold text-stone-900">
      Anuncie no Meu Bairro Buritis
    </h1>
    <p class="mx-auto mt-4 max-w-xl text-center text-stone-600">
      Conecte sua marca ao coração do Buritis. Estamos em todos os lugares onde seu público está:
      Instagram, WhatsApp, Facebook, TikTok, Telegram, site e até nos eventos do bairro.
    </p>

    <div class="mt-10">
      <MidiakitTabs />
    </div>

    <nav class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-xl border border-stone-200 bg-white px-5 py-4 text-center font-semibold text-stone-800 hover:border-orange-300 hover:text-orange-700"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <div class="mt-16">
      <p class="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-stone-500">
        Alguns de nossos anunciantes
      </p>
      <div class="grid grid-cols-2 items-center gap-8 sm:grid-cols-3 md:grid-cols-4">
        <NuxtPicture
          v-for="a in anunciantes"
          :key="a.nome"
          :src="a.logo"
          :alt="a.nome"
          format="avif,webp"
          :width="280"
          :height="210"
          sizes="280px"
          loading="lazy"
          :img-attrs="{ class: 'h-24 w-full object-contain grayscale transition hover:grayscale-0' }"
        />
      </div>
    </div>
  </div>
</template>
