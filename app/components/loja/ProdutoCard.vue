<script setup lang="ts">
import type { Produto } from '~/composables/useProdutos'

const props = defineProps<{ produto: Produto }>()

const { adicionar } = useCarrinho()
const { mostrar: mostrarToast } = useToastCarrinho()

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
  <div class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:rounded-2xl">
    <NuxtLink :to="`/loja/${produto.slug}`" class="flex flex-1 flex-col">
      <NuxtPicture
        v-if="produto.imagem_url"
        :src="produto.imagem_url"
        :alt="produto.nome"
        format="avif,webp"
        :width="480"
        :height="320"
        loading="lazy"
        :img-attrs="{ class: 'h-24 w-full object-cover sm:h-40' }"
      />
      <div class="flex flex-1 flex-col p-3 sm:p-6">
        <h3 class="font-serif text-sm font-bold text-stone-900 hover:text-orange-700 sm:text-lg">{{ produto.nome }}</h3>
        <p class="mt-1 hidden flex-1 text-sm text-stone-500 sm:mt-2 sm:block">{{ produto.descricao_curta }}</p>
      </div>
    </NuxtLink>
    <div class="flex items-center justify-between gap-2 px-3 pb-3 sm:px-6 sm:pb-6">
      <div>
        <p
          v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos"
          class="text-xs tabular-nums text-stone-400 line-through sm:text-sm"
        >
          {{ formatarPreco(produto.preco_original_centavos) }}
        </p>
        <p class="text-base font-bold tabular-nums text-orange-700 sm:text-xl">{{ formatarPreco(produto.preco_centavos) }}</p>
      </div>
      <button
        type="button"
        class="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 sm:px-4 sm:py-2 sm:text-sm"
        @click="adicionarAoCarrinho"
      >
        Adicionar
      </button>
    </div>
  </div>
</template>
