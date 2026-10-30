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
      class="h-56 w-56 rounded-mbb-md border border-line"
    />
    <button
      type="button"
      class="min-h-[44px] w-full rounded-mbb-md border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-ground"
      @click="copiar"
    >
      {{ copiado ? 'Copiado!' : 'Copiar código PIX (copia e cola)' }}
    </button>
    <p class="text-xs text-ink-muted">
      Abra o app do seu banco, escolha pagar com PIX e escaneie o QR Code ou cole o código copiado.
    </p>
  </div>
</template>
