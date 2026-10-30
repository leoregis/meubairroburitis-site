<script setup lang="ts">
// Linha da listagem de empresas/prestadores (redesign, fase 4): logo ou
// monograma, nome, categoria, uma linha de apoio (endereço da empresa ou
// descrição curta do prestador, como antes) e a nota com o número de
// avaliações. Só o que a listagem já mostrava -- nenhum dado novo.
const props = defineProps<{
  to: string
  nome: string
  imagem?: string | null
  categoria?: string | null
  subcategoria?: string | null
  apoio?: string | null
  verificado?: boolean
  nota?: number
  totalAvaliacoes?: number
  nivel?: 'h2' | 'h3'
}>()

const miniatura = computed(() => useFotoGuia()(props.imagem, MINIATURA_GUIA, MINIATURA_GUIA))
const iniciais = computed(() => props.nome.split(/\s+/).filter((p) => /\p{L}/u.test(p[0] ?? '')).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || props.nome.slice(0, 2).toUpperCase())
</script>

<template>
  <article class="min-w-0 border-b border-line">
    <NuxtLink :to="to" class="flex items-center gap-3.5 py-3.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink sm:gap-4 sm:py-4">
      <img
        v-if="miniatura"
        :src="miniatura"
        alt=""
        width="56"
        height="56"
        loading="lazy"
        decoding="async"
        class="h-14 w-14 flex-none rounded-mbb-lg border border-line bg-white object-cover"
      >
      <span v-else class="flex h-14 w-14 flex-none items-center justify-center rounded-mbb-lg border border-line bg-ground text-base font-extrabold text-ink-muted" aria-hidden="true">
        {{ iniciais }}
      </span>
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <component :is="nivel || 'h2'" class="m-0 flex items-center gap-1.5 text-[15px] font-bold leading-5 sm:text-base">
          <span class="truncate">{{ nome }}</span>
          <DiretorioSeloVerificado v-if="verificado" />
        </component>
        <span v-if="categoria" class="truncate text-xs font-semibold text-brand-ink sm:text-[13px]">
          {{ categoria }}<template v-if="subcategoria"> · {{ subcategoria }}</template>
        </span>
        <span v-if="apoio" class="line-clamp-1 text-xs text-ink-muted sm:text-[13px]">{{ apoio }}</span>
      </span>
      <span class="flex-none text-right">
        <BaseNota v-if="totalAvaliacoes && totalAvaliacoes > 0" :nota="Number(nota)" :total="totalAvaliacoes" />
        <span v-else class="block max-w-[84px] text-right text-xs leading-4 text-ink-muted">Sem avaliações ainda</span>
      </span>
    </NuxtLink>
  </article>
</template>
