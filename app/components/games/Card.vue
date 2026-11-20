<script setup lang="ts">
import type { Game } from '~/composables/useGames'

// Card de /games (20/11/2026). Mostra só imagem 16:9, nome e descrição. O
// card inteiro é o link (publicado com link_url); "em breve" leva o selo e
// não é clicável. `previa`: usado no admin, onde não há IPX -- imagem
// original, sem srcset.
const props = withDefaults(defineProps<{
  game: Pick<Game, 'nome' | 'descricao' | 'imagem_url' | 'imagem_alt' | 'link_url' | 'status'>
  previa?: boolean
  prioridade?: boolean
}>(), { previa: false, prioridade: false })

const imagemGame = useImagemGame()
const imagem = computed(() => {
  if (!props.game.imagem_url) return null
  return props.previa ? { src: props.game.imagem_url, srcset: undefined } : imagemGame(props.game.imagem_url)
})
const link = computed(() => linkDoGame(props.game))
const externo = computed(() => (link.value ? linkExterno(link.value) : false))
const emBreve = computed(() => props.game.status === 'em_breve')
</script>

<template>
  <component
    :is="link ? 'a' : 'div'"
    :href="link || undefined"
    :target="link && externo ? '_blank' : undefined"
    :rel="link && externo ? 'noopener' : undefined"
    class="group flex h-full flex-col overflow-hidden rounded-mbb-xl border border-line bg-white"
    :class="link ? 'transition-colors hover:border-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink' : ''"
  >
    <div class="relative aspect-video w-full overflow-hidden bg-ink">
      <img
        v-if="imagem"
        :src="imagem.src"
        :srcset="imagem.srcset"
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
        :alt="game.imagem_alt || game.nome"
        width="1200"
        height="675"
        :loading="prioridade ? 'eager' : 'lazy'"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      >
      <!-- sem imagem: placeholder com o nome (decorativo; o nome está no h2) -->
      <div v-else class="flex h-full w-full flex-col justify-end gap-1.5 bg-gradient-to-br from-ink to-brand-deep p-5" aria-hidden="true">
        <span class="text-[11px] font-bold uppercase leading-[14px] tracking-[0.1em] text-brand-soft">MB Buritis Games</span>
        <span class="text-balance text-2xl font-extrabold leading-7 tracking-[-0.02em] text-white">{{ game.nome }}</span>
      </div>
      <span
        v-if="emBreve"
        class="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[12px] font-bold uppercase tracking-[0.06em] text-ink shadow-sm"
      >
        Em breve
      </span>
    </div>
    <div class="flex flex-1 flex-col gap-2 p-5">
      <h2 class="m-0 flex items-start gap-2 text-lg font-bold leading-6 tracking-[-0.01em] text-ink">
        <span class="flex-1" :class="link ? 'group-hover:underline' : ''">{{ game.nome }}</span>
        <Icon v-if="link && externo" name="lucide:arrow-up-right" class="mt-1 h-4 w-4 flex-none text-ink-muted" aria-hidden="true" />
      </h2>
      <p class="m-0 text-[15px] leading-[23px] text-ink-muted">{{ game.descricao }}</p>
      <span v-if="link && externo" class="sr-only">(abre em nova aba)</span>
    </div>
  </component>
</template>
