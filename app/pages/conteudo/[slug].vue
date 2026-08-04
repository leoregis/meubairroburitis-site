<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: artigo } = await useConteudoArtigo(slug)

if (!artigo.value) {
  throw createError({ statusCode: 404, message: 'Conteúdo não encontrado' })
}

const tituloSeo = artigo.value.seo_meta_titulo || artigo.value.titulo
const descricaoSeo = artigo.value.seo_meta_descricao || artigo.value.subtitulo || undefined
const imagemAbsoluta = artigo.value.imagem_destaque_url
  ? `https://meubairroburitis.com.br${artigo.value.imagem_destaque_url}`
  : undefined
const imagemSeo = artigo.value.seo_imagem_og || imagemAbsoluta

useSeoMeta({
  title: () => `${tituloSeo} — Meu Bairro Buritis`,
  description: () => descricaoSeo,
  ogTitle: () => tituloSeo,
  ogDescription: () => descricaoSeo,
  ogImage: () => imagemSeo,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: () => tituloSeo,
  twitterDescription: () => descricaoSeo,
  twitterImage: () => imagemSeo,
  keywords: () => artigo.value?.seo_palavras_chave || undefined,
})

useJsonLd({
  '@type': 'BlogPosting',
  headline: artigo.value.titulo,
  description: descricaoSeo,
  image: imagemSeo ? [imagemSeo] : undefined,
  datePublished: artigo.value.data_publicacao ?? undefined,
  author: artigo.value.autor
    ? { '@type': 'Person', name: artigo.value.autor }
    : { '@type': 'Organization', name: 'Meu Bairro Buritis' },
})
</script>

<template>
  <div v-if="artigo" class="mx-auto max-w-2xl px-4 py-16">
    <NuxtLink to="/conteudo" class="text-sm text-stone-500 hover:text-orange-700">← Voltar pro conteúdo</NuxtLink>

    <p v-if="artigo.categoria" class="mt-6 text-xs font-semibold uppercase tracking-wide text-orange-700">
      {{ artigo.categoria }}
    </p>

    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">{{ artigo.titulo }}</h1>

    <p v-if="artigo.subtitulo" class="mt-3 text-lg text-stone-600">{{ artigo.subtitulo }}</p>

    <div class="mt-4 flex items-center gap-2 text-sm text-stone-400">
      <span v-if="artigo.autor">{{ artigo.autor }}</span>
      <span v-if="artigo.autor && artigo.data_publicacao">·</span>
      <span v-if="artigo.data_publicacao">{{ formatarDataNoticia(artigo.data_publicacao) }}</span>
    </div>

    <NuxtPicture
      v-if="artigo.imagem_destaque_url"
      :src="artigo.imagem_destaque_url"
      :alt="artigo.imagem_destaque_alt || artigo.titulo"
      format="avif,webp"
      :width="700"
      :height="367"
      loading="eager"
      :img-attrs="{ class: 'mt-6 w-full rounded-2xl object-cover' }"
    />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="conteudo-artigo mt-8" v-html="artigo.conteudo" />
  </div>
</template>

<style>
.conteudo-artigo h2 {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 1.5rem 0 0.5rem;
}

.conteudo-artigo h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 1.25rem 0 0.5rem;
}

.conteudo-artigo p {
  margin: 0.75rem 0;
  color: #44403c;
  line-height: 1.7;
}

.conteudo-artigo ul,
.conteudo-artigo ol {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.conteudo-artigo ul {
  list-style: disc;
}

.conteudo-artigo ol {
  list-style: decimal;
}

.conteudo-artigo blockquote {
  border-left: 3px solid #d6d3d1;
  padding-left: 1rem;
  color: #57534e;
  font-style: italic;
  margin: 1rem 0;
}

.conteudo-artigo a {
  color: #c2410c;
  text-decoration: underline;
}
</style>
