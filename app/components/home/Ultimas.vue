<script setup lang="ts">
// "Últimas do bairro" em grade de revista: manchete grande (a matéria mais
// recente que tem capa) e uma coluna com as três seguintes, separadas por
// linhas, fechada pelo atalho Melhores do Ano. Modo resumo do composable:
// o payload da home não leva o conteúdo inteiro das matérias.
import type { Noticia } from '~/composables/useNoticias'

const { data } = await useNoticiasPagina(1, { resumo: true })

const manchete = computed(() => (data.value?.itens ?? []).find((n) => n.imagem_destaque_url) ?? data.value?.itens?.[0])
const coluna = computed(() => (data.value?.itens ?? []).filter((n) => n.id !== manchete.value?.id).slice(0, 3))

// "Segurança · 26 de outubro" (manchete) / "Segurança · 26 out" (coluna),
// sempre no fuso de BH -- o build pode rodar em outro fuso
const DATA_LONGA = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })
const DATA_CURTA = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: 'America/Sao_Paulo' })
function rotulo(n: Noticia, longo = false) {
  const categoria = n.categoria_info?.rotulo || n.categoria || ''
  if (!n.data_publicacao) return categoria
  const data = (longo ? DATA_LONGA : DATA_CURTA).format(new Date(n.data_publicacao)).replace('.', '')
  return categoria ? `${categoria} · ${data}` : data
}

// capa pelo IPX no build (useCapaNoticia), 1200x630 como as outras capas
const gerarCapa = useCapaNoticia()
const capa = computed(() => gerarCapa(manchete.value?.imagem_destaque_url))
</script>

<template>
  <section v-if="manchete" aria-labelledby="ultimas-titulo" class="flex flex-col gap-4 sm:gap-6">
    <BaseSectionHeader id="ultimas-titulo" titulo="Últimas do bairro" link-to="/noticias" link-label="Ver todas as notícias" link-label-celular="Ver tudo" />

    <div class="flex flex-wrap gap-6 lg:gap-10">
      <article class="flex min-w-0 flex-[3_1_560px] flex-col gap-3 sm:gap-4">
        <NuxtLink :to="`/noticias/${manchete.slug}`" tabindex="-1" aria-hidden="true" class="block overflow-hidden rounded-[18px] bg-chip sm:rounded-mbb-xl">
          <img
            v-if="capa"
            :src="capa.src"
            :srcset="capa.srcset"
            sizes="(min-width: 1248px) 700px, (min-width: 1024px) 58vw, 100vw"
            :alt="manchete.imagem_destaque_alt || ''"
            width="1200"
            height="630"
            loading="lazy"
            decoding="async"
            class="aspect-[1200/630] h-auto w-full object-cover"
          >
        </NuxtLink>
        <BaseEyebrow class="!text-xs">{{ rotulo(manchete, true) }}</BaseEyebrow>
        <h3 class="m-0 text-balance text-[22px] font-extrabold leading-7 tracking-[-0.02em] sm:text-4xl sm:leading-[42px]">
          <NuxtLink :to="`/noticias/${manchete.slug}`" class="text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            {{ manchete.titulo }}
          </NuxtLink>
        </h3>
        <p v-if="manchete.subtitulo" class="m-0 max-w-[680px] text-[15px] leading-[23px] text-ink-muted sm:text-[17px] sm:leading-[27px]">
          {{ manchete.subtitulo }}
        </p>
      </article>

      <div class="flex min-w-0 flex-[2_1_340px] flex-col">
        <article
          v-for="(n, i) in coluna"
          :key="n.id"
          class="flex flex-col gap-2 border-b border-line py-4 sm:py-5"
          :class="i === 0 ? 'border-t sm:border-t-0 sm:pt-0' : ''"
        >
          <BaseEyebrow class="!text-xs">{{ rotulo(n) }}</BaseEyebrow>
          <h3 class="m-0 text-base font-bold leading-[21px] sm:text-xl sm:leading-[26px] sm:tracking-[-0.015em]">
            <NuxtLink :to="`/noticias/${n.slug}`" class="text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              {{ n.titulo }}
            </NuxtLink>
          </h3>
          <p v-if="n.subtitulo" class="m-0 hidden text-sm sm:line-clamp-2 leading-[21px] text-ink-muted">{{ n.subtitulo }}</p>
        </article>
        <HomeAtalhoMelhoresDoAno class="pt-2 sm:pt-3" />
      </div>
    </div>
  </section>
</template>
