<script setup lang="ts">
import type { PrestadorListagemItem } from '~/composables/useEmpresasPrestadoresListagem'

const props = defineProps<{ pagina: number; categoriaSlug?: string }>()

const { data } = await usePrestadoresPagina(props.pagina, props.categoriaSlug)

const itens = computed(() => data.value?.itens ?? [])
const totalPaginas = computed(() => data.value?.totalPaginas ?? 1)

// busca client-side sobre todos os prestadores (não só a página atual) --
// enquanto houver termo, os resultados substituem a grade paginada.
const busca = useBuscaDiretorio<PrestadorListagemItem>(
  'vw_prestadores_publico_listagem',
  (p) => [p.nome, p.categoria_nome, p.subcategoria_nome, p.descricao_curta],
)
const { termo } = busca

function linkPagina(numero: number) {
  const base = props.categoriaSlug ? `/prestadores/categoria/${props.categoriaSlug}` : '/prestadores'
  return numero <= 1 ? base : `${base}/pagina/${numero}`
}
</script>

<template>
  <div>
    <div class="relative mx-auto mb-8 max-w-xl">
      <label for="busca-prestadores" class="sr-only">Buscar prestadores</label>
      <Icon name="lucide:search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
      <input
        id="busca-prestadores"
        v-model="termo"
        type="search"
        autocomplete="off"
        placeholder="Buscar prestador por nome ou serviço"
        class="w-full rounded-full border border-stone-300 bg-white py-3 pl-12 pr-4 text-base text-stone-900 shadow-sm placeholder:text-stone-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        @focus="busca.carregar"
      />
    </div>

    <h2 class="sr-only">Lista de prestadores</h2>

    <template v-if="busca.ativo.value">
      <p class="mb-6 text-center text-sm text-stone-500" aria-live="polite">
        <template v-if="busca.carregando.value">Buscando…</template>
        <template v-else-if="busca.erro.value">Não foi possível buscar agora. Tente de novo em instantes.</template>
        <template v-else>
          {{ busca.resultados.value.length }} prestador{{ busca.resultados.value.length === 1 ? '' : 'es' }} para “{{ termo }}”
        </template>
      </p>
      <div v-if="busca.resultados.value.length" class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <PrestadoresCard v-for="prestador in busca.resultados.value" :key="prestador.id" :prestador="prestador" />
      </div>
    </template>

    <template v-else>
      <p v-if="itens.length === 0" class="text-center text-stone-500">Nenhum prestador encontrado nesta categoria.</p>

      <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <PrestadoresCard v-for="prestador in itens" :key="prestador.id" :prestador="prestador" />
      </div>

      <nav v-if="totalPaginas > 1" class="mt-10 flex items-center justify-center gap-2">
        <NuxtLink
          v-if="pagina > 1"
          :to="linkPagina(pagina - 1)"
          class="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          ← Anterior
        </NuxtLink>

        <span class="px-3 text-sm text-stone-500">Página {{ pagina }} de {{ totalPaginas }}</span>

        <NuxtLink
          v-if="pagina < totalPaginas"
          :to="linkPagina(pagina + 1)"
          class="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Próxima →
        </NuxtLink>
      </nav>
    </template>
  </div>
</template>
