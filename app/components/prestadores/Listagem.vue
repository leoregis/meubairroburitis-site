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

// base das URLs desta listagem (paginação em DiretorioPaginacao)
const base = props.categoriaSlug ? `/prestadores/categoria/${props.categoriaSlug}` : '/prestadores'
</script>

<template>
  <div class="flex flex-col gap-5 sm:gap-6">
    <div class="relative max-w-xl">
      <label for="busca-prestadores" class="sr-only">Buscar prestadores</label>
      <Icon name="lucide:search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        id="busca-prestadores"
        v-model="termo"
        type="search"
        autocomplete="off"
        placeholder="Buscar prestador por nome ou serviço"
        class="h-[52px] w-full rounded-mbb-lg border border-line bg-white pl-12 pr-4 text-[15px] text-ink placeholder:text-ink-subtle focus:border-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        @focus="busca.carregar"
      >
    </div>

    <h2 class="sr-only">Lista de prestadores</h2>

    <template v-if="busca.ativo.value">
      <p class="m-0 text-sm text-ink-muted" aria-live="polite">
        <template v-if="busca.carregando.value">Buscando…</template>
        <template v-else-if="busca.erro.value">Não foi possível buscar agora. Tente de novo em instantes.</template>
        <template v-else>
          {{ busca.resultados.value.length }} prestador{{ busca.resultados.value.length === 1 ? '' : 'es' }} para “{{ termo }}”
        </template>
      </p>
      <!-- lista limpa com linhas; duas colunas no computador -->
      <div v-if="busca.resultados.value.length" class="grid grid-cols-1 border-t border-line lg:grid-cols-2 lg:gap-x-10">
        <DiretorioLinha
            v-for="p in busca.resultados.value"
            :key="p.id"
            :to="`/prestadores/${p.slug}`"
            :nome="p.nome"
            :imagem="p.foto_url"
            :categoria="p.categoria_nome"
            :subcategoria="p.subcategoria_nome"
            :apoio="p.descricao_curta"
            :verificado="p.verificado"
            :nota="p.media_nota"
            :total-avaliacoes="p.total_avaliacoes"
            nivel="h3"
          />
      </div>
    </template>

    <template v-else>
      <p v-if="itens.length === 0" class="m-0 text-ink-muted">Nenhum prestador encontrado nesta categoria.</p>

      <div v-else class="grid grid-cols-1 border-t border-line lg:grid-cols-2 lg:gap-x-10">
        <DiretorioLinha
            v-for="p in itens"
            :key="p.id"
            :to="`/prestadores/${p.slug}`"
            :nome="p.nome"
            :imagem="p.foto_url"
            :categoria="p.categoria_nome"
            :subcategoria="p.subcategoria_nome"
            :apoio="p.descricao_curta"
            :verificado="p.verificado"
            :nota="p.media_nota"
            :total-avaliacoes="p.total_avaliacoes"
            nivel="h3"
          />
      </div>

      <DiretorioPaginacao :base="base" :pagina="pagina" :total-paginas="totalPaginas" rotulo="Páginas de prestadores" />
    </template>
  </div>
</template>
