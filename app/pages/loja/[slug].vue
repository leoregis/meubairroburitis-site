<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: produto } = await useProduto(slug)

if (!produto.value) {
  throw createError({ statusCode: 404, message: 'Pacote não encontrado' })
}

const { adicionar } = useCarrinho()
const { mostrar: mostrarToast } = useToastCarrinho()
const quantidade = ref(1)

function adicionarAoCarrinho() {
  if (!produto.value) return
  adicionar(
    {
      produtoId: produto.value.id,
      slug: produto.value.slug,
      nome: produto.value.nome,
      precoCentavos: produto.value.preco_centavos,
    },
    quantidade.value,
  )
  mostrarToast(produto.value.nome)
}

useSeoMeta({
  title: () => `${produto.value?.nome} — Meu Bairro Buritis`,
  description: () => produto.value?.descricao_curta ?? undefined,
})

useJsonLd({
  '@type': 'Product',
  name: produto.value.nome,
  description: produto.value.descricao_curta ?? undefined,
  image: produto.value.imagem_url ? `https://meubairroburitis.com.br${produto.value.imagem_url}` : undefined,
  offers: {
    '@type': 'Offer',
    price: produto.value.preco_centavos / 100,
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
  },
})
</script>

<template>
  <div v-if="produto" class="mx-auto max-w-2xl px-4 py-16">
    <NuxtLink to="/loja" class="text-sm text-stone-500 hover:text-orange-700">← Voltar pros pacotes</NuxtLink>

    <h1 class="mt-4 font-serif text-3xl font-bold text-stone-900">{{ produto.nome }}</h1>

    <NuxtPicture
      v-if="produto.imagem_url"
      :src="produto.imagem_url"
      :alt="produto.nome"
      format="avif,webp"
      :width="700"
      :height="420"
      loading="eager"
      :img-attrs="{ class: 'mt-6 w-full rounded-2xl object-cover' }"
    />

    <p class="mt-6 whitespace-pre-line text-stone-600">{{ produto.descricao }}</p>

    <div class="mt-8 flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-6">
      <div>
        <p
          v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos"
          class="tabular-nums text-stone-400 line-through"
        >
          {{ formatarPreco(produto.preco_original_centavos) }}
        </p>
        <p class="text-2xl font-bold tabular-nums text-orange-700">{{ formatarPreco(produto.preco_centavos) }}</p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <input
          v-model.number="quantidade"
          type="number"
          min="1"
          class="w-16 rounded-md border border-stone-300 px-2 py-2 text-center"
        />
        <button
          type="button"
          class="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700"
          @click="adicionarAoCarrinho"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  </div>
</template>
