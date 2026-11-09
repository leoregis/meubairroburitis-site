<script setup lang="ts">
import { linkTelefonePrestador, linkWhatsappPrestador } from '~/utils/telefone'

const route = useRoute()
const slug = route.params.slug as string

const { data: prestador } = await usePrestadorPublico(slug)

if (!prestador.value) {
  throw createError({ statusCode: 404, message: 'Prestador não encontrado' })
}

const canonicalUrl = computed(() => `https://meubairroburitis.com.br/prestadores/${prestador.value?.slug}`)
const linkGuia = computed(() => `https://meubairroburitis.com.br/guia/prestador/${prestador.value?.slug}`)

// Fase C do SEO (07/out): title/description por padrão fixo (ver
// utils/seoDiretorio.ts). Schema (Person) continua como estava.
const tituloSeo = computed(() => (prestador.value ? tituloPrestador(prestador.value) : ''))
const descricaoSeo = computed(() => (prestador.value ? descricaoPrestador(prestador.value) : undefined))

useSeoMeta({
  title: () => tituloSeo.value,
  description: () => descricaoSeo.value,
  ogTitle: () => prestador.value?.nome,
  ogDescription: () => prestador.value?.descricao_curta || undefined,
  ogImage: () => prestador.value?.foto_url || undefined,
  ogType: 'profile',
  twitterCard: 'summary_large_image',
  twitterTitle: () => prestador.value?.nome,
  twitterDescription: () => prestador.value?.descricao_curta || undefined,
  twitterImage: () => prestador.value?.foto_url || undefined,
})

// Person, não ProfessionalService/LocalBusiness -- a RPC não devolve
// endereço nem coordenadas de um estabelecimento fixo, só nome do bairro
// (prestador autônomo, não uma empresa com endereço). Só com os campos que
// a RPC realmente devolve.
useJsonLd({
  '@type': 'Person',
  name: prestador.value.nome,
  description: prestador.value.descricao_curta || undefined,
  image: prestador.value.foto_url || undefined,
  url: canonicalUrl.value,
  jobTitle: prestador.value.categoria_nome || undefined,
  telephone: prestador.value.telefone || undefined,
  address: prestador.value.bairro_nome
    ? { '@type': 'PostalAddress', addressLocality: prestador.value.bairro_nome, addressRegion: 'MG', addressCountry: 'BR' }
    : undefined,
})

useJsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://meubairroburitis.com.br/' },
    { '@type': 'ListItem', position: 2, name: 'Prestadores', item: 'https://meubairroburitis.com.br/prestadores' },
    { '@type': 'ListItem', position: 3, name: prestador.value.nome, item: canonicalUrl.value },
  ],
})
// --- redesign (fase 4) ---------------------------------------------------
// foto do perfil pelo IPX no build, o mesmo arquivo de 192x192 da listagem;
// as originais chegam a ~100 KB e disputam o LCP
const foto = computed(() => useFotoGuia()(prestador.value?.foto_url, MINIATURA_GUIA, MINIATURA_GUIA))
const iniciais = computed(() => (prestador.value?.nome ?? '').split(/\s+/).filter((p) => /\p{L}/u.test(p[0] ?? '')).slice(0, 2).map((p) => p[0]!.toUpperCase()).join(''))
</script>

<template>
  <div v-if="prestador" class="mx-auto flex max-w-[1080px] flex-col gap-6 px-4 pb-16 pt-5 sm:gap-8 sm:px-6 sm:pb-[72px] sm:pt-8">
    <nav aria-label="Breadcrumb" class="text-sm text-ink-muted">
      <ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
        <li><NuxtLink to="/" class="hover:text-ink hover:underline">Início</NuxtLink></li>
        <li aria-hidden="true">›</li>
        <li><NuxtLink to="/prestadores" class="hover:text-ink hover:underline">Prestadores</NuxtLink></li>
        <li aria-hidden="true">›</li>
        <li class="truncate text-ink" aria-current="page">{{ prestador.nome }}</li>
      </ol>
    </nav>

    <header class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
      <img
        v-if="foto"
        :src="foto"
        :alt="`Foto de ${prestador.nome}`"
        width="112"
        height="112"
        loading="eager"
        fetchpriority="high"
        class="h-24 w-24 flex-none rounded-full border border-line bg-ground object-cover sm:h-28 sm:w-28"
      >
      <span v-else class="flex h-24 w-24 flex-none items-center justify-center rounded-full border border-line bg-ground text-3xl font-extrabold text-ink-muted sm:h-28 sm:w-28" aria-hidden="true">{{ iniciais }}</span>
      <div class="flex min-w-0 flex-col gap-1.5">
        <NuxtLink
          v-if="prestador.categoria_slug"
          :to="`/prestadores/categoria/${prestador.categoria_slug}`"
          class="self-start text-xs font-bold uppercase tracking-[0.1em] text-brand-ink hover:underline"
        >
          {{ prestador.categoria_nome }}<template v-if="prestador.subcategoria_nome"> · {{ prestador.subcategoria_nome }}</template>
        </NuxtLink>
        <p v-else-if="prestador.categoria_nome" class="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-ink">
          {{ prestador.categoria_nome }}<template v-if="prestador.subcategoria_nome"> · {{ prestador.subcategoria_nome }}</template>
        </p>
        <h1 class="m-0 flex flex-wrap items-center gap-x-2 text-balance text-[28px] font-extrabold leading-[34px] tracking-[-0.025em] text-ink sm:text-[40px] sm:leading-[46px]">
          {{ prestador.nome }}
          <DiretorioSeloVerificado v-if="prestador.verificado" class="[&_svg]:h-6 [&_svg]:w-6" />
        </h1>
        <p class="m-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-muted">
          <BaseNota v-if="prestador.total_avaliacoes > 0" :nota="Number(prestador.nota_media)" :total="prestador.total_avaliacoes" />
          <span v-else>Ainda sem avaliações</span>
          <span v-if="prestador.bairro_nome" class="inline-flex items-center gap-1">
            <Icon name="lucide:map-pin" class="h-4 w-4 text-brand-ink" aria-hidden="true" />{{ prestador.bairro_nome }}
          </span>
          <span v-if="prestador.destaque" class="rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand-deep">Destaque</span>
        </p>
      </div>
    </header>

    <!-- contato: o telefone só vem da RPC se o prestador permitiu
    (exibir_telefone/exibir_whatsapp), e cada botão segue a sua permissão -->
    <div v-if="prestador.telefone && (prestador.exibir_whatsapp || prestador.exibir_telefone)" class="flex flex-wrap gap-2">
      <a
        v-if="prestador.exibir_whatsapp"
        :href="linkWhatsappPrestador(prestador.telefone)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-[48px] flex-[1_1_100%] items-center justify-center gap-2 rounded-mbb-md bg-success-ink px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#145530] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none"
      >
        <Icon name="simple-icons:whatsapp" class="h-5 w-5" aria-hidden="true" />
        Chamar no WhatsApp<span class="sr-only"> (abre em nova aba)</span>
      </a>
      <BaseBotao v-if="prestador.exibir_telefone" :href="linkTelefonePrestador(prestador.telefone)" variante="contorno" class="flex-1 sm:flex-none">
        <Icon name="lucide:phone" class="h-[18px] w-[18px]" aria-hidden="true" />
        Ligar
      </BaseBotao>
    </div>
    <p v-else class="m-0 rounded-mbb-lg bg-ground p-4 text-[15px] text-ink">
      Contato disponível pelo Guia Buritis.
    </p>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <div class="flex min-w-0 flex-col gap-8">
        <section v-if="prestador.descricao_curta" aria-labelledby="sobre-titulo" class="flex flex-col gap-3">
          <h2 id="sobre-titulo" class="m-0 border-b border-line pb-3 text-xl font-extrabold tracking-[-0.015em] text-ink">Sobre</h2>
          <p class="m-0 text-[16px] leading-[26px] text-ink">{{ prestador.descricao_curta }}</p>
        </section>
      </div>

      <div class="flex flex-col gap-6">
        <DiretorioAppGuia :link="linkGuia" :nome="prestador.nome" />
        <DiretorioDono tipo="prestador" :link="linkGuia" />
      </div>
    </div>
  </div>
</template>
