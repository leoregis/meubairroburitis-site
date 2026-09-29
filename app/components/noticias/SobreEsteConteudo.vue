<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

const props = defineProps<{ noticia: Noticia }>()

const config = useRuntimeConfig()

// "Fontes consultadas" não é um campo próprio no banco -- é derivado dos
// links externos que já existem no corpo do artigo, pra nunca ficar
// dessincronizado do que o texto realmente cita (fonte única de verdade).
const fontes = computed(() => {
  const encontrados = [...props.noticia.conteudo.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi)]
  // link interno pra outra notícia é sempre um caminho relativo (/noticias/...)
  // -- só sobra como "fonte externa" o que aponta pra fora do próprio site.
  const externos = encontrados.filter(([, href]) => href.startsWith('http') && !href.includes('meubairroburitis.com.br'))
  const vistos = new Set<string>()
  return externos
    .filter(([, href]) => (vistos.has(href) ? false : (vistos.add(href), true)))
    .map(([, href, texto]) => ({ href, texto: texto.replace(/<[^>]+>/g, '') }))
})
</script>

<template>
  <div class="mt-10 border-t border-stone-200 pt-4 text-sm text-stone-500">
    <p>Publicado em {{ formatarDataNoticia(noticia.data_publicacao) }}</p>
    <p v-if="noticia.atualizado_em_editorial">Atualizado em {{ formatarDataNoticia(noticia.atualizado_em_editorial) }}</p>
    <p v-if="noticia.tipo_conteudo === 'guia' && noticia.ultima_verificacao">
      Última verificação: {{ formatarDataNoticia(noticia.ultima_verificacao) }}
    </p>
    <p v-if="noticia.autor">Por {{ noticia.autor }}</p>

    <div v-if="fontes.length" class="mt-2">
      Fontes consultadas:
      <template v-for="(fonte, i) in fontes" :key="fonte.href">
        <a :href="fonte.href" target="_blank" rel="noopener noreferrer" class="text-orange-700 hover:underline">{{ fonte.texto }}</a><span v-if="i < fontes.length - 1">, </span>
      </template>
    </div>

    <p v-if="noticia.tipo_conteudo === 'guia'" class="mt-2">
      Este guia reúne estabelecimentos e prestadores de serviço do Buritis e do Estoril com base em
      pesquisa própria e informações públicas. A inclusão não representa recomendação editorial nem
      indica parceria comercial, e a ordem de apresentação não é um ranking. Preços, horários e
      endereços podem mudar — confirme diretamente com o estabelecimento antes de ir.
    </p>

    <p class="mt-2">
      Encontrou uma informação desatualizada ou incorreta?
      <a
        :href="`https://wa.me/${config.public.whatsappNumero}`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-orange-700 underline hover:no-underline"
      >Avise a gente</a>.
    </p>
  </div>
</template>
