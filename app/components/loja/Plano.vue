<script setup lang="ts">
// Cartão de plano mensal (MBB Basic / MBB Premium) na página Anuncie: nome,
// frase curta, preço por mês e o "Inclui, por mês" -- tudo da tabela
// `produtos`. O botão põe no carrinho, como o "Adicionar" de antes.
import type { Produto } from '~/composables/useProdutos'
import { itensDaDescricao, precoCurto } from '~/constants/anuncie'

const props = defineProps<{ produto: Produto; destaque?: boolean }>()

const { adicionar } = useCarrinho()
const { mostrar: mostrarToast } = useToastCarrinho()

const itens = computed(() => itensDaDescricao(props.produto.descricao))

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
  <article
    class="flex flex-col gap-4 rounded-mbb-xl border bg-white p-5 sm:p-7"
    :class="destaque ? 'border-ink shadow-[0_18px_40px_-24px_rgba(29,21,23,0.45)]' : 'border-line'"
  >
    <div class="flex flex-col gap-1">
      <h3 class="m-0 text-xl font-extrabold tracking-[-0.015em] text-ink sm:text-2xl">
        <NuxtLink :to="`/loja/${produto.slug}`" class="hover:text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          {{ produto.nome }}
        </NuxtLink>
      </h3>
      <p v-if="produto.descricao_curta" class="m-0 text-sm leading-[21px] text-ink-muted">{{ produto.descricao_curta }}</p>
    </div>
    <p class="m-0 flex items-baseline gap-1.5">
      <span
        v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos"
        class="text-base tabular-nums text-ink-muted line-through"
      >
        {{ precoCurto(produto.preco_original_centavos) }}
      </span>
      <span class="text-[34px] font-extrabold leading-10 tracking-[-0.03em] tabular-nums text-ink">{{ precoCurto(produto.preco_centavos) }}</span>
      <span class="text-sm font-semibold text-ink-muted">/mês</span>
    </p>
    <ul v-if="itens.length" class="m-0 flex flex-1 list-none flex-col gap-2.5 border-t border-line p-0 pt-4 text-sm leading-5 text-ink">
      <li v-for="item in itens" :key="item" class="flex gap-2.5">
        <Icon name="lucide:check" class="mt-0.5 h-[18px] w-[18px] flex-none text-brand-ink" aria-hidden="true" />
        <span>{{ item }}</span>
      </li>
    </ul>
    <div class="flex flex-col gap-2 pt-1 sm:flex-row">
      <BaseBotao :variante="destaque ? 'primario' : 'escuro'" class="flex-1" @click="adicionarAoCarrinho">
        <Icon name="lucide:shopping-cart" class="h-4 w-4" aria-hidden="true" />
        Adicionar ao carrinho
      </BaseBotao>
      <BaseBotao :to="`/loja/${produto.slug}`" variante="contorno" class="sm:flex-none">
        Detalhes<span class="sr-only"> do {{ produto.nome }}</span>
      </BaseBotao>
    </div>
  </article>
</template>
