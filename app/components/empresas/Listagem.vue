<script setup lang="ts">
import type { EmpresaListagemItem } from '~/composables/useEmpresasPrestadoresListagem'

const props = defineProps<{ pagina: number; categoriaSlug?: string }>()

const { data } = await useEmpresasPagina(props.pagina, props.categoriaSlug)

const itens = computed(() => data.value?.itens ?? [])
const totalPaginas = computed(() => data.value?.totalPaginas ?? 1)

// busca client-side sobre todas as empresas (não só a página atual) --
// enquanto houver termo, os resultados substituem a grade paginada.
const busca = useBuscaDiretorio<EmpresaListagemItem>(
  'vw_empresas_publico_listagem',
  (e) => [e.nome, e.categoria_nome, e.subcategoria_nome],
)
const { termo } = busca

function linkPagina(numero: number) {
  const base = props.categoriaSlug ? `/empresas/categoria/${props.categoriaSlug}` : '/empresas'
  return numero <= 1 ? base : `${base}/pagina/${numero}`
}
</script>

<template>
  <div>
    <div class="relative mx-auto mb-8 max-w-xl">
      <label for="busca-empresas" class="sr-only">Buscar empresas</label>
      <Icon name="lucide:search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
      <input
        id="busca-empresas"
        v-model="termo"
        type="search"
        autocomplete="off"
        placeholder="Buscar empresa por nome ou categoria"
        class="w-full rounded-full border border-stone-300 bg-white py-3 pl-12 pr-4 text-base text-stone-900 shadow-sm placeholder:text-stone-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        @focus="busca.carregar"
      />
    </div>

    <h2 class="sr-only">Lista de empresas</h2>

    <template v-if="busca.ativo.value">
      <p class="mb-6 text-center text-sm text-stone-500" aria-live="polite">
        <template v-if="busca.carregando.value">Buscando…</template>
        <template v-else-if="busca.erro.value">Não foi possível buscar agora. Tente de novo em instantes.</template>
        <template v-else>
          {{ busca.resultados.value.length }} empresa{{ busca.resultados.value.length === 1 ? '' : 's' }} para “{{ termo }}”
        </template>
      </p>
      <div v-if="busca.resultados.value.length" class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <EmpresasCard v-for="empresa in busca.resultados.value" :key="empresa.unidade_id" :empresa="empresa" />
      </div>
    </template>

    <template v-else>
      <p v-if="itens.length === 0" class="text-center text-stone-500">Nenhuma empresa encontrada nesta categoria.</p>

      <div v-else class="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <EmpresasCard v-for="empresa in itens" :key="empresa.unidade_id" :empresa="empresa" />
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
