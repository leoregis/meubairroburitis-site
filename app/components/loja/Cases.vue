<script setup lang="ts">
// Cases e depoimentos (vieram da home): os mesmos textos e números.
import { CASES_ANUNCIE } from '~/constants/anuncie'
</script>

<template>
  <section aria-labelledby="cases-titulo" class="flex flex-col gap-5">
    <BaseSectionHeader
      id="cases-titulo"
      titulo="Quem já anunciou, comprova"
      link-to="/midiakit/cases"
      link-label="Ver todos os cases"
      link-label-celular="Ver todos"
    />
    <div class="grid gap-4 md:grid-cols-3">
      <figure v-for="c in CASES_ANUNCIE" :key="c.empresa" class="m-0 flex flex-col gap-4 rounded-mbb-xl border border-line bg-white p-5 sm:p-6">
        <div class="flex items-center gap-3">
          <NuxtImg
            :src="c.logo"
            alt=""
            format="webp"
            width="96"
            height="72"
            loading="lazy"
            class="h-12 w-16 flex-none object-contain"
          />
          <p class="m-0 text-base font-extrabold text-ink">{{ c.empresa }}</p>
        </div>
        <dl class="m-0 flex flex-wrap gap-x-5 gap-y-2 border-y border-line py-3">
          <div v-for="n in c.numeros" :key="n.rotulo" class="flex flex-col-reverse">
            <dt class="text-xs text-ink-muted">{{ n.rotulo }}</dt>
            <dd class="m-0 text-xl font-extrabold tracking-[-0.02em] tabular-nums text-ink">{{ n.valor }}</dd>
          </div>
        </dl>
        <blockquote class="m-0 flex-1 text-sm leading-[21px] text-ink">“{{ c.citacao }}”</blockquote>
        <figcaption class="text-xs font-semibold text-ink-muted">{{ c.autor }}</figcaption>
      </figure>
    </div>
  </section>
</template>
