<script setup lang="ts">
const { visivel, mensagem, esconder } = useToastCarrinho()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="visivel"
      role="status"
      class="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-mbb-lg bg-ink px-4 py-3 text-white shadow-[0_14px_30px_-14px_rgba(29,21,23,0.5)] sm:inset-x-auto sm:bottom-6 sm:right-24"
    >
      <Icon name="lucide:check-circle" class="h-5 w-5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
      <p class="flex-1 text-sm">{{ mensagem }}</p>
      <NuxtLink
        to="/carrinho"
        class="inline-flex min-h-[36px] flex-shrink-0 items-center rounded-mbb-md bg-white px-3 text-xs font-bold text-ink hover:bg-ground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="esconder"
      >
        Ver carrinho
      </NuxtLink>
      <button
        type="button"
        class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-mbb-sm text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Fechar aviso"
        @click="esconder"
      >
        <Icon name="lucide:x" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>
