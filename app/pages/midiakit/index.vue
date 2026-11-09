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
  <div class="mx-auto flex max-w-[960px] flex-col gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-[72px] sm:pt-10">
    <MidiakitCabecalho
      titulo="Anuncie no Meu Bairro Buritis"
      descricao="Conecte sua marca ao coração do Buritis. Estamos em todos os lugares onde seu público está: Instagram, WhatsApp, Facebook, TikTok, Telegram, site e até nos eventos do bairro."
    />

    <nav aria-label="Conteúdo do midiakit" class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex min-h-[64px] items-center justify-between gap-3 rounded-mbb-lg border border-line bg-white px-5 py-4 text-base font-bold text-ink transition-colors hover:border-ink-muted hover:bg-ground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {{ link.label }}
        <Icon name="lucide:arrow-right" class="h-5 w-5 flex-none text-brand-ink" aria-hidden="true" />
      </NuxtLink>
    </nav>

    <section aria-labelledby="anunciantes-titulo" class="flex flex-col gap-5">
      <BaseSectionHeader id="anunciantes-titulo" titulo="Alguns de nossos anunciantes" />
      <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
        <li v-for="a in anunciantes" :key="a.nome" class="flex items-center justify-center rounded-mbb-lg border border-line bg-white p-4">
          <NuxtPicture
            :src="a.logo"
            :alt="a.nome"
            format="avif,webp"
            :width="280"
            :height="210"
            sizes="280px"
            loading="lazy"
            :img-attrs="{ class: 'h-20 w-full object-contain' }"
          />
        </li>
      </ul>
    </section>
  </div>
</template>
