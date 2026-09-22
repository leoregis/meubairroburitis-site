<script setup lang="ts">
const props = defineProps<{ imagens: string[]; alt: string }>()

const aberto = ref(false)
const indiceAtual = ref(0)

function abrir(indice: number) {
  indiceAtual.value = indice
  aberto.value = true
}

function fechar() {
  aberto.value = false
}

function anterior() {
  indiceAtual.value = (indiceAtual.value - 1 + props.imagens.length) % props.imagens.length
}

function proxima() {
  indiceAtual.value = (indiceAtual.value + 1) % props.imagens.length
}

function aoTeclar(e: KeyboardEvent) {
  if (!aberto.value) return
  if (e.key === 'Escape') fechar()
  if (e.key === 'ArrowLeft') anterior()
  if (e.key === 'ArrowRight') proxima()
}

onMounted(() => window.addEventListener('keydown', aoTeclar))
onUnmounted(() => window.removeEventListener('keydown', aoTeclar))
</script>

<template>
  <div>
    <div class="galeria-scroll flex gap-3 overflow-x-auto pb-1">
      <button
        v-for="(url, i) in imagens"
        :key="i"
        type="button"
        class="aspect-square h-32 w-32 shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 sm:h-40 sm:w-40"
        :aria-label="`Ampliar foto ${i + 1} de ${alt}`"
        @click="abrir(i)"
      >
        <img :src="url" :alt="`${alt} — foto ${i + 1}`" loading="lazy" class="h-full w-full object-cover transition hover:scale-105" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="aberto"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        @click.self="fechar"
      >
        <button
          type="button"
          aria-label="Fechar"
          class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          @click="fechar"
        >
          ×
        </button>

        <button
          v-if="imagens.length > 1"
          type="button"
          aria-label="Foto anterior"
          class="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:left-4"
          @click="anterior"
        >
          ‹
        </button>

        <img
          :src="imagens[indiceAtual]"
          :alt="`${alt} — foto ${indiceAtual + 1}`"
          class="max-h-[85vh] max-w-full rounded-lg object-contain"
        />

        <button
          v-if="imagens.length > 1"
          type="button"
          aria-label="Próxima foto"
          class="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:right-4"
          @click="proxima"
        >
          ›
        </button>

        <p v-if="imagens.length > 1" class="absolute bottom-4 text-sm text-white/70">
          {{ indiceAtual + 1 }} / {{ imagens.length }}
        </p>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.galeria-scroll {
  scrollbar-width: none;
}

.galeria-scroll::-webkit-scrollbar {
  display: none;
}
</style>
