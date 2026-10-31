<script setup lang="ts">
import { GRUPO_POR_SLUG, ROTULO_GRUPO, precoCurto } from '~/constants/anuncie'

const route = useRoute()
const slug = route.params.slug as string

const { data: produto } = await useProduto(slug)

if (!produto.value) {
  throw createError({ statusCode: 404, message: 'Pacote não encontrado' })
}

const { adicionar } = useCarrinho()
const { mostrar: mostrarToast } = useToastCarrinho()
const quantidade = ref(1)

// redesign (fase 5): grupo do pacote (plano mensal ou quem produz), só visual
const grupo = GRUPO_POR_SLUG[slug]
const selo = grupo === 'plano' ? 'Plano mensal' : grupo ? ROTULO_GRUPO[grupo] : null

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
  <div v-if="produto" class="mx-auto flex max-w-[1248px] flex-col gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-[72px] sm:pt-10">
    <nav aria-label="Breadcrumb" class="text-sm text-ink-muted">
      <ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
        <li><NuxtLink to="/loja" class="inline-flex min-h-[44px] items-center font-bold text-brand-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">Anuncie</NuxtLink></li>
        <li aria-hidden="true">/</li>
        <li><span aria-current="page" class="text-ink">{{ produto.nome }}</span></li>
      </ol>
    </nav>

    <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
      <div class="flex min-w-0 flex-col gap-6">
        <header class="flex flex-col gap-2">
          <BaseEyebrow v-if="selo">{{ selo }}</BaseEyebrow>
          <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">{{ produto.nome }}</h1>
          <p v-if="produto.descricao_curta" class="m-0 text-[17px] leading-[27px] text-ink-muted">{{ produto.descricao_curta }}</p>
        </header>

        <p class="m-0 whitespace-pre-line text-base leading-[27px] text-ink sm:text-[17px] sm:leading-[29px]">{{ produto.descricao }}</p>
      </div>

      <aside aria-label="Comprar" class="flex flex-col gap-4 rounded-mbb-xl border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-6">
        <!-- foto na caixa de compra (fase 5): no celular ela vem depois da
             descrição, e o texto continua sendo o LCP, como na página antiga -->
        <NuxtPicture
          v-if="produto.imagem_url"
          :src="produto.imagem_url"
          :alt="produto.nome"
          format="avif,webp"
          :width="340"
          :height="204"
          densities="x1 x2"
          :img-attrs="{ class: 'w-full rounded-mbb-lg border border-line object-cover' }"
        />
        <p class="m-0 flex flex-col">
          <span
            v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos"
            class="tabular-nums text-ink-muted line-through"
          >
            <span class="sr-only">De </span>{{ formatarPreco(produto.preco_original_centavos) }}
          </span>
          <span class="flex items-baseline gap-1.5">
            <span class="text-[34px] font-extrabold leading-10 tracking-[-0.03em] tabular-nums text-ink">
              <span v-if="produto.preco_original_centavos && produto.preco_original_centavos > produto.preco_centavos" class="sr-only">por </span>{{ precoCurto(produto.preco_centavos) }}
            </span>
            <span v-if="grupo === 'plano'" class="text-sm font-semibold text-ink-muted">/mês</span>
          </span>
        </p>
        <div class="flex items-end gap-2">
          <label class="flex flex-col gap-1 text-xs font-bold text-ink-muted">
            Quantidade
            <input
              v-model.number="quantidade"
              type="number"
              min="1"
              class="h-11 w-20 rounded-mbb-md border border-line px-2 text-center text-base text-ink focus:border-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink"
            />
          </label>
          <BaseBotao variante="primario" class="flex-1" @click="adicionarAoCarrinho">
            <Icon name="lucide:shopping-cart" class="h-4 w-4" aria-hidden="true" />
            Adicionar ao carrinho
          </BaseBotao>
        </div>
        <ul class="m-0 flex list-none flex-col gap-2 border-t border-line p-0 pt-4 text-[13px] leading-5 text-ink-muted">
          <li class="flex gap-2"><Icon name="lucide:credit-card" class="mt-px h-4 w-4 flex-none" aria-hidden="true" />Pix ou cartão, aqui mesmo no site</li>
          <li class="flex gap-2"><Icon name="lucide:package-check" class="mt-px h-4 w-4 flex-none" aria-hidden="true" />Acompanhe o pedido em Meus pedidos</li>
        </ul>
      </aside>
    </div>

    <LojaComoFunciona />

    <LojaConversar :mensagem="`Olá! Tenho uma dúvida sobre o pacote ${produto.nome}.`" />
  </div>
</template>
