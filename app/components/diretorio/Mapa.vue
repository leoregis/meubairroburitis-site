<script setup lang="ts">
// Endereço + mapa sob demanda (redesign, fase 4): o iframe do Google Maps só
// é criado quando a pessoa pede -- antes ele carregava em toda visita
// (~1 MB de scripts do Google). O espaço do mapa é reservado no clique.
const props = defineProps<{ endereco?: string | null; latitude?: number | null; longitude?: number | null; nome: string }>()

const temCoordenadas = computed(() => Boolean(props.latitude && props.longitude))
const mostrar = ref(false)
const linkRota = computed(() => (temCoordenadas.value
  ? `https://www.google.com/maps/dir/?api=1&destination=${props.latitude},${props.longitude}`
  : props.endereco ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(props.endereco)}` : null))
</script>

<template>
  <section v-if="endereco || temCoordenadas" aria-labelledby="local-titulo" class="flex flex-col gap-3">
    <h2 id="local-titulo" class="m-0 border-b border-line pb-3 text-xl font-extrabold tracking-[-0.015em] text-ink">Endereço</h2>
    <p v-if="endereco" class="m-0 flex items-start gap-2 text-[15px] leading-[23px] text-ink">
      <Icon name="lucide:map-pin" class="mt-0.5 h-[18px] w-[18px] flex-none text-brand-ink" aria-hidden="true" />
      {{ endereco }}
    </p>
    <div class="flex flex-wrap gap-2">
      <BaseBotao v-if="temCoordenadas && !mostrar" variante="contorno" @click="mostrar = true">
        <Icon name="lucide:map" class="h-[18px] w-[18px]" aria-hidden="true" />
        Ver no mapa
      </BaseBotao>
      <BaseBotao v-if="linkRota" :href="linkRota" variante="contorno" nova-aba>
        <Icon name="lucide:navigation" class="h-[18px] w-[18px]" aria-hidden="true" />
        Como chegar
      </BaseBotao>
    </div>
    <UiMapaEmbed v-if="mostrar && temCoordenadas" :latitude="latitude!" :longitude="longitude!" :nome="nome" />
  </section>
</template>
