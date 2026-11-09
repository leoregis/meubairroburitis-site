<script setup lang="ts">
// Formato avulso na página Anuncie (redesign, fase 5): ícone, selo de quem
// produz, nome, descrição curta e preço -- dados da tabela `produtos`.
import type { Produto } from '~/composables/useProdutos'
import { GRUPO_POR_SLUG, ICONE_POR_SLUG, ROTULO_GRUPO, precoCurto } from '~/constants/anuncie'

const props = defineProps<{ produto: Produto }>()

const { adicionar } = useCarrinho()
const { mostrar: mostrarToast } = useToastCarrinho()

const grupo = computed(() => GRUPO_POR_SLUG[props.produto.slug])
const selo = computed(() => (grupo.value === 'equipe' || grupo.value === 'pronto' ? ROTULO_GRUPO[grupo.value] : null))
const icone = computed(() => ICONE_POR_SLUG[props.produto.slug] ?? 'lucide:megaphone')

function adicionarAoCarrinho() {
  adicionar({
    produtoId: props.produto.id,
    slug: props.produto.slug,
    nome: props.produto.nome,
    precoCentavos: props.produto.preco_centavos,
  })
  mostrarToast(props.produto.nome)
}
</script>

<template>
  <article class="flex min-w-0 flex-col gap-3 rounded-mbb-xl border border-line bg-white p-5">
    <div class="flex items-start justify-between gap-3">
      <span class="flex h-11 w-11 flex-none items-center justify-center rounded-mbb-lg bg-brand-tint text-brand-ink" aria-hidden="true">
        <Icon :name="icone" class="h-[22px] w-[22px]" />
      </span>
      <span
        v-if="selo"
        class="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]"
        :class="grupo === 'equipe' ? 'bg-ink text-white' : 'bg-chip text-ink'"
      >
        {{ selo }}
      </span>
    </div>
    <h3 class="m-0 text-lg font-extrabold leading-6 tracking-[-0.01em] text-ink">
      <NuxtLink :to="`/loja/${produto.slug}`" class="hover:text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        {{ produto.nome }}
      </NuxtLink>
    </h3>
    <p v-if="produto.descricao_curta" class="m-0 flex-1 text-sm leading-[21px] text-ink-muted">{{ produto.descricao_curta }}</p>
    <div class="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
      <p class="m-0 flex flex-col">
        <span
          v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos"
          class="text-[13px] tabular-nums text-ink-muted line-through"
        >
          <span class="sr-only">De </span>{{ precoCurto(produto.preco_original_centavos) }}
        </span>
        <span class="text-2xl font-extrabold tracking-[-0.02em] tabular-nums text-ink">
          <span v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos" class="sr-only">por </span>{{ precoCurto(produto.preco_centavos) }}
        </span>
      </p>
      <BaseBotao variante="escuro" @click="adicionarAoCarrinho">
        <Icon name="lucide:shopping-cart" class="h-4 w-4" aria-hidden="true" />
        Adicionar<span class="sr-only"> {{ produto.nome }} ao carrinho</span>
      </BaseBotao>
    </div>
  </article>
</template>
