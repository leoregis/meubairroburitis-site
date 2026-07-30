<script setup lang="ts">
useSeoMeta({
  title: 'Formatos de anúncio — Midiakit Meu Bairro Buritis',
  description: 'Conheça os formatos de anúncio do Meu Bairro Buritis: produção de vídeo Reels, Stories, Colab Instagram e mais.',
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-16">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Midiakit</p>
    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">Formatos de anúncio</h1>

    <div class="mt-8">
      <MidiakitTabs />
    </div>

    <p class="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
      Importante: alguns destes formatos tratam-se de concessão de espaço para o anúncio, como
      fazem todos os veículos de comunicação. Não criamos arte, texto nem estratégias pra sua
      campanha, nem garantimos resultado — o conteúdo deve ser enviado pronto.
    </p>

    <div class="prose prose-stone mt-8 max-w-none">
      <h2>Produção de vídeo Reels</h2>
      <p>
        Produção própria de vídeo, de até 60 segundos, com direito a 1 post no Reels do Instagram,
        TikTok, Twitter e nos grupos do Facebook e Telegram. Inclui apresentadora e captação
        profissional. Prazo de entrega: 7 dias após a gravação.
      </p>

      <h2>Anúncio no Stories</h2>
      <p>
        Espaço para publicação do seu anúncio no Stories do nosso Instagram, na data e horário
        definidos por você.
      </p>

      <h2>Colab Instagram</h2>
      <p>
        Você posta o vídeo no seu perfil e marca @meubairroburitis em colab — seu vídeo também é
        exibido para os nossos seguidores.
      </p>
    </div>

    <NuxtLink to="/loja" class="mt-10 inline-block rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700">
      Ver pacotes disponíveis na vitrine
    </NuxtLink>
  </div>
</template>
