<script setup lang="ts">
import { linkTelefoneEmpresa, linkWhatsappEmpresa } from '~/utils/telefone'
import { nomeDiaSemana, formatarHora } from '~/composables/useEmpresasPrestadores'

const route = useRoute()
const slug = route.params.slug as string

const { data: empresa } = await useEmpresaPublica(slug)

if (!empresa.value) {
  throw createError({ statusCode: 404, message: 'Empresa não encontrada' })
}

const DIAS_SCHEMA_ORG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const descricaoTexto = computed(() => empresa.value?.descricao?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || undefined)

const canonicalUrl = computed(() => `https://meubairroburitis.com.br/empresas/${empresa.value?.slug}`)
const linkGuia = computed(() => `https://meubairroburitis.com.br/guia/empresa/${empresa.value?.slug}`)

const categoriaTexto = computed(() => {
  const e = empresa.value
  if (!e) return null
  if (e.categoria_nome && e.subcategoria_nome) return `${e.categoria_nome} · ${e.subcategoria_nome}`
  return e.categoria_nome || e.subcategoria_nome || null
})

useSeoMeta({
  title: () => `${empresa.value?.nome} — ${categoriaTexto.value || 'Empresa'} — Meu Bairro Buritis`,
  description: () => descricaoTexto.value,
  ogTitle: () => empresa.value?.nome,
  ogDescription: () => descricaoTexto.value,
  ogImage: () => empresa.value?.imagem_hero || empresa.value?.logo_url || undefined,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => empresa.value?.nome,
  twitterDescription: () => descricaoTexto.value,
  twitterImage: () => empresa.value?.imagem_hero || empresa.value?.logo_url || undefined,
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
  address: empresa.value.endereco
    ? { '@type': 'PostalAddress', streetAddress: empresa.value.endereco, addressCountry: 'BR' }
    : undefined,
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
    { '@type': 'ListItem', position: 2, name: 'Empresas', item: 'https://meubairroburitis.com.br/guia/empresas' },
    { '@type': 'ListItem', position: 3, name: empresa.value.nome, item: canonicalUrl.value },
  ],
})
</script>

<template>
  <div v-if="empresa" class="mx-auto max-w-2xl px-4 py-16">
    <nav class="flex flex-wrap items-center gap-1 text-sm text-stone-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-orange-700">Início</NuxtLink>
      <span aria-hidden="true">/</span>
      <a href="https://meubairroburitis.com.br/guia/empresas" target="_blank" rel="noopener noreferrer" class="hover:text-orange-700">Empresas</a>
      <span aria-hidden="true">/</span>
      <span class="text-stone-700">{{ empresa.nome }}</span>
    </nav>

    <h1 class="mt-4 font-serif text-3xl font-bold text-stone-900">{{ empresa.nome }}</h1>

    <p v-if="categoriaTexto" class="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
      {{ categoriaTexto }}
    </p>

    <NuxtPicture
      v-if="empresa.imagem_hero"
      :src="empresa.imagem_hero"
      :alt="empresa.nome"
      format="avif,webp"
      :width="700"
      :height="367"
      loading="eager"
      :img-attrs="{ class: 'mt-6 w-full rounded-2xl object-cover' }"
    />
    <img
      v-else-if="empresa.logo_url"
      :src="empresa.logo_url"
      :alt="empresa.nome"
      class="mt-6 h-32 w-32 rounded-2xl object-cover"
    />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="empresa.descricao" class="prose prose-stone mt-6 max-w-none text-stone-600" v-html="empresa.descricao" />

    <div class="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
      <!-- endereço já vem com o bairro embutido no texto livre (ex.: "...-
      Palmeiras, Belo Horizonte..."); a RPC não tem um campo de bairro
      separado pra empresa. -->
      <p v-if="empresa.endereco" class="text-sm text-stone-600">
        <strong class="text-stone-900">Endereço:</strong> {{ empresa.endereco }}
      </p>

      <p class="mt-2 text-sm">
        <span v-if="empresa.funciona_24h" class="font-semibold text-emerald-700">Aberto 24 horas</span>
        <span v-else-if="empresa.aberto_agora" class="font-semibold text-emerald-700">Aberto agora</span>
        <span v-else class="font-semibold text-stone-500">Fechado no momento</span>
      </p>

      <ul v-if="empresa.horarios.length" class="mt-3 space-y-0.5 text-sm text-stone-500">
        <li v-for="h in empresa.horarios" :key="h.dia_semana">
          {{ nomeDiaSemana(h.dia_semana) }}:
          <span v-if="h.fechado">fechado</span>
          <span v-else>{{ formatarHora(h.hora_abertura) }} – {{ formatarHora(h.hora_fechamento) }}</span>
        </li>
      </ul>

      <!-- telefone/whatsapp de empresa sempre visíveis -- empresa não tem
      opt-in de contato (decisão da Fase 2). -->
      <div class="mt-4 flex flex-wrap gap-3">
        <a
          v-if="empresa.whatsapp"
          :href="linkWhatsappEmpresa(empresa.whatsapp)"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a]"
        >
          WhatsApp
        </a>
        <a
          v-if="empresa.telefone"
          :href="linkTelefoneEmpresa(empresa.telefone)"
          class="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Ligar
        </a>
      </div>

      <div v-if="empresa.website || empresa.instagram || empresa.ifood_url" class="mt-4 flex flex-wrap gap-4 text-sm">
        <a v-if="empresa.website" :href="empresa.website" target="_blank" rel="noopener noreferrer" class="text-orange-700 hover:underline">Site</a>
        <a v-if="empresa.instagram" :href="`https://instagram.com/${empresa.instagram}`" target="_blank" rel="noopener noreferrer" class="text-orange-700 hover:underline">Instagram</a>
        <a v-if="empresa.ifood_url" :href="empresa.ifood_url" target="_blank" rel="noopener noreferrer" class="text-orange-700 hover:underline">iFood</a>
      </div>
    </div>

    <p class="mt-6 text-sm text-stone-500">
      <template v-if="empresa.total_avaliacoes > 0">
        ⭐ {{ empresa.nota_media.toFixed(1) }} · {{ empresa.total_avaliacoes }} avaliaç{{ empresa.total_avaliacoes === 1 ? 'ão' : 'ões' }}
      </template>
      <template v-else>
        Ainda sem avaliações
      </template>
    </p>

    <div v-if="empresa.imagens.length" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <img
        v-for="(url, i) in empresa.imagens"
        :key="i"
        :src="url"
        :alt="`${empresa.nome} — foto ${i + 1}`"
        class="aspect-square w-full rounded-xl object-cover"
        loading="lazy"
      />
    </div>

    <p class="mt-8 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
      Veja mais detalhes, avaliações e outras empresas do bairro no
      <!-- /guia/ é o app separado (meubairro-app), fora do router deste
      site -- <a> comum, não NuxtLink (mesmo padrão de CtaGuiaBuritis.vue). -->
      <a :href="linkGuia" target="_blank" rel="noopener noreferrer" class="font-semibold text-orange-700 hover:underline">
        Guia Buritis
      </a>.
    </p>
  </div>
</template>
