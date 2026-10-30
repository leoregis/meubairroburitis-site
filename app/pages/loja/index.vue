<script setup lang="ts">
// Página Anuncie (redesign, fase 5): números de alcance, planos mensais (com o
// Plano Imobiliário, fora do carrinho), formatos avulsos por quem produz, aviso
// de como funciona, comparativo, cases e "Prefere conversar?". Produtos e
// preços vêm do banco (useProdutos); ver constants/anuncie.ts.
import { GRUPO_POR_SLUG, NUMEROS_ALCANCE } from '~/constants/anuncie'

useSeoMeta({
  title: 'Anuncie no Meu Bairro Buritis — Pacotes de anúncio',
  description: 'Escolha entre 5 pacotes de anúncio no Meu Bairro Buritis, do Story avulso ao pacote mensal Premium.',
})

const { data: produtos } = await useProdutos()

const planos = computed(() => (produtos.value ?? []).filter((p) => GRUPO_POR_SLUG[p.slug] === 'plano'))
const avulsos = computed(() => {
  const ordem = { equipe: 0, pronto: 1 } as Record<string, number>
  return (produtos.value ?? [])
    .filter((p) => GRUPO_POR_SLUG[p.slug] !== 'plano')
    .sort((a, b) => (ordem[GRUPO_POR_SLUG[a.slug] ?? ''] ?? 2) - (ordem[GRUPO_POR_SLUG[b.slug] ?? ''] ?? 2) || a.ordem - b.ordem)
})
</script>

<template>
  <div>
    <section class="border-b border-line bg-ground">
      <div class="mx-auto flex max-w-[1248px] flex-col gap-8 px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-14">
        <header class="flex max-w-[760px] flex-col gap-3">
          <BaseEyebrow>Anuncie no Meu Bairro Buritis</BaseEyebrow>
          <h1 class="m-0 text-balance text-[34px] font-extrabold leading-10 tracking-[-0.03em] text-ink sm:text-[52px] sm:leading-[58px]">
            Pacotes de anúncio
          </h1>
          <p class="m-0 text-balance text-lg font-semibold leading-7 text-ink sm:text-[22px] sm:leading-8">
            Sua marca na conversa de quem vive o Buritis e o Estoril.
          </p>
          <p class="m-0 text-[15px] leading-[23px] text-ink-muted sm:text-[17px] sm:leading-[27px]">
            Escolha seu pacote e pague com Pix ou cartão aqui mesmo. Prefere conversar antes? Fale com a gente pelo WhatsApp.
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            <BaseBotao href="#planos" variante="primario" class="flex-1 sm:flex-none">Ver planos e preços</BaseBotao>
            <BaseBotao to="/midiakit" variante="contorno" class="flex-1 sm:flex-none">Midiakit</BaseBotao>
          </div>
        </header>
        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 lg:grid-cols-4">
          <div v-for="n in NUMEROS_ALCANCE" :key="n.legenda" class="flex flex-col-reverse gap-1">
            <dt class="text-[13px] leading-[18px] text-ink-muted sm:text-sm">{{ n.legenda }}</dt>
            <dd class="m-0 text-[26px] font-extrabold leading-8 tracking-[-0.025em] text-ink sm:text-[34px] sm:leading-10">{{ n.valor }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="mx-auto flex max-w-[1248px] flex-col gap-14 px-4 py-12 sm:gap-[72px] sm:px-6 sm:py-16">
      <section id="planos" aria-labelledby="planos-titulo" class="flex scroll-mt-6 flex-col gap-5">
        <BaseSectionHeader id="planos-titulo" titulo="Planos mensais" subtitulo="Presença todo mês. Você envia o conteúdo pronto e a gente publica nas datas combinadas." />
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LojaPlano v-for="(produto, i) in planos" :key="produto.id" :produto="produto" :destaque="i === planos.length - 1" />
          <LojaPlanoImobiliario />
        </div>
      </section>

      <section aria-labelledby="avulsos-titulo" class="flex flex-col gap-5">
        <BaseSectionHeader id="avulsos-titulo" titulo="Formatos avulsos" subtitulo="Uma ação pontual, quando você precisar." />
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LojaProdutoCard v-for="produto in avulsos" :key="produto.id" :produto="produto" />
        </div>
        <LojaComoFunciona />
      </section>

      <LojaComparativo :produtos="produtos ?? []" />

      <LojaCases />

      <LojaConversar />
    </div>
  </div>
</template>
