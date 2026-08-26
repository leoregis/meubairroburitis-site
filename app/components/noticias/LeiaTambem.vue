<script setup lang="ts">
const props = defineProps<{ noticiaId: string }>()

const { data: relacionadas } = await useNoticiasRelacionadas(props.noticiaId)
</script>

<template>
  <div v-if="relacionadas?.length" class="mt-10 border-t border-stone-200 pt-8">
    <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-orange-700">Leia também</p>
    <div class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      <NoticiasNoticiaCard v-for="relacionada in relacionadas" :key="relacionada.id" :noticia="relacionada" />
    </div>
  </div>
</template>
