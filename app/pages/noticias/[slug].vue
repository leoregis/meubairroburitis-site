<script setup lang="ts">
import { DADOS_INSTITUCIONAIS, ORGANIZACAO_SCHEMA } from '~/constants/institucional'

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

// og:image/twitter:image leve: JPEG 1200x630 q75 gerado pelo IPX no build
// (useImage() já registra a URL pro prerender) -- as capas de Storage são
// PNG de 1.6-2.3MB, e o WhatsApp não mostra thumbnail de imagem pesada.
// Só pra imagem local ou do Storage liberado em image.domains; qualquer
// outra origem continua com a URL original (o IPX recusaria e o link
// ficaria quebrado).
const img = useImage()
const imagemOgProcessavel = imagemEhLocal || imagemBruta?.startsWith('https://peusailkyxqbhgdgmqyk.supabase.co/')
const imagemOg = imagemBruta && imagemOgProcessavel
  ? `https://meubairroburitis.com.br${img(imagemBruta, { width: 1200, height: 630, fit: 'cover', format: 'jpeg', quality: 75 })}`
  : imagemSeo

useSeoMeta({
  title: () => `${tituloSeo} — Meu Bairro Buritis`,
  description: () => descricaoSeo,
  ogTitle: () => tituloSeo,
  ogDescription: () => descricaoSeo,
  ogImage: () => imagemOg,
  // dimensão só pra capa local (sai 1200x630 de fato): o IPX não amplia, e
  // as capas quadradas de 1080px do Storage saem 1080x567 -- declarar
  // 1200x630 nelas seria mentir pros crawlers.
  ogImageWidth: () => (imagemOg !== imagemSeo && imagemEhLocal ? 1200 : undefined),
  ogImageHeight: () => (imagemOg !== imagemSeo && imagemEhLocal ? 630 : undefined),
  ogImageType: () => (imagemOg !== imagemSeo ? 'image/jpeg' : undefined),
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: () => tituloSeo,
  twitterDescription: () => descricaoSeo,
  twitterImage: () => imagemOg,
  keywords: () => noticia.value?.seo_palavras_chave || undefined,
}, {
  // puxa description/og:*/twitter:* pro topo do <head>, à frente dos ~110KB
  // de CSS inline -- scrapers de preview (WhatsApp/Facebook) leem só o
  // começo do HTML. Número e não 'critical': no capo sorting do Unhead
  // <meta> pesa 100 ('critical' só tira 8 -> 92) e o <style> inline do Nuxt
  // pesa 60, então só um peso explícito < 60 passa na frente do CSS. 15 =
  // logo depois do <title> (10).
  tagPriority: 15,
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

// Autor: o campo `autor` é texto livre. Quando ele é o próprio veículo
// ("Meu Bairro Buritis", padrão das matérias da redação), o autor é a
// Organization -- não uma pessoa. Matéria sem autor também é da redação
// (decisão de 05/10/2026). Qualquer outro nome continua Person.
function autorJsonLd(autor: string | null) {
  const nome = autor?.trim()
  if (!nome || nome.toLowerCase() === DADOS_INSTITUCIONAIS.nomeVeiculo.toLowerCase()) return ORGANIZACAO_SCHEMA
  return { '@type': 'Person', name: nome }
}

useJsonLd({
  '@type': tipoJsonLd[noticia.value.tipo_conteudo] ?? 'NewsArticle',
  headline: noticia.value.titulo,
  description: descricaoSeo,
  image: imagemSeo ? [imagemSeo] : undefined,
  datePublished: noticia.value.data_publicacao ?? undefined,
  author: autorJsonLd(noticia.value.autor),
  publisher: ORGANIZACAO_SCHEMA,
})
// --- redesign (fase 3) -------------------------------------------------
// h1 dentro do corpo (veio do WordPress em 42 matérias) vira h2: a página
// já tem o h1 do título (decisão 3 do plano). Só muda o HTML exibido; o
// título, a description e o JSON-LD continuam os mesmos.
const conteudo = computed(() => (noticia.value?.conteudo ?? '')
  .replace(/<h1(\s|>)/gi, '<h2$1')
  .replace(/<\/h1>/gi, '</h2>'))

// capa pelo IPX no build (3 larguras em WebP); é o LCP da matéria
const capa = useCapaNoticia()(noticia.value.imagem_destaque_url)
const TAMANHOS_CAPA = '(min-width: 928px) 880px, 100vw'
if (capa?.srcset) {
  useHead({
    link: [{ rel: 'preload', as: 'image', imagesrcset: capa.srcset, imagesizes: TAMANHOS_CAPA, fetchpriority: 'high', key: 'capa-materia' }],
  })
}
// crédito da foto (coluna opcional desde 29/10/2026, campo no admin):
// "Foto: <crédito>" só quando preenchido
const creditoFoto = computed(() => noticia.value?.imagem_destaque_credito?.trim() || '')

const linkCategoria = computed(() => {
  const id = noticia.value?.categoria_info?.id
  if (!id) return null
  return id === 'guias' ? '/conteudo' : `/noticias/categoria/${id}`
})
const ehDoVeiculo = (autor: string | null) => !autor?.trim() || autor.trim().toLowerCase() === DADOS_INSTITUCIONAIS.nomeVeiculo.toLowerCase()
</script>

<template>
  <div v-if="noticia">
    <article class="mx-auto flex max-w-[928px] flex-col gap-6 px-4 pb-12 pt-6 sm:gap-8 sm:px-6 sm:pt-10">
      <header class="mx-auto flex w-full max-w-[720px] flex-col gap-3 sm:gap-4">
        <p class="m-0 flex flex-wrap items-center gap-x-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-ink">
          <NuxtLink to="/noticias" class="hover:underline">Notícias</NuxtLink>
          <span aria-hidden="true" class="text-ink-muted">›</span>
          <NuxtLink v-if="linkCategoria && noticia.categoria_info" :to="linkCategoria" class="hover:underline">
            {{ noticia.categoria_info.rotulo }}<template v-if="noticia.subcategoria_info"> · {{ noticia.subcategoria_info.rotulo }}</template>
          </NuxtLink>
          <span v-else-if="noticia.categoria">{{ noticia.categoria }}</span>
        </p>
        <p v-if="noticia.tipo_conteudo === 'opiniao'" class="m-0 self-start rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white">Opinião</p>

        <h1 class="m-0 text-balance text-[28px] font-extrabold leading-[34px] tracking-[-0.025em] text-ink sm:text-[42px] sm:leading-[50px]">{{ noticia.titulo }}</h1>
        <p v-if="noticia.subtitulo" class="m-0 text-lg leading-[27px] text-ink-muted sm:text-[21px] sm:leading-[31px]">{{ noticia.subtitulo }}</p>

        <p class="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
          <span v-if="noticia.autor && !ehDoVeiculo(noticia.autor)">Por <strong class="font-bold text-ink">{{ noticia.autor }}</strong></span>
          <span v-else>Da redação do <strong class="font-bold text-ink">Meu Bairro Buritis</strong></span>
          <template v-if="noticia.data_publicacao">
            <span aria-hidden="true">·</span>
            <time :datetime="noticia.data_publicacao">{{ formatarDataNoticia(noticia.data_publicacao) }}</time>
          </template>
          <template v-if="noticia.atualizado_em_editorial">
            <span aria-hidden="true">·</span>
            <span>Atualizado em <time :datetime="noticia.atualizado_em_editorial">{{ formatarDataNoticia(noticia.atualizado_em_editorial) }}</time></span>
          </template>
        </p>

        <NoticiasCompartilhar :titulo="noticia.titulo" :caminho="`/noticias/${noticia.slug}`" class="pt-1" />

        <!-- antes da capa de propósito: logo abaixo de autor/data, o aviso já
        aparece sem rolar no celular (depois da capa ele caía abaixo da dobra) -->
        <NoticiasAvisoPublicitario v-if="noticia.tipo_conteudo === 'patrocinado'" />
      </header>

      <figure v-if="capa" class="m-0 flex flex-col gap-2">
        <!-- proporção 1200x630 fixa (a mesma do og:image): o espaço fica
        reservado e o texto não salta quando a imagem chega -->
        <img
          :src="capa.src"
          :srcset="capa.srcset"
          :sizes="TAMANHOS_CAPA"
          :alt="noticia.imagem_destaque_alt || noticia.titulo"
          width="1200"
          height="630"
          loading="eager"
          fetchpriority="high"
          class="aspect-[1200/630] h-auto w-full rounded-[18px] bg-chip object-cover sm:rounded-mbb-xl"
        >
        <figcaption v-if="creditoFoto" class="text-xs text-ink-muted">Foto: {{ creditoFoto }}</figcaption>
      </figure>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="noticia-conteudo mx-auto w-full max-w-[640px]" v-html="conteudo" />

      <div class="mx-auto flex w-full max-w-[640px] flex-col gap-6">
        <NoticiasCtaGuiaBuritis :noticia="noticia" />
        <NoticiasCompartilhar :titulo="noticia.titulo" :caminho="`/noticias/${noticia.slug}`" />
        <NoticiasSobreEsteConteudo :noticia="noticia" />
      </div>
    </article>

    <div class="mx-auto flex max-w-[1248px] flex-col gap-10 px-4 pb-16 sm:gap-16 sm:px-6 sm:pb-[72px]">
      <!-- abaixo da dobra: o HTML sai igual no build, mas o JS desses blocos só
      é baixado quando eles aparecem na tela (menos JS antes da 1ª pintura) -->
      <LazyNoticiasLeiaTambem :noticia="noticia" hydrate-on-visible />
      <LazyHomeCanais hydrate-on-visible />
    </div>
  </div>
</template>

<style>
/* Corpo da matéria (redesign, fase 3). Leitura confortável: 17px no
   celular e 18px no computador, entrelinha 1,7 e coluna de 640px (~70-74
   caracteres por linha). O HTML vem do editor/WordPress: tudo que pode
   estourar a largura (imagem, tabela, iframe, código, URL comprida) fica
   contido. Cores pelos tokens da marca (tailwind.config.ts). */
.noticia-conteudo {
  font-size: 17px;
  line-height: 1.7;
  color: theme('colors.ink.DEFAULT');
  overflow-wrap: break-word;
}
@media (min-width: 640px) {
  .noticia-conteudo { font-size: 18px; line-height: 1.72; }
}
.noticia-conteudo > :first-child { margin-top: 0; }
.noticia-conteudo p { margin: 0 0 1.15em; }
.noticia-conteudo h2 {
  font-size: 1.35em;
  line-height: 1.3;
  font-weight: 800;
  letter-spacing: -0.015em;
  margin: 1.8em 0 0.6em;
}
.noticia-conteudo h3 {
  font-size: 1.15em;
  line-height: 1.35;
  font-weight: 700;
  margin: 1.5em 0 0.5em;
}
.noticia-conteudo h4 { font-size: 1em; font-weight: 700; margin: 1.3em 0 0.4em; }
.noticia-conteudo strong, .noticia-conteudo b { font-weight: 700; }
.noticia-conteudo a {
  color: theme('colors.brand.ink');
  text-decoration: underline;
  text-underline-offset: 2px;
  overflow-wrap: anywhere;
}
.noticia-conteudo a:hover { color: theme('colors.brand.deep'); }
.noticia-conteudo ul, .noticia-conteudo ol { margin: 0 0 1.15em; padding-left: 1.4em; }
.noticia-conteudo ul { list-style: disc; }
.noticia-conteudo ol { list-style: decimal; }
.noticia-conteudo li { margin: 0.35em 0; padding-left: 0.2em; }
.noticia-conteudo li::marker { color: theme('colors.brand.ink'); }
.noticia-conteudo blockquote {
  margin: 1.5em 0;
  padding: 0.2em 0 0.2em 1em;
  border-left: 3px solid theme('colors.brand.DEFAULT');
  font-size: 1.08em;
  font-style: italic;
  color: theme('colors.ink.DEFAULT');
}
.noticia-conteudo img, .noticia-conteudo video {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5em auto;
  border-radius: 14px;
}
.noticia-conteudo figure { margin: 1.5em 0; }
.noticia-conteudo figure img { margin: 0; }
.noticia-conteudo figcaption { margin-top: 0.5em; font-size: 0.8em; color: theme('colors.ink.muted'); }
.noticia-conteudo iframe, .noticia-conteudo embed, .noticia-conteudo object {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 1.5em 0;
  border: 0;
}
.noticia-conteudo iframe[src*="youtube"], .noticia-conteudo iframe[src*="vimeo"] { aspect-ratio: 16 / 9; height: auto; }
.noticia-conteudo table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  margin: 1.5em 0;
  border-collapse: collapse;
  font-size: 0.9em;
}
.noticia-conteudo th, .noticia-conteudo td { border: 1px solid theme('colors.line'); padding: 0.5em 0.75em; text-align: left; vertical-align: top; }
.noticia-conteudo th { background: theme('colors.ground'); font-weight: 700; }
.noticia-conteudo pre { max-width: 100%; overflow-x: auto; padding: 1em; border-radius: 14px; background: theme('colors.ground'); font-size: 0.85em; }
.noticia-conteudo hr { margin: 2em 0; border: 0; border-top: 1px solid theme('colors.line'); }
</style>
