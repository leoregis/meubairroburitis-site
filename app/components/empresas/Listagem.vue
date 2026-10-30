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

// base das URLs desta listagem (paginação em DiretorioPaginacao)
const base = props.categoriaSlug ? `/empresas/categoria/${props.categoriaSlug}` : '/empresas'
</script>

<template>
  <div class="flex flex-col gap-5 sm:gap-6">
    <div class="relative max-w-xl">
      <label for="busca-empresas" class="sr-only">Buscar empresas</label>
      <Icon name="lucide:search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        id="busca-empresas"
        v-model="termo"
        type="search"
        autocomplete="off"
        placeholder="Buscar empresa por nome ou categoria"
        class="h-[52px] w-full rounded-mbb-lg border border-line bg-white pl-12 pr-4 text-[15px] text-ink placeholder:text-ink-subtle focus:border-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        @focus="busca.carregar"
      >
    </div>

    <h2 class="sr-only">Lista de empresas</h2>

    <template v-if="busca.ativo.value">
      <p class="m-0 text-sm text-ink-muted" aria-live="polite">
        <template v-if="busca.carregando.value">Buscando…</template>
        <template v-else-if="busca.erro.value">Não foi possível buscar agora. Tente de novo em instantes.</template>
        <template v-else>
          {{ busca.resultados.value.length }} empresa{{ busca.resultados.value.length === 1 ? '' : 's' }} para “{{ termo }}”
        </template>
      </p>
      <!-- lista limpa com linhas; duas colunas no computador -->
      <div v-if="busca.resultados.value.length" class="grid grid-cols-1 border-t border-line lg:grid-cols-2 lg:gap-x-10">
        <DiretorioLinha
            v-for="e in busca.resultados.value"
            :key="e.unidade_id"
            :to="`/empresas/${e.slug}`"
            :nome="e.nome"
            :imagem="e.logo_url"
            :categoria="e.categoria_nome"
            :subcategoria="e.subcategoria_nome"
            :apoio="e.endereco"
            :nota="e.nota_media"
            :total-avaliacoes="e.total_avaliacoes"
            nivel="h3"
          />
      </div>
    </template>

    <template v-else>
      <p v-if="itens.length === 0" class="m-0 text-ink-muted">Nenhuma empresa encontrada nesta categoria.</p>

      <div v-else class="grid grid-cols-1 border-t border-line lg:grid-cols-2 lg:gap-x-10">
        <DiretorioLinha
            v-for="e in itens"
            :key="e.unidade_id"
            :to="`/empresas/${e.slug}`"
            :nome="e.nome"
            :imagem="e.logo_url"
            :categoria="e.categoria_nome"
            :subcategoria="e.subcategoria_nome"
            :apoio="e.endereco"
            :nota="e.nota_media"
            :total-avaliacoes="e.total_avaliacoes"
            nivel="h3"
          />
      </div>

      <DiretorioPaginacao :base="base" :pagina="pagina" :total-paginas="totalPaginas" rotulo="Páginas de empresas" />
    </template>
  </div>
</template>
