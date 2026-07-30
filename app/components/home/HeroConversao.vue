<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <section class="relative overflow-hidden bg-stone-900 text-white">
    <NuxtPicture
      src="/hero/capa-buritis.jpg"
      alt="Bairro Buritis, Belo Horizonte"
      format="avif,webp"
      :width="1600"
      :height="1067"
      fetchpriority="high"
      loading="eager"
      :img-attrs="{ class: 'absolute inset-0 h-full w-full object-cover opacity-40' }"
      class="absolute inset-0 h-full w-full"
    />
    <div class="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
      <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-300">
        A maior comunidade online do Buritis / Estoril · desde 2012
      </p>
      <h1 class="text-balance text-3xl font-bold leading-tight sm:text-5xl">
        Quer aparecer por aqui? Anuncie com a gente!
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-lg text-stone-200">
        Conecte sua marca ao coração do Buritis — presença real, com quem realmente vive o bairro.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <NuxtLink
          to="/loja"
          class="rounded-full bg-orange-500 px-6 py-3 font-semibold text-orange-950 hover:bg-orange-400"
        >
          Ver pacotes de anúncio
        </NuxtLink>
        <a
          :href="`https://wa.me/${config.public.whatsappNumero}`"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  </section>
</template>
