<script setup lang="ts">
// Hero editorial (redesign, fase 2). A foto é o LCP da home: prioridade alta
// + preload, sem lazy, e tamanhos responsivos pelo IPX. No celular o quadro
// é quase quadrado e a foto (3:2) é cortada pelas laterais (object-cover):
// por isso "150vw" -- a imagem precisa ser 1,5x mais larga que a tela para
// cobrir a altura sem esticar. A foto é do Leo; o crédito fica sempre.
//
// srcset montado à mão: o `sizes` do <NuxtImg> não entende "150vw" (gerava
// larguras de 2px) e ampliava a foto até 2400px. O original tem 1200x800,
// então a maior versão é 1200.
const img = useImage()
const LARGURAS = [480, 640, 800, 960, 1200]
const opcoes = (w: number) => ({ width: w, height: Math.round((w * 2) / 3), format: 'webp', quality: 70 })
const srcset = LARGURAS.map((w) => `${img('/hero/capa-buritis.jpg', opcoes(w))} ${w}w`).join(', ')
const src = img('/hero/capa-buritis.jpg', opcoes(800))
const sizes = '(max-width: 639px) 150vw, (max-width: 1247px) 100vw, 1200px'

useHead({
  link: [{ rel: 'preload', as: 'image', imagesrcset: srcset, imagesizes: sizes, fetchpriority: 'high', key: 'hero-preload' }],
})
</script>

<template>
  <section aria-labelledby="hero-titulo" class="relative isolate flex h-[380px] flex-col justify-end overflow-hidden rounded-mbb-xl bg-ink sm:h-[440px] lg:h-[500px]">
    <img
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      alt="Prédios do Buritis ao entardecer, vistos do alto, com a mata em primeiro plano"
      width="1200"
      height="800"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 -z-10 h-full w-full object-cover"
    >
    <span class="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white sm:right-[18px] sm:top-4">
      Foto: Léo Orrico
    </span>

    <div class="m-3 flex max-w-[720px] flex-col gap-2 rounded-[18px] bg-ink/[0.82] p-[18px] text-white sm:m-6 sm:gap-3.5 sm:rounded-mbb-xl sm:px-8 sm:py-7">
      <BaseEyebrow tom="escuro">
        <span class="sm:hidden">Buritis e Estoril · desde 2012</span>
        <span class="hidden sm:inline">A maior comunidade do Buritis e do Estoril · desde 2012</span>
      </BaseEyebrow>
      <h1 id="hero-titulo" class="m-0 text-balance text-2xl font-extrabold leading-[30px] tracking-[-0.025em] sm:text-[44px] sm:leading-[50px]">
        O que acontece no Buritis, contado por quem vive aqui.
      </h1>
      <form action="/busca" method="get" role="search" class="mt-1 flex flex-wrap gap-2">
        <label for="hero-busca" class="sr-only">Buscar notícias, empresas e prestadores</label>
        <input
          id="hero-busca"
          name="q"
          type="search"
          placeholder="Buscar no bairro"
          autocomplete="off"
          class="h-12 min-w-0 flex-[1_1_180px] rounded-mbb-lg border-0 bg-white px-4 text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft sm:h-[52px]"
        >
        <button
          type="submit"
          class="h-12 rounded-mbb-lg bg-brand px-5 text-[15px] font-bold text-white transition-colors hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[52px]"
        >
          Buscar
        </button>
      </form>
    </div>
  </section>
</template>
