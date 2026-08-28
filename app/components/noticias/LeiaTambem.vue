<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

const props = defineProps<{ noticia: Noticia }>()

const { data: relacionadas } = await useNoticiasRelacionadas(
  props.noticia.id,
  props.noticia.categoria_id,
  props.noticia.subcategoria_guia_id,
)
</script>

<template>
  <div v-if="relacionadas?.length" class="mt-10 border-t border-stone-200 pt-8">
    <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-orange-700">Leia também</p>
    <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="relacionada in relacionadas" :key="relacionada.id" :noticia="relacionada" />
    </div>
  </div>
</template>
