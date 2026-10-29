<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const ehNaoEncontrado = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => `${ehNaoEncontrado.value ? 'Página não encontrada' : 'Erro'} — Meu Bairro Buritis`,
  robots: 'noindex',
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-ink">
    <LayoutTopBar />
    <LayoutHeader />

    <main class="flex flex-1 items-center justify-center px-4 py-16">
      <div class="mx-auto max-w-lg text-center">
        <BaseEyebrow>Erro {{ error?.statusCode }}</BaseEyebrow>

        <h1 class="mt-2 text-balance text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
          <template v-if="ehNaoEncontrado">Página não encontrada</template>
          <template v-else>Algo deu errado</template>
        </h1>

        <p class="mt-4 text-ink-muted">
          <template v-if="ehNaoEncontrado">
            O endereço que você tentou acessar não existe ou o cadastro pode ter sido removido. Se
            era um link salvo de algum tempo atrás, é bem possível que a empresa ou o prestador
            tenha mudado de página.
          </template>
          <template v-else>
            Não conseguimos carregar essa página agora. Tenta de novo em alguns instantes.
          </template>
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <BaseBotao to="/">Voltar para o início</BaseBotao>
          <BaseBotao to="/empresas" variante="contorno">Ver empresas</BaseBotao>
          <BaseBotao to="/prestadores" variante="contorno">Ver prestadores</BaseBotao>
        </div>
      </div>
    </main>

    <LayoutFooter />
    <LayoutWhatsappFloat />
  </div>
</template>
