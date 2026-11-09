<script setup lang="ts">
import { linkTelefoneEmpresa, linkWhatsappEmpresa } from '~/utils/telefone'
import { formatarHora } from '~/composables/useEmpresasPrestadores'

const route = useRoute()
const slug = route.params.slug as string

const { data: empresa } = await useEmpresaPublica(slug)

if (!empresa.value) {
  throw createError({ statusCode: 404, message: 'Empresa não encontrada' })
}

const DIAS_SCHEMA_ORG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const descricaoTexto = computed(() => empresa.value?.descricao?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || undefined)

// Fase C do SEO (07/out): title/description por padrão fixo (ver
// utils/seoDiretorio.ts) -- a description da página não depende mais da
// descrição livre da empresa (46 empresas não tinham nenhuma). Filial
// (mais de uma unidade ativa com o mesmo nome) leva a unidade no title e no H1.
// Bairro: o do endereço do Google; sem ele, o escolhido no cadastro; sem
// nenhum, "em BH" (não presume Buritis).
const { data: contexto } = await useContextoUnidade(slug, () => empresa.value?.nome)
const ehFilial = computed(() => Boolean(contexto.value?.ehFilial))
const bairroCadastro = computed(() => contexto.value?.bairroCadastro ?? null)
const unidade = computed(() => (empresa.value ? unidadeDaEmpresa(empresa.value, ehFilial.value) : null))
const tituloSeo = computed(() => (empresa.value ? tituloEmpresa(empresa.value, ehFilial.value, bairroCadastro.value) : ''))
const descricaoSeo = computed(() => (empresa.value ? descricaoEmpresa(empresa.value, bairroCadastro.value) : undefined))

const canonicalUrl = computed(() => `https://meubairroburitis.com.br/empresas/${empresa.value?.slug}`)
const linkGuia = computed(() => `https://meubairroburitis.com.br/guia/empresa/${empresa.value?.slug}`)

// hero: imagem_hero -> primeira de imagens -> null (cai no fundo sólido com logo)
const imagemHero = computed(() => empresa.value?.imagem_hero || empresa.value?.imagens?.[0] || null)

const temLocalizacao = computed(() => Boolean(empresa.value?.latitude && empresa.value?.longitude))

useSeoMeta({
  title: () => tituloSeo.value,
  description: () => descricaoSeo.value,
  ogTitle: () => empresa.value?.nome,
  ogDescription: () => descricaoTexto.value || descricaoSeo.value,
  ogImage: () => empresa.value?.imagem_hero || empresa.value?.logo_url || undefined,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => empresa.value?.nome,
  twitterDescription: () => descricaoTexto.value || descricaoSeo.value,
  twitterImage: () => empresa.value?.imagem_hero || empresa.value?.logo_url || undefined,
}, {
  // puxa description/og:*/twitter:* pro topo do <head>, à frente dos ~110KB
  // de CSS inline -- scrapers de preview (WhatsApp/Facebook) leem só o
  // começo do HTML. Número e não 'critical': no capo sorting do Unhead
  // <meta> pesa 100 ('critical' só tira 8 -> 92) e o <style> inline do Nuxt
  // pesa 60, então só um peso explícito < 60 passa na frente do CSS. 15 =
  // logo depois do <title> (10).
  tagPriority: 15,
})

// LocalBusiness -- só com o que a RPC realmente devolve. Não infere um tipo
// mais específico (Restaurant/Store/etc.) sem dado que confirme a categoria
// com segurança.
useJsonLd({
  '@type': 'LocalBusiness',
  name: empresa.value.nome,
  description: descricaoTexto.value,
  image: empresa.value.imagem_hero || empresa.value.logo_url || undefined,
  url: canonicalUrl.value,
  telephone: empresa.value.telefone || undefined,
  // endereço separado (rua/cidade/UF/CEP) a partir do texto do Google
  address: enderecoSchemaEmpresa(empresa.value),
  geo: (empresa.value.latitude && empresa.value.longitude)
    ? { '@type': 'GeoCoordinates', latitude: empresa.value.latitude, longitude: empresa.value.longitude }
    : undefined,
  openingHoursSpecification: empresa.value.horarios.length
    ? empresa.value.horarios
        .filter((h) => !h.fechado)
        .map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: DIAS_SCHEMA_ORG[h.dia_semana],
          opens: formatarHora(h.hora_abertura),
          closes: formatarHora(h.hora_fechamento),
        }))
    : undefined,
  aggregateRating: empresa.value.total_avaliacoes > 0
    ? { '@type': 'AggregateRating', ratingValue: empresa.value.nota_media, reviewCount: empresa.value.total_avaliacoes }
    : undefined,
})

useJsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://meubairroburitis.com.br/' },
    { '@type': 'ListItem', position: 2, name: 'Empresas', item: 'https://meubairroburitis.com.br/empresas' },
    { '@type': 'ListItem', position: 3, name: empresa.value.nome, item: canonicalUrl.value },
  ],
})
// --- redesign (fase 4) ---------------------------------------------------
// Foto de destaque = 1ª da galeria (nenhuma empresa tem imagem_hero hoje),
// pelo IPX no build (useFotoGuia). É o LCP: preload + prioridade alta.
const fotoDestaque = computed(() => useFotoGuia()(imagemHero.value))
if (fotoDestaque.value) {
  useHead({ link: [{ rel: 'preload', as: 'image', href: fotoDestaque.value, fetchpriority: 'high', key: 'foto-empresa' }] })
}
const logo = computed(() => useFotoGuia()(empresa.value?.logo_url, MINIATURA_GUIA, MINIATURA_GUIA))
const iniciais = computed(() => (empresa.value?.nome ?? '').split(/\s+/).filter((p) => /\p{L}/u.test(p[0] ?? '')).slice(0, 2).map((p) => p[0]!.toUpperCase()).join(''))
const linkInstagram = computed(() => (empresa.value?.instagram ? `https://instagram.com/${empresa.value.instagram}` : null))
</script>

<template>
  <div v-if="empresa" class="mx-auto flex max-w-[1080px] flex-col gap-6 px-4 pb-16 pt-5 sm:gap-8 sm:px-6 sm:pb-[72px] sm:pt-8">
    <nav aria-label="Breadcrumb" class="text-sm text-ink-muted">
      <ol class="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
        <li><NuxtLink to="/" class="hover:text-ink hover:underline">Início</NuxtLink></li>
        <li aria-hidden="true">›</li>
        <li><NuxtLink to="/empresas" class="hover:text-ink hover:underline">Empresas</NuxtLink></li>
        <li aria-hidden="true">›</li>
        <li class="truncate text-ink" aria-current="page">{{ empresa.nome }}</li>
      </ol>
    </nav>

    <!-- foto de destaque (a 1ª da galeria), proporção fixa: sem salto de layout -->
    <div v-if="fotoDestaque" class="overflow-hidden rounded-[18px] bg-chip sm:rounded-mbb-xl">
      <img
        :src="fotoDestaque"
        :alt="`Foto de ${empresa.nome}`"
        width="960"
        height="540"
        loading="eager"
        fetchpriority="high"
        class="aspect-[16/9] h-auto w-full object-cover sm:aspect-[21/9]"
      >
    </div>

    <header class="flex items-start gap-4">
      <img
        v-if="logo"
        :src="logo"
        :alt="`Logo de ${empresa.nome}`"
        width="96"
        height="96"
        class="h-[72px] w-[72px] flex-none rounded-mbb-xl border border-line bg-white object-cover sm:h-24 sm:w-24"
      >
      <span v-else class="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-mbb-xl border border-line bg-ground text-2xl font-extrabold text-ink-muted sm:h-24 sm:w-24" aria-hidden="true">{{ iniciais }}</span>
      <div class="flex min-w-0 flex-col gap-1.5">
        <NuxtLink
          v-if="empresa.categoria_slug"
          :to="`/empresas/categoria/${empresa.categoria_slug}`"
          class="self-start text-xs font-bold uppercase tracking-[0.1em] text-brand-ink hover:underline"
        >
          {{ empresa.categoria_nome }}<template v-if="empresa.subcategoria_nome"> · {{ empresa.subcategoria_nome }}</template>
        </NuxtLink>
        <p v-else-if="empresa.categoria_nome" class="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-ink">
          {{ empresa.categoria_nome }}<template v-if="empresa.subcategoria_nome"> · {{ empresa.subcategoria_nome }}</template>
        </p>
        <h1 class="m-0 text-balance text-[28px] font-extrabold leading-[34px] tracking-[-0.025em] text-ink sm:text-[40px] sm:leading-[46px]">
          {{ empresa.nome }}<template v-if="unidade"><span class="sr-only"> – </span><span class="block text-lg font-semibold tracking-normal text-ink-muted sm:text-xl">Unidade {{ unidade }}</span></template>
        </h1>
        <p class="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          <BaseNota v-if="empresa.total_avaliacoes > 0" :nota="Number(empresa.nota_media)" :total="empresa.total_avaliacoes" />
          <span v-else>Ainda sem avaliações</span>
          <span v-if="empresa.funciona_24h" class="rounded-full bg-success-tint px-2.5 py-0.5 text-xs font-bold text-success-ink">Aberto 24 horas</span>
        </p>
      </div>
    </header>

    <!-- contato: só os botões que têm dado; telefone/WhatsApp de empresa são
    públicos (empresa não tem opt-in de contato, decisão da Fase 2) -->
    <div v-if="empresa.whatsapp || empresa.telefone || temLocalizacao || empresa.endereco || empresa.instagram || empresa.website || empresa.ifood_url" class="flex flex-wrap gap-2">
      <a
        v-if="empresa.whatsapp"
        :href="linkWhatsappEmpresa(empresa.whatsapp)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-[48px] flex-[1_1_100%] items-center justify-center gap-2 rounded-mbb-md bg-success-ink px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#145530] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none"
      >
        <Icon name="simple-icons:whatsapp" class="h-5 w-5" aria-hidden="true" />
        Chamar no WhatsApp<span class="sr-only"> (abre em nova aba)</span>
      </a>
      <BaseBotao v-if="empresa.telefone" :href="linkTelefoneEmpresa(empresa.telefone)" variante="contorno" class="flex-1 sm:flex-none">
        <Icon name="lucide:phone" class="h-[18px] w-[18px]" aria-hidden="true" />
        Ligar
      </BaseBotao>
      <BaseBotao
        v-if="temLocalizacao || empresa.endereco"
        :href="temLocalizacao ? `https://www.google.com/maps/dir/?api=1&destination=${empresa.latitude},${empresa.longitude}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(empresa.endereco ?? '')}`"
        variante="contorno"
        nova-aba
        class="flex-1 sm:flex-none"
      >
        <Icon name="lucide:navigation" class="h-[18px] w-[18px]" aria-hidden="true" />
        Rota
      </BaseBotao>
      <BaseBotao v-if="linkInstagram" :href="linkInstagram" variante="contorno" nova-aba class="flex-1 sm:flex-none">
        <Icon name="lucide:instagram" class="h-[18px] w-[18px]" aria-hidden="true" />
        Instagram
      </BaseBotao>
      <BaseBotao v-if="empresa.website" :href="empresa.website" variante="contorno" nova-aba class="flex-1 sm:flex-none">
        <Icon name="lucide:globe" class="h-[18px] w-[18px]" aria-hidden="true" />
        Site
      </BaseBotao>
      <BaseBotao v-if="empresa.ifood_url" :href="empresa.ifood_url" variante="contorno" nova-aba class="flex-1 sm:flex-none">
        <Icon name="lucide:shopping-bag" class="h-[18px] w-[18px]" aria-hidden="true" />
        iFood
      </BaseBotao>
    </div>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <div class="flex min-w-0 flex-col gap-8">
        <section v-if="empresa.descricao" aria-labelledby="sobre-titulo" class="flex flex-col gap-3">
          <h2 id="sobre-titulo" class="m-0 border-b border-line pb-3 text-xl font-extrabold tracking-[-0.015em] text-ink">Sobre</h2>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="prose max-w-none text-[16px] leading-[26px] text-ink prose-p:my-3 prose-a:text-brand-ink" v-html="empresa.descricao" />
        </section>

        <DiretorioHorario v-if="empresa.horarios.length" :horarios="empresa.horarios" :funciona24h="empresa.funciona_24h" />

        <DiretorioMapa :endereco="empresa.endereco" :latitude="empresa.latitude" :longitude="empresa.longitude" :nome="empresa.nome" />

        <!-- galeria depois do horário e do endereço: as fotos originais (100-330 KB)
        não disputam a banda com o topo da página no celular -->
        <section v-if="empresa.imagens.length" aria-labelledby="fotos-titulo" class="flex flex-col gap-3">
          <h2 id="fotos-titulo" class="m-0 border-b border-line pb-3 text-xl font-extrabold tracking-[-0.015em] text-ink">Fotos</h2>
          <UiLightbox :imagens="empresa.imagens" :alt="empresa.nome" />
        </section>
      </div>

      <div class="flex flex-col gap-6">
        <DiretorioAppGuia :link="linkGuia" :nome="empresa.nome" />
        <DiretorioDono tipo="empresa" :link="linkGuia" />
      </div>
    </div>
  </div>
</template>
