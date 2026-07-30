<script setup lang="ts">
const props = defineProps<{ qrCodeBase64: string; copiaECola: string }>()

const copiado = ref(false)

async function copiar() {
  if (!import.meta.client) return
  await navigator.clipboard.writeText(props.copiaECola)
  copiado.value = true
  setTimeout(() => (copiado.value = false), 2500)
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <img
      :src="`data:image/png;base64,${qrCodeBase64}`"
      alt="QR Code do PIX"
      class="h-56 w-56 rounded-lg border border-stone-200"
    />
    <button
      type="button"
      class="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
      @click="copiar"
    >
      {{ copiado ? 'Copiado!' : 'Copiar código PIX (copia e cola)' }}
    </button>
    <p class="text-xs text-stone-500">
      Abra o app do seu banco, escolha pagar com PIX e escaneie o QR Code ou cole o código copiado.
    </p>
  </div>
</template>
