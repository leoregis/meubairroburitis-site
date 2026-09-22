<script setup lang="ts">
import type { PrestadorListagemItem } from '~/composables/useEmpresasPrestadoresListagem'

defineProps<{ prestador: PrestadorListagemItem }>()
</script>

<template>
  <NuxtLink
    :to="`/prestadores/${prestador.slug}`"
    class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md sm:rounded-2xl"
  >
    <div class="flex h-32 items-center justify-center bg-stone-50 sm:h-40">
      <img
        v-if="prestador.foto_url"
        :src="prestador.foto_url"
        :alt="prestador.nome"
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <span v-else class="text-3xl">🙋</span>
    </div>
    <div class="flex flex-1 flex-col gap-1 p-3 sm:p-4">
      <p v-if="prestador.categoria_nome" class="text-xs font-semibold uppercase tracking-wide text-orange-700">
        {{ prestador.categoria_nome }}
      </p>
      <h3 class="font-serif text-sm font-bold text-stone-900 sm:text-base">
        {{ prestador.nome }}
        <span v-if="prestador.verificado" title="Verificado" class="text-emerald-600">✔</span>
      </h3>
      <p v-if="prestador.descricao_curta" class="line-clamp-2 text-xs text-stone-500">{{ prestador.descricao_curta }}</p>
      <p class="mt-auto pt-1 text-xs text-stone-500">
        <template v-if="prestador.total_avaliacoes > 0">
          ⭐ {{ Number(prestador.media_nota).toFixed(1) }} · {{ prestador.total_avaliacoes }} avaliaç{{ prestador.total_avaliacoes === 1 ? 'ão' : 'ões' }}
        </template>
        <template v-else>Sem avaliações ainda</template>
      </p>
    </div>
  </NuxtLink>
</template>
