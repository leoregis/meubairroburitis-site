<script setup lang="ts">
// "Empresas e profissionais do bairro": chips das categorias com mais
// cadastros, os prestadores mais bem avaliados e, ao lado, o ÚNICO bloco
// vermelho da página, chamando para o app Guia Buritis.
// Nota só de prestadores: a contagem de avaliações de empresa na view de
// listagem não filtra aprovação (ver EmpresasCard), a de prestadores filtra.
import { LINK_APP_GUIA } from '~/constants/navegacao'

const { data: resumo } = await useResumoDiretorioHome()
const { data: prestadores } = await usePrestadoresDestaqueHome()

const destaques = computed(() => (prestadores.value ?? []).filter((p) => p.total_avaliacoes > 0).slice(0, 3))
const formato = new Intl.NumberFormat('pt-BR')

const GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=br.com.meubairroburitis.twa'

function iniciais(nome: string) {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}
</script>

<template>
  <section aria-labelledby="guia-titulo" class="flex flex-col gap-4 sm:gap-6">
    <BaseSectionHeader
      id="guia-titulo"
      titulo="Empresas e profissionais do bairro"
      link-to="/empresas"
      :link-label="resumo?.totalEmpresas ? `Ver as ${formato.format(resumo.totalEmpresas)} empresas` : 'Ver as empresas'"
      :subtitulo="resumo?.totalEmpresas ? `${formato.format(resumo.totalEmpresas)} empresas e ${formato.format(resumo.totalPrestadores)} prestadores de serviço do Buritis e do Estoril.` : undefined"
    />

    <div class="flex flex-wrap items-stretch gap-6">
      <div class="flex min-w-0 flex-[3_1_560px] flex-col gap-4">
        <ul v-if="resumo?.categorias.length" class="-mx-4 flex list-none gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden" aria-label="Categorias">
          <li v-for="c in resumo.categorias" :key="`${c.tipo}-${c.slug}`" class="flex-none">
            <BaseChip :to="`/${c.tipo}/categoria/${c.slug}`">{{ c.nome }}</BaseChip>
          </li>
        </ul>

        <p class="m-0 pt-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">Mais bem avaliados pelos vizinhos</p>
        <ul class="m-0 flex list-none flex-col p-0">
          <li v-for="p in destaques" :key="p.id" class="border-b border-line">
            <NuxtLink
              :to="`/prestadores/${p.slug}`"
              class="flex items-center gap-3.5 py-3.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:py-4"
            >
              <img
                v-if="p.foto_url"
                :src="p.foto_url"
                alt=""
                width="56"
                height="56"
                loading="lazy"
                decoding="async"
                class="h-[52px] w-[52px] flex-none rounded-mbb-lg border border-line object-cover sm:h-14 sm:w-14"
              >
              <span v-else class="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-mbb-lg border border-line text-[15px] font-extrabold sm:h-14 sm:w-14" aria-hidden="true">
                {{ iniciais(p.nome) }}
              </span>
              <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="truncate text-[15px] font-bold sm:text-base">{{ p.nome }}</span>
                <span class="truncate text-xs text-ink-muted sm:text-[13px]">
                  {{ [p.categoria_nome, p.subcategoria_nome].filter(Boolean).join(' · ') }}
                </span>
              </span>
              <BaseNota :nota="Number(p.media_nota)" :total="p.total_avaliacoes" />
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/prestadores" class="inline-flex min-h-[44px] items-center self-start text-sm font-bold text-brand-ink hover:text-brand-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
          Ver os {{ resumo?.totalPrestadores ? formato.format(resumo.totalPrestadores) : '' }} prestadores
        </NuxtLink>
      </div>

      <section aria-labelledby="app-titulo" class="flex min-w-0 flex-[2_1_340px] flex-col gap-3.5 rounded-mbb-xl bg-brand p-5 text-white sm:p-7">
        <span class="flex h-12 w-12 items-center justify-center rounded-mbb-lg bg-white/[0.16]" aria-hidden="true">
          <Icon name="lucide:smartphone" class="h-6 w-6" />
        </span>
        <h2 id="app-titulo" class="m-0 text-balance text-[19px] font-extrabold leading-[25px] tracking-[-0.015em] sm:text-2xl sm:leading-[30px]">
          Para conversar, avaliar e reportar, use o app Guia Buritis
        </h2>
        <ul class="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-5">
          <li class="flex gap-2"><Icon name="lucide:check" class="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />Mensagens direto com o prestador</li>
          <li class="flex gap-2"><Icon name="lucide:check" class="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />Avaliações de vizinhos de verdade</li>
          <li class="flex gap-2"><Icon name="lucide:check" class="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />Radar de problemas e votação dos Melhores do Ano</li>
        </ul>
        <div class="mt-auto flex flex-wrap gap-2 pt-1">
          <BaseBotao :href="GOOGLE_PLAY" variante="claro" nova-aba class="flex-1 sm:flex-none">Baixar na Google Play</BaseBotao>
          <BaseBotao :href="LINK_APP_GUIA.href" variante="contorno-claro" class="flex-1 sm:flex-none">iPhone: abrir na web</BaseBotao>
        </div>
      </section>
    </div>
  </section>
</template>
