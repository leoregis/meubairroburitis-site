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
      class="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl bg-stone-900 px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:right-6"
    >
      <Icon name="lucide:check-circle" class="h-5 w-5 flex-shrink-0 text-emerald-400" />
      <p class="flex-1 text-sm">{{ mensagem }}</p>
      <NuxtLink
        to="/carrinho"
        class="flex-shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-stone-100"
        @click="esconder"
      >
        Ver carrinho
      </NuxtLink>
      <button
        type="button"
        class="flex-shrink-0 text-stone-400 hover:text-white"
        aria-label="Fechar"
        @click="esconder"
      >
        <Icon name="lucide:x" class="h-4 w-4" />
      </button>
    </div>
  </Transition>
</template>
