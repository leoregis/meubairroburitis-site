<script setup lang="ts">
import type { EmpresaListagemItem } from '~/composables/useEmpresasPrestadoresListagem'

defineProps<{ empresa: EmpresaListagemItem }>()
</script>

<template>
  <NuxtLink
    :to="`/empresas/${empresa.slug}`"
    class="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md sm:rounded-2xl"
  >
    <div class="flex h-32 items-center justify-center bg-stone-50 sm:h-40">
      <img
        v-if="empresa.logo_url"
        :src="empresa.logo_url"
        :alt="empresa.nome"
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <span v-else class="text-3xl">🏪</span>
    </div>
    <div class="flex flex-1 flex-col gap-1 p-3 sm:p-4">
      <p v-if="empresa.categoria_nome" class="text-xs font-semibold uppercase tracking-wide text-orange-700">
        {{ empresa.categoria_nome }}
      </p>
      <h3 class="font-serif text-sm font-bold text-stone-900 sm:text-base">{{ empresa.nome }}</h3>
      <p v-if="empresa.endereco" class="line-clamp-1 text-xs text-stone-500">{{ empresa.endereco }}</p>
      <p class="mt-auto pt-1 text-xs text-stone-500">
        <template v-if="empresa.total_avaliacoes > 0">
          ⭐ {{ Number(empresa.nota_media).toFixed(1) }} · {{ empresa.total_avaliacoes }} avaliaç{{ empresa.total_avaliacoes === 1 ? 'ão' : 'ões' }}
        </template>
        <template v-else>Sem avaliações ainda</template>
      </p>
    </div>
  </NuxtLink>
</template>
