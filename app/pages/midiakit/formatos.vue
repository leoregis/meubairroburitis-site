<script setup lang="ts">
useSeoMeta({
  title: 'Formatos de anúncio — Midiakit Meu Bairro Buritis',
  description: 'Conheça os formatos de anúncio do Meu Bairro Buritis: produção de vídeo Reels, Conteúdo Publicitário Especial, Stories, Colab Instagram e os pacotes mensais MBB Basic e Premium.',
})
</script>

<template>
  <div class="mx-auto flex max-w-[960px] flex-col gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-[72px] sm:pt-10">
    <MidiakitCabecalho titulo="Formatos de anúncio" />

    <p class="m-0 flex gap-3 rounded-mbb-lg border border-line bg-ground p-4 text-sm leading-[22px] text-ink sm:p-5 sm:text-[15px]">
      <Icon name="lucide:info" class="mt-0.5 h-5 w-5 flex-none text-brand-ink" aria-hidden="true" />
      <span>
        <strong class="font-bold">Importante:</strong> nos Stories, no Colab e nos pacotes mensais, vendemos o espaço para o anúncio, como
        fazem todos os veículos de comunicação. Nesses formatos não criamos arte, texto nem estratégias
        pra sua campanha, nem garantimos resultado — o conteúdo deve ser enviado pronto. Na Produção de
        Vídeo e no Conteúdo Publicitário Especial, a produção é feita pela nossa equipe.
      </span>
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <section class="flex flex-col gap-2 rounded-mbb-xl border border-line bg-white p-5 sm:p-6">
        <h2 class="m-0 text-xl font-extrabold leading-7 tracking-[-0.015em] text-ink sm:text-2xl">Produção de vídeo Reels</h2>
        <p class="m-0 text-base leading-[26px] text-ink-muted sm:text-[17px] sm:leading-[28px]">
          Produção própria de vídeo, de até 60 segundos, com direito a 1 post no Reels do Instagram,
          no TikTok e nos grupos do Facebook, WhatsApp e Telegram. Inclui apresentadora e captação
          profissional. Prazo de entrega: 7 dias após a gravação.
        </p>
      </section>

      <section class="flex flex-col gap-2 rounded-mbb-xl border border-line bg-white p-5 sm:p-6">
        <h2 class="m-0 text-xl font-extrabold leading-7 tracking-[-0.015em] text-ink sm:text-2xl">Conteúdo Publicitário Especial</h2>
        <p class="m-0 text-base leading-[26px] text-ink-muted sm:text-[17px] sm:leading-[28px]">
          Matéria sobre a sua empresa produzida pela nossa equipe, a partir das informações que você
          nos passa, e publicada no nosso site e no feed do Instagram. O conteúdo é identificado
          claramente como conteúdo publicitário.
        </p>
      </section>

      <section class="flex flex-col gap-2 rounded-mbb-xl border border-line bg-white p-5 sm:p-6">
        <h2 class="m-0 text-xl font-extrabold leading-7 tracking-[-0.015em] text-ink sm:text-2xl">Anúncio no Stories</h2>
        <p class="m-0 text-base leading-[26px] text-ink-muted sm:text-[17px] sm:leading-[28px]">
          Espaço para publicação do seu anúncio no Stories do nosso Instagram, na data e horário
          definidos por você.
        </p>
      </section>

      <section class="flex flex-col gap-2 rounded-mbb-xl border border-line bg-white p-5 sm:p-6">
        <h2 class="m-0 text-xl font-extrabold leading-7 tracking-[-0.015em] text-ink sm:text-2xl">Colab Instagram</h2>
        <p class="m-0 text-base leading-[26px] text-ink-muted sm:text-[17px] sm:leading-[28px]">
          Você posta o vídeo no seu perfil e marca @meubairroburitis em colab — seu vídeo também é
          exibido para os nossos seguidores.
        </p>
      </section>

      <section class="flex flex-col gap-3 rounded-mbb-xl border border-line bg-white p-5 sm:col-span-2 sm:p-6">
        <h2 class="m-0 text-xl font-extrabold leading-7 tracking-[-0.015em] text-ink sm:text-2xl">Pacotes mensais</h2>
        <p class="m-0 text-base leading-[26px] text-ink-muted sm:text-[17px] sm:leading-[28px]">Para quem quer aparecer com frequência no bairro. O conteúdo é enviado por você, pronto para publicar.</p>
        <ul class="m-0 flex list-none flex-col gap-2.5 p-0 text-base leading-[26px] text-ink">
          <li class="flex gap-2.5">
            <Icon name="lucide:check" class="mt-1 h-[18px] w-[18px] flex-none text-brand-ink" aria-hidden="true" />
            <span><strong>MBB Basic</strong> — 5 aparições por mês: 4 Stories no nosso Instagram, 1 por semana, e 1 Colab.</span>
          </li>
          <li class="flex gap-2.5">
            <Icon name="lucide:check" class="mt-1 h-[18px] w-[18px] flex-none text-brand-ink" aria-hidden="true" />
            <span><strong>MBB Premium</strong> — 10 aparições por mês: 8 Stories no nosso Instagram, 2 por semana, e 2 Colabs, 1 a cada 15 dias.</span>
          </li>
        </ul>
      </section>
    </div>

    <BaseBotao to="/loja" variante="primario" class="self-start">Ver pacotes disponíveis na vitrine</BaseBotao>
  </div>
</template>
