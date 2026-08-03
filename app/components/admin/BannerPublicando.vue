<script setup lang="ts">
defineProps<{
  status: 'publicando' | 'ok' | 'erro' | null
}>()

const emit = defineEmits<{ fechar: [] }>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="-translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-4 opacity-0"
  >
    <div
      v-if="status"
      class="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
      :class="{
        'bg-stone-900': status === 'publicando',
        'bg-emerald-600': status === 'ok',
        'bg-red-600': status === 'erro',
      }"
    >
      <Icon v-if="status === 'publicando'" name="lucide:loader-2" class="mt-0.5 h-5 w-5 flex-shrink-0 animate-spin" />
      <Icon v-else-if="status === 'ok'" name="lucide:check-circle" class="mt-0.5 h-5 w-5 flex-shrink-0" />
      <Icon v-else name="lucide:alert-circle" class="mt-0.5 h-5 w-5 flex-shrink-0" />

      <p class="flex-1 text-sm">
        <template v-if="status === 'publicando'">Salvando e publicando...</template>
        <template v-else-if="status === 'ok'">
          Alterações salvas. O site será atualizado em alguns minutos (o build novo leva de 3 a 10 minutos pra sair do forno).
        </template>
        <template v-else>Alterações salvas no banco, mas não consegui disparar a publicação automática. Avise pra publicar manualmente.</template>
      </p>

      <button v-if="status !== 'publicando'" type="button" class="flex-shrink-0 text-white/70 hover:text-white" aria-label="Fechar" @click="emit('fechar')">
        <Icon name="lucide:x" class="h-4 w-4" />
      </button>
    </div>
  </Transition>
</template>
