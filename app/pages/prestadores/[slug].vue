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

const categoriaTexto = computed(() => {
  const p = prestador.value
  if (!p) return null
  if (p.categoria_nome && p.subcategoria_nome) return `${p.categoria_nome} · ${p.subcategoria_nome}`
  return p.categoria_nome || p.subcategoria_nome || null
})

useSeoMeta({
  title: () => `${prestador.value?.nome} — ${categoriaTexto.value || 'Prestador de serviço'} — Meu Bairro Buritis`,
  description: () => prestador.value?.descricao_curta || undefined,
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
  jobTitle: categoriaTexto.value || undefined,
  telephone: prestador.value.telefone || undefined,
  address: prestador.value.bairro_nome
    ? { '@type': 'PostalAddress', addressLocality: prestador.value.bairro_nome, addressRegion: 'MG', addressCountry: 'BR' }
    : undefined,
})

useJsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://meubairroburitis.com.br/' },
    { '@type': 'ListItem', position: 2, name: 'Prestadores', item: 'https://meubairroburitis.com.br/guia/profissionais' },
    { '@type': 'ListItem', position: 3, name: prestador.value.nome, item: canonicalUrl.value },
  ],
})
</script>

<template>
  <div v-if="prestador" class="mx-auto max-w-2xl px-4 py-16">
    <nav class="flex flex-wrap items-center gap-1 text-sm text-stone-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-orange-700">Início</NuxtLink>
      <span aria-hidden="true">/</span>
      <a href="https://meubairroburitis.com.br/guia/profissionais" target="_blank" rel="noopener noreferrer" class="hover:text-orange-700">Prestadores</a>
      <span aria-hidden="true">/</span>
      <span class="text-stone-700">{{ prestador.nome }}</span>
    </nav>

    <h1 class="mt-4 font-serif text-3xl font-bold text-stone-900">
      {{ prestador.nome }}
      <span v-if="prestador.verificado" title="Verificado" class="ml-1 text-base text-emerald-600">✔</span>
    </h1>

    <p v-if="categoriaTexto" class="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
      {{ categoriaTexto }}
    </p>

    <NuxtPicture
      v-if="prestador.foto_url"
      :src="prestador.foto_url"
      :alt="prestador.nome"
      format="avif,webp"
      :width="200"
      :height="200"
      loading="eager"
      :img-attrs="{ class: 'mt-6 h-32 w-32 rounded-full object-cover' }"
    />

    <p v-if="prestador.descricao_curta" class="mt-6 text-stone-600">{{ prestador.descricao_curta }}</p>

    <p v-if="prestador.bairro_nome" class="mt-3 text-sm text-stone-500">
      <strong class="text-stone-900">Bairro:</strong> {{ prestador.bairro_nome }}
    </p>

    <div class="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
      <div v-if="prestador.telefone" class="flex flex-wrap gap-3">
        <a
          v-if="prestador.exibir_whatsapp"
          :href="linkWhatsappPrestador(prestador.telefone)"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-[#25D366] px-5 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a]"
        >
          WhatsApp
        </a>
        <a
          v-if="prestador.exibir_telefone"
          :href="linkTelefonePrestador(prestador.telefone)"
          class="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Ligar
        </a>
      </div>
      <p v-else class="text-sm text-stone-500">
        Contato disponível pelo Guia Buritis.
      </p>
    </div>

    <p class="mt-6 text-sm text-stone-500">
      <template v-if="prestador.total_avaliacoes > 0">
        ⭐ {{ prestador.nota_media.toFixed(1) }} · {{ prestador.total_avaliacoes }} avaliaç{{ prestador.total_avaliacoes === 1 ? 'ão' : 'ões' }}
      </template>
      <template v-else>
        Ainda sem avaliações
      </template>
    </p>

    <p class="mt-8 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
      Veja avaliações completas e fale direto com {{ prestador.nome }} pelo
      <!-- /guia/ é o app separado (meubairro-app), fora do router deste
      site -- <a> comum, não NuxtLink (mesmo padrão de CtaGuiaBuritis.vue). -->
      <a :href="linkGuia" target="_blank" rel="noopener noreferrer" class="font-semibold text-orange-700 hover:underline">
        Guia Buritis
      </a>.
    </p>
  </div>
</template>
