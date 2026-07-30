<script setup lang="ts">
const secoes = [
  { to: '/midiakit', label: 'Visão geral' },
  { to: '/midiakit/dados', label: 'Dados de alcance' },
  { to: '/midiakit/formatos', label: 'Formatos' },
  { to: '/midiakit/duvidas', label: 'Dúvidas' },
  { to: '/midiakit/cases', label: 'Cases' },
]

const route = useRoute()
const indiceAtual = computed(() => secoes.findIndex((s) => s.to === route.path))
const anterior = computed(() => (indiceAtual.value > 0 ? secoes[indiceAtual.value - 1] : null))
const proximo = computed(() =>
  indiceAtual.value >= 0 && indiceAtual.value < secoes.length - 1 ? secoes[indiceAtual.value + 1] : null,
)
</script>

<template>
  <div class="mb-10">
    <nav class="flex gap-1 overflow-x-auto border-b border-stone-200 pb-px">
      <NuxtLink
        v-for="secao in secoes"
        :key="secao.to"
        :to="secao.to"
        class="shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium text-stone-500 hover:text-orange-700"
        :class="
          route.path === secao.to
            ? 'border-orange-600 text-orange-700'
            : 'border-transparent'
        "
      >
        {{ secao.label }}
      </NuxtLink>
    </nav>

    <div v-if="anterior || proximo" class="mt-4 flex items-center justify-between text-sm">
      <NuxtLink v-if="anterior" :to="anterior.to" class="flex items-center gap-1 font-medium text-stone-600 hover:text-orange-700">
        <Icon name="lucide:chevron-left" class="h-4 w-4" /> {{ anterior.label }}
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="proximo" :to="proximo.to" class="flex items-center gap-1 font-medium text-stone-600 hover:text-orange-700">
        {{ proximo.label }} <Icon name="lucide:chevron-right" class="h-4 w-4" />
      </NuxtLink>
    </div>
  </div>
</template>
