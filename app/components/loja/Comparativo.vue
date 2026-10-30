<script setup lang="ts">
// Comparativo de pacotes (veio da home): todos os produtos ativos lado a lado,
// com quem produz e o preço. No celular, cada linha vira um bloco.
import type { Produto } from '~/composables/useProdutos'
import { GRUPO_POR_SLUG, precoCurto } from '~/constants/anuncie'

defineProps<{ produtos: Produto[] }>()

function quemProduz(slug: string) {
  return GRUPO_POR_SLUG[slug] === 'equipe' ? 'Nossa equipe' : 'Você envia pronto'
}
</script>

<template>
  <section aria-labelledby="comparativo-titulo" class="flex flex-col gap-5">
    <BaseSectionHeader id="comparativo-titulo" titulo="Compare os pacotes" subtitulo="Todos os formatos, lado a lado." />
    <table class="w-full border-collapse text-left text-sm">
      <caption class="sr-only">Pacotes de anúncio: formato, quem produz o conteúdo e preço</caption>
      <thead class="hidden md:table-header-group">
        <tr class="border-b border-line text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
          <th scope="col" class="py-3 pr-4">Pacote</th>
          <th scope="col" class="py-3 pr-4">O que é</th>
          <th scope="col" class="py-3 pr-4">Conteúdo</th>
          <th scope="col" class="py-3 text-right">Preço</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="produto in produtos" :key="produto.id" class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-line py-4 md:table-row md:py-0">
          <th scope="row" class="font-bold text-ink md:w-[22%] md:py-4 md:pr-4">
            <NuxtLink :to="`/loja/${produto.slug}`" class="hover:text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              {{ produto.nome }}
            </NuxtLink>
          </th>
          <td class="row-span-2 text-right align-top font-extrabold tabular-nums text-ink md:hidden">
            {{ precoCurto(produto.preco_centavos) }}<span v-if="GRUPO_POR_SLUG[produto.slug] === 'plano'" class="font-semibold text-ink-muted">/mês</span>
          </td>
          <td class="col-start-1 text-ink-muted md:py-4 md:pr-4">{{ produto.descricao_curta }}</td>
          <td class="col-start-1 text-[13px] font-semibold text-ink md:whitespace-nowrap md:py-4 md:pr-4 md:text-sm">
            <span class="md:hidden">Conteúdo: </span>{{ quemProduz(produto.slug) }}
          </td>
          <td class="hidden whitespace-nowrap py-4 text-right font-extrabold tabular-nums text-ink md:table-cell">
            {{ precoCurto(produto.preco_centavos) }}<span v-if="GRUPO_POR_SLUG[produto.slug] === 'plano'" class="font-semibold text-ink-muted">/mês</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
