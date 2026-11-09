<script setup lang="ts">
const secoes = [
  { to: '/midiakit', label: 'Visão geral' },
  { to: '/midiakit/dados', label: 'Dados de alcance' },
  { to: '/midiakit/formatos', label: 'Formatos' },
  { to: '/midiakit/duvidas', label: 'Dúvidas' },
  { to: '/midiakit/cases', label: 'Cases' },
]

const route = useRoute()
// sem a barra final: o Apache pode servir /midiakit/dados/ (diretório)
const caminho = computed(() => route.path.replace(/(.)\/+$/, '$1'))
const indiceAtual = computed(() => secoes.findIndex((s) => s.to === caminho.value))
const anterior = computed(() => (indiceAtual.value > 0 ? secoes[indiceAtual.value - 1] : null))
const proximo = computed(() =>
  indiceAtual.value >= 0 && indiceAtual.value < secoes.length - 1 ? secoes[indiceAtual.value + 1] : null,
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <nav aria-label="Seções do midiakit" class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul class="m-0 flex min-w-max list-none gap-2 p-0">
        <li v-for="secao in secoes" :key="secao.to">
          <BaseChip :to="secao.to" :ativo="caminho === secao.to">{{ secao.label }}</BaseChip>
        </li>
      </ul>
    </nav>

    <div v-if="anterior || proximo" class="flex items-center justify-between text-sm">
      <NuxtLink
        v-if="anterior"
        :to="anterior.to"
        class="inline-flex min-h-[44px] items-center gap-1 font-bold text-ink-muted hover:text-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <Icon name="lucide:chevron-left" class="h-4 w-4" aria-hidden="true" /> {{ anterior.label }}
      </NuxtLink>
      <span v-else />
      <NuxtLink
        v-if="proximo"
        :to="proximo.to"
        class="inline-flex min-h-[44px] items-center gap-1 font-bold text-ink-muted hover:text-brand-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {{ proximo.label }} <Icon name="lucide:chevron-right" class="h-4 w-4" aria-hidden="true" />
      </NuxtLink>
    </div>
  </div>
</template>
