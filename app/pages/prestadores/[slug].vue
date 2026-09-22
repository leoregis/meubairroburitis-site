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

useSeoMeta({
  title: () => `${prestador.value?.nome} — ${prestador.value?.categoria_nome || 'Prestador de serviço'} — Meu Bairro Buritis`,
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
</script>

<template>
  <div v-if="prestador" class="mx-auto max-w-2xl px-4 py-16">
    <nav class="flex flex-wrap items-center gap-1 text-sm text-stone-500" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-orange-700">Início</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/prestadores" class="hover:text-orange-700">Prestadores</NuxtLink>
      <span aria-hidden="true">/</span>
      <span class="text-stone-700">{{ prestador.nome }}</span>
    </nav>

    <div class="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:flex-row sm:items-start sm:text-left">
      <NuxtPicture
        v-if="prestador.foto_url"
        :src="prestador.foto_url"
        :alt="prestador.nome"
        format="avif,webp"
        :width="200"
        :height="200"
        loading="eager"
        :img-attrs="{ class: 'h-28 w-28 shrink-0 rounded-full object-cover shadow-sm' }"
      />
      <div v-else class="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-stone-100 text-4xl">🙋</div>

      <div>
        <h1 class="text-balance font-serif text-3xl font-bold text-stone-900">
          {{ prestador.nome }}
          <span v-if="prestador.verificado" title="Verificado" class="ml-1 align-middle text-lg text-emerald-600">✔</span>
          <span v-if="prestador.destaque" class="ml-2 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 align-middle text-xs font-semibold text-orange-700">Destaque</span>
        </h1>

        <NuxtLink
          v-if="prestador.categoria_slug"
          :to="`/prestadores/categoria/${prestador.categoria_slug}`"
          class="mt-2 inline-block text-sm font-semibold uppercase tracking-wide text-orange-700 hover:underline"
        >
          {{ prestador.categoria_nome }}<template v-if="prestador.subcategoria_nome"> · {{ prestador.subcategoria_nome }}</template>
        </NuxtLink>
        <p v-else-if="prestador.categoria_nome" class="mt-2 text-sm font-semibold uppercase tracking-wide text-orange-700">
          {{ prestador.categoria_nome }}<template v-if="prestador.subcategoria_nome"> · {{ prestador.subcategoria_nome }}</template>
        </p>

        <p v-if="prestador.bairro_nome" class="mt-1 text-sm text-stone-500">📍 {{ prestador.bairro_nome }}</p>
      </div>
    </div>

    <p v-if="prestador.descricao_curta" class="mt-8 text-stone-600">{{ prestador.descricao_curta }}</p>

    <section class="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 font-serif text-lg font-bold text-stone-900">Contato</h2>
      <div v-if="prestador.telefone" class="flex flex-wrap gap-3">
        <a
          v-if="prestador.exibir_whatsapp"
          :href="linkWhatsappPrestador(prestador.telefone)"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#20bd5a]"
        >
          WhatsApp
        </a>
        <a
          v-if="prestador.exibir_telefone"
          :href="linkTelefonePrestador(prestador.telefone)"
          class="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Ligar
        </a>
      </div>
      <p v-else class="text-sm text-stone-500">
        Contato disponível pelo Guia Buritis.
      </p>
    </section>

    <p class="mt-8 text-sm text-stone-500">
      <template v-if="prestador.total_avaliacoes > 0">
        ⭐ <span class="font-semibold text-stone-700">{{ prestador.nota_media.toFixed(1) }}</span> · {{ prestador.total_avaliacoes }} avaliaç{{ prestador.total_avaliacoes === 1 ? 'ão' : 'ões' }}
      </template>
      <template v-else>Ainda sem avaliações</template>
    </p>

    <p class="my-10 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">
      Veja avaliações completas e fale direto com {{ prestador.nome }} pelo
      <!-- /guia/ é o app separado (meubairro-app), fora do router deste
      site -- <a> comum, não NuxtLink (mesmo padrão de CtaGuiaBuritis.vue). -->
      <a :href="linkGuia" target="_blank" rel="noopener noreferrer" class="font-semibold text-orange-700 hover:underline">
        Guia Buritis
      </a>.
    </p>
  </div>
</template>
