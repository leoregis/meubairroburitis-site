<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

defineProps<{ noticia: Noticia }>()
</script>

<template>
  <p
    v-if="noticia.cta_texto && noticia.cta_href"
    class="m-0 rounded-mbb-lg bg-ground p-4 text-[15px] leading-[23px] text-ink"
  >
    {{ noticia.cta_texto }}
    <!-- /guia/ é o app separado (meubairro-app), fora do router deste site
    -- NuxtLink tentava resolver como rota interna e colapsava pra "/guia/"
    sempre; <a> comum é o mesmo padrão já usado no link do Header. -->
    <a
      :href="noticia.cta_href"
      target="_blank"
      rel="noopener noreferrer"
      class="font-bold text-brand-ink underline-offset-2 hover:underline"
    >
      Guia Buritis
    </a>
  </p>
</template>
