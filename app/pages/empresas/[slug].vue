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

// só marcado depois de montar no client -- SSR sempre renderiza "sem
// destaque" (determinístico), evita mismatch de hidratação entre o dia do
// build e o dia real de quem visita.
const diaAtual = ref<number | null>(null)
onMounted(() => { diaAtual.value = new Date().getDay() })

const descricaoTexto = computed(() => empresa.value?.descricao?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || undefined)

const canonicalUrl = computed(() => `https://meubairroburitis.com.br/empresas/${empresa.value?.slug}`)
const linkGuia = computed(() => `https://meubairroburitis.com.br/guia/empresa/${empresa.value?.slug}`)

// hero: imagem_hero -> primeira de imagens -> null (cai no fundo sólido com logo)
const imagemHero = computed(() => empresa.value?.imagem_hero || empresa.value?.imagens?.[0] || null)

const temLocalizacao = computed(() => Boolean(empresa.value?.latitude && empresa.value?.longitude))
const temLinksSecundarios = computed(() => Boolean(empresa.value?.website || empresa.value?.instagram || empresa.value?.ifood_url))

useSeoMeta({
  title: () => `${empresa.value?.nome} — ${empresa.value?.categoria_nome || 'Empresa'} — Meu Bairro Buritis`,
  description: () => descricaoTexto.value,
  ogTitle: () => empresa.value?.nome,
  ogDescription: () => descricaoTexto.value,
  ogImage: () => empresa.value?.imagem_hero || empresa.value?.logo_url || undefined,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => empresa.value?.nome,
  twitterDescription: () => descricaoTexto.value,
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
    { '@type': 'ListItem', position: 2, name: 'Empresas', item: 'https://meubairroburitis.com.br/empresas' },
    { '@type': 'ListItem', position: 3, name: empresa.value.nome, item: canonicalUrl.value },
  ],
})
</script>

<template>
  <div v-if="empresa">
    <!-- Hero -->
    <div class="relative z-0 h-56 w-full overflow-hidden bg-stone-800 sm:h-80">
      <NuxtPicture
        v-if="imagemHero"
        :src="imagemHero"
        :alt="empresa.nome"
        format="avif,webp"
        :width="1400"
        :height="500"
        fetchpriority="high"
        loading="eager"
        :img-attrs="{ class: 'absolute inset-0 h-full w-full object-cover' }"
        class="absolute inset-0 h-full w-full"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
        <img v-if="empresa.logo_url" :src="empresa.logo_url" :alt="empresa.nome" class="h-24 w-24 rounded-2xl object-cover shadow-lg sm:h-32 sm:w-32" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
    </div>

    <div class="mx-auto max-w-3xl px-4">
      <!-- Cabeçalho sobreposto ao hero -->
      <div class="relative z-10 -mt-12 flex items-end gap-4 sm:-mt-16">
        <img
          v-if="empresa.logo_url && imagemHero"
          :src="empresa.logo_url"
          :alt="empresa.nome"
          class="h-20 w-20 shrink-0 rounded-full border-4 border-white bg-white object-cover shadow-md sm:h-28 sm:w-28"
        />
      </div>

      <nav class="mt-4 flex flex-wrap items-center gap-1 text-sm text-stone-500" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-orange-700">Início</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink to="/empresas" class="hover:text-orange-700">Empresas</NuxtLink>
        <span aria-hidden="true">/</span>
        <span class="text-stone-700">{{ empresa.nome }}</span>
      </nav>

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <h1 class="text-balance font-serif text-3xl font-bold text-stone-900 sm:text-4xl">{{ empresa.nome }}</h1>
        <span
          v-if="empresa.funciona_24h || empresa.aberto_agora"
          class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
        >
          {{ empresa.funciona_24h ? 'Aberto 24 horas' : 'Aberto agora' }}
        </span>
        <span v-else class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          Fechado no momento
        </span>
      </div>

      <NuxtLink
        v-if="empresa.categoria_slug"
        :to="`/empresas/categoria/${empresa.categoria_slug}`"
        class="mt-2 inline-block text-sm font-semibold uppercase tracking-wide text-orange-700 hover:underline"
      >
        {{ empresa.categoria_nome }}<template v-if="empresa.subcategoria_nome"> · {{ empresa.subcategoria_nome }}</template>
      </NuxtLink>
      <p v-else-if="empresa.categoria_nome" class="mt-2 text-sm font-semibold uppercase tracking-wide text-orange-700">
        {{ empresa.categoria_nome }}<template v-if="empresa.subcategoria_nome"> · {{ empresa.subcategoria_nome }}</template>
      </p>

      <!-- Descrição -- antes do contato (a Fase 5 original punha contato
      primeiro; mudou por decisão do Leo: primeiro quem é, depois como falar). -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="empresa.descricao" class="prose prose-stone mt-8 max-w-none text-stone-600" v-html="empresa.descricao" />

      <!-- Contato -->
      <section class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 font-serif text-lg font-bold text-stone-900">Contato</h2>
        <!-- telefone/whatsapp de empresa sempre visíveis -- empresa não tem
        opt-in de contato (decisão da Fase 2). -->
        <div class="flex flex-wrap gap-3">
          <a
            v-if="empresa.whatsapp"
            :href="linkWhatsappEmpresa(empresa.whatsapp)"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#20bd5a]"
          >
            WhatsApp
          </a>
          <a
            v-if="empresa.telefone"
            :href="linkTelefoneEmpresa(empresa.telefone)"
            class="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            Ligar
          </a>
        </div>

        <div v-if="temLinksSecundarios" class="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4 text-sm">
          <!-- ícones (mesmo set lucide do rodapé) em vez de texto; o nome vai
          no aria-label/title pra leitor de tela e tooltip. 44px de área de toque. -->
          <a
            v-if="empresa.instagram"
            :href="`https://instagram.com/${empresa.instagram}`"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Instagram de ${empresa.nome}`"
            title="Instagram"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          >
            <Icon name="lucide:instagram" class="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            v-if="empresa.website"
            :href="empresa.website"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Site de ${empresa.nome}`"
            title="Site"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          >
            <Icon name="lucide:globe" class="h-5 w-5" aria-hidden="true" />
          </a>
          <a v-if="empresa.ifood_url" :href="empresa.ifood_url" target="_blank" rel="noopener noreferrer" class="font-medium text-orange-700 hover:underline">iFood</a>
        </div>
      </section>

      <!-- Galeria -->
      <section v-if="empresa.imagens.length" class="mt-8">
        <h2 class="mb-3 font-serif text-lg font-bold text-stone-900">Fotos</h2>
        <UiLightbox :imagens="empresa.imagens" :alt="empresa.nome" />
      </section>

      <!-- Horário -->
      <section v-if="empresa.horarios.length" class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 class="mb-3 font-serif text-lg font-bold text-stone-900">Horário de funcionamento</h2>
        <ul class="divide-y divide-stone-100 text-sm">
          <li
            v-for="h in empresa.horarios"
            :key="h.dia_semana"
            class="flex justify-between py-1.5"
            :class="h.dia_semana === diaAtual ? 'font-semibold text-orange-700' : 'text-stone-600'"
          >
            <span>{{ nomeDiaSemana(h.dia_semana) }}</span>
            <span v-if="h.fechado">Fechado</span>
            <span v-else>{{ formatarHora(h.hora_abertura) }} – {{ formatarHora(h.hora_fechamento) }}</span>
          </li>
        </ul>
      </section>

      <!-- Localização -->
      <section v-if="empresa.endereco || temLocalizacao" class="mt-8">
        <h2 class="mb-3 font-serif text-lg font-bold text-stone-900">Localização</h2>
        <p v-if="empresa.endereco" class="mb-3 text-sm text-stone-600">{{ empresa.endereco }}</p>
        <UiMapaEmbed v-if="temLocalizacao" :latitude="empresa.latitude!" :longitude="empresa.longitude!" :nome="empresa.nome" />
      </section>

      <!-- Avaliações -->
      <p class="mt-8 text-sm text-stone-500">
        <template v-if="empresa.total_avaliacoes > 0">
          ⭐ <span class="font-semibold text-stone-700">{{ empresa.nota_media.toFixed(1) }}</span> · {{ empresa.total_avaliacoes }} avaliaç{{ empresa.total_avaliacoes === 1 ? 'ão' : 'ões' }}
        </template>
        <template v-else>Ainda sem avaliações</template>
      </p>

      <p class="my-10 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">
        Veja mais detalhes, avaliações e outras empresas do bairro no
        <!-- /guia/ é o app separado (meubairro-app), fora do router deste
        site -- <a> comum, não NuxtLink (mesmo padrão de CtaGuiaBuritis.vue). -->
        <a :href="linkGuia" target="_blank" rel="noopener noreferrer" class="font-semibold text-orange-700 hover:underline">
          Guia Buritis
        </a>.
      </p>
    </div>
  </div>
</template>
