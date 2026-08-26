<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

defineProps<{ noticia: Noticia }>()
</script>

<template>
  <p
    v-if="noticia.cta_texto && noticia.cta_href"
    class="mt-8 rounded-lg bg-stone-50 p-4 text-sm text-stone-600"
  >
    {{ noticia.cta_texto }}
    <!-- /guia/ é o app separado (meubairro-app), fora do router deste site
    -- NuxtLink tentava resolver como rota interna e colapsava pra "/guia/"
    sempre; <a> comum é o mesmo padrão já usado no link do Header. -->
    <a
      :href="noticia.cta_href"
      target="_blank"
      rel="noopener noreferrer"
      class="font-semibold text-orange-700 hover:underline"
    >
      Guia Buritis
    </a>
  </p>
</template>
