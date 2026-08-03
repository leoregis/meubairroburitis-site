<script setup lang="ts">
defineProps<{
  aberto: boolean
  titulo: string
  mensagem: string
  confirmando?: boolean
}>()

const emit = defineEmits<{
  confirmar: []
  cancelar: []
}>()
</script>

<template>
  <div v-if="aberto" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="emit('cancelar')">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <h3 class="font-serif text-lg font-bold text-stone-900">{{ titulo }}</h3>
      <p class="mt-2 text-sm text-stone-600">{{ mensagem }}</p>
      <div class="mt-6 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          @click="emit('cancelar')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="confirmando"
          class="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          @click="emit('confirmar')"
        >
          {{ confirmando ? 'Excluindo...' : 'Excluir' }}
        </button>
      </div>
    </div>
  </div>
</template>
