<script setup lang="ts">
// Bloco vermelho do app (o único da página), levando ao perfil
// correspondente no Guia Buritis -- lá a pessoa avalia, conversa e favorita.
// /guia/ é outro app: <a> comum, nunca NuxtLink.
defineProps<{ link: string; nome: string }>()

const GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=br.com.meubairroburitis.twa'
</script>

<template>
  <section aria-labelledby="app-guia-titulo" class="flex flex-col gap-3.5 rounded-mbb-xl bg-brand p-5 text-white sm:p-7">
    <span class="flex h-12 w-12 items-center justify-center rounded-mbb-lg bg-white/[0.16]" aria-hidden="true">
      <Icon name="lucide:smartphone" class="h-6 w-6" />
    </span>
    <h2 id="app-guia-titulo" class="m-0 text-balance text-xl font-extrabold leading-[26px] tracking-[-0.015em] sm:text-2xl sm:leading-[30px]">
      Avalie, converse e favorite {{ nome }} no app Guia Buritis
    </h2>
    <ul class="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-5">
      <li class="flex gap-2"><Icon name="lucide:star" class="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />Deixe sua avaliação para os vizinhos</li>
      <li class="flex gap-2"><Icon name="lucide:message-circle" class="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />Converse direto pelo app</li>
      <li class="flex gap-2"><Icon name="lucide:heart" class="mt-0.5 h-[18px] w-[18px] flex-none" aria-hidden="true" />Guarde nos seus favoritos</li>
    </ul>
    <div class="flex flex-wrap gap-2 pt-1">
      <BaseBotao :href="link" variante="claro" class="flex-1 sm:flex-none">Abrir no Guia Buritis</BaseBotao>
      <BaseBotao :href="GOOGLE_PLAY" variante="contorno-claro" nova-aba class="flex-1 sm:flex-none">Baixar na Google Play</BaseBotao>
    </div>
  </section>
</template>
