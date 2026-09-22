<script setup lang="ts">
const props = defineProps<{ latitude: number; longitude: number; nome: string }>()

// embed do Google Maps sem API key (formato público /maps?...&output=embed)
const srcEmbed = computed(() => `https://www.google.com/maps?q=${props.latitude},${props.longitude}&z=16&output=embed`)
const linkAbrir = computed(() => `https://www.google.com/maps/search/?api=1&query=${props.latitude},${props.longitude}`)
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-stone-200">
    <iframe
      :src="srcEmbed"
      :title="`Mapa de ${nome}`"
      class="h-64 w-full sm:h-80"
      style="border: 0"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
    />
    <a
      :href="linkAbrir"
      target="_blank"
      rel="noopener noreferrer"
      class="block bg-stone-50 px-4 py-2.5 text-center text-sm font-semibold text-orange-700 hover:bg-stone-100 hover:underline"
    >
      Abrir no Google Maps →
    </a>
  </div>
</template>
