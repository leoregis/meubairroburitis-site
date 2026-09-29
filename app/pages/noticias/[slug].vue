<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: noticia } = await useNoticia(slug)

if (!noticia.value) {
  throw createError({ statusCode: 404, message: 'Notícia não encontrada' })
}

const tituloSeo = noticia.value.seo_meta_titulo || noticia.value.titulo
const descricaoSeo = noticia.value.seo_meta_descricao || noticia.value.subtitulo || undefined

// imagem_destaque_url tanto pode ser uma URL absoluta do Storage (upload
// via admin) quanto um caminho local relativo (arquivo estático em
// public/, caso das matérias com capa otimizada via NuxtPicture noutras
// seções) -- og:image precisa ser sempre absoluto pra funcionar em
// crawlers de rede social.
const imagemBruta = noticia.value.seo_imagem_og || noticia.value.imagem_destaque_url || undefined
const imagemEhLocal = imagemBruta?.startsWith('/') ?? false
const imagemSeo = imagemEhLocal
  ? `https://meubairroburitis.com.br${imagemBruta}`
  : imagemBruta

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
  keywords: () => noticia.value?.seo_palavras_chave || undefined,
})

// Schema.org correto por tipo de conteúdo -- Guia é referência evergreen,
// não notícia (NewsArticle era usado pra tudo antes, errado pra guias e
// opinião). "não_classificado" mantém NewsArticle até ter uma classificação
// definida -- não presumo qual seria.
const tipoJsonLd: Record<string, string> = {
  guia: 'Article',
  opiniao: 'OpinionNewsArticle',
  reportagem: 'NewsArticle',
  patrocinado: 'Article',
  nao_classificado: 'NewsArticle',
}

useJsonLd({
  '@type': tipoJsonLd[noticia.value.tipo_conteudo] ?? 'NewsArticle',
  headline: noticia.value.titulo,
  description: descricaoSeo,
  image: imagemSeo ? [imagemSeo] : undefined,
  datePublished: noticia.value.data_publicacao ?? undefined,
  author: noticia.value.autor
    ? { '@type': 'Person', name: noticia.value.autor }
    : undefined,
})
</script>

<template>
  <div v-if="noticia" class="mx-auto max-w-2xl px-4 py-16">
    <NuxtLink to="/noticias" class="text-sm text-stone-500 hover:text-orange-700">← Voltar pras notícias</NuxtLink>

    <NuxtLink
      v-if="noticia.categoria_info"
      :to="noticia.categoria_info.id === 'guias' ? '/conteudo' : `/noticias/categoria/${noticia.categoria_info.id}`"
      class="mt-6 block text-xs font-semibold uppercase tracking-wide text-orange-700 hover:underline"
    >
      {{ noticia.categoria_info.rotulo }}<template v-if="noticia.subcategoria_info"> · {{ noticia.subcategoria_info.rotulo }}</template>
    </NuxtLink>
    <p v-else-if="noticia.categoria" class="mt-6 text-xs font-semibold uppercase tracking-wide text-orange-700">
      {{ noticia.categoria }}
    </p>

    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">{{ noticia.titulo }}</h1>

    <p v-if="noticia.subtitulo" class="mt-3 text-lg text-stone-600">{{ noticia.subtitulo }}</p>

    <div class="mt-4 flex items-center gap-2 text-sm text-stone-500">
      <span v-if="noticia.autor">{{ noticia.autor }}</span>
      <span v-if="noticia.autor && noticia.data_publicacao">·</span>
      <span v-if="noticia.data_publicacao">{{ formatarDataNoticia(noticia.data_publicacao) }}</span>
    </div>

    <NuxtPicture
      v-if="noticia.imagem_destaque_url && imagemEhLocal"
      :src="noticia.imagem_destaque_url"
      :alt="noticia.imagem_destaque_alt || noticia.titulo"
      format="avif,webp"
      :width="700"
      :height="367"
      loading="eager"
      :img-attrs="{ class: 'mt-6 w-full rounded-2xl object-cover' }"
    />
    <!-- imagem de Storage (upload pelo admin) não tem dimensão conhecida em
    build-time -- sem espaço reservado, o texto abaixo saltava ~360px quando
    ela carregava (era a causa do CLS 0.12 do site). Proporção fixa 1200x630,
    a mesma do branch local acima e do og:image. -->
    <img
      v-else-if="noticia.imagem_destaque_url"
      :src="noticia.imagem_destaque_url"
      :alt="noticia.imagem_destaque_alt || noticia.titulo"
      width="1200"
      height="630"
      class="mt-6 aspect-[1200/630] w-full rounded-2xl object-cover"
    />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="noticia-conteudo mt-8" v-html="noticia.conteudo" />

    <NoticiasCtaGuiaBuritis :noticia="noticia" />
    <NoticiasSobreEsteConteudo :noticia="noticia" />
    <NoticiasLeiaTambem :noticia="noticia" />
  </div>
</template>

<style>
.noticia-conteudo h2 {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 1.5rem 0 0.5rem;
}

.noticia-conteudo h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 1.25rem 0 0.5rem;
}

.noticia-conteudo p {
  margin: 0.75rem 0;
  color: #44403c;
  line-height: 1.7;
}

.noticia-conteudo ul,
.noticia-conteudo ol {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.noticia-conteudo ul {
  list-style: disc;
}

.noticia-conteudo ol {
  list-style: decimal;
}

.noticia-conteudo blockquote {
  border-left: 3px solid #d6d3d1;
  padding-left: 1rem;
  color: #57534e;
  font-style: italic;
  margin: 1rem 0;
}

.noticia-conteudo a {
  color: #c2410c;
  text-decoration: underline;
}
</style>
