<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

const props = defineProps<{ noticia: Noticia }>()

// curadoria manual; sem ela, as mais recentes da mesma editoria
// (useNoticiasRelacionadas)
const { data: relacionadas } = await useNoticiasRelacionadas(
  props.noticia.id,
  props.noticia.categoria_id,
  props.noticia.subcategoria_guia_id,
)
</script>

<template>
  <section v-if="relacionadas?.length" aria-labelledby="leia-tambem-titulo" class="flex flex-col gap-2">
    <BaseSectionHeader id="leia-tambem-titulo" titulo="Leia também" />
    <!-- sem a linha de cima no 1º card (o cabeçalho da seção já tem a dele) -->
    <div class="grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 [&>article:first-child]:border-t-0 sm:[&>article]:border-t-0">
      <NoticiasNoticiaCard v-for="relacionada in relacionadas" :key="relacionada.id" :noticia="relacionada" />
    </div>
  </section>
</template>
