<script setup lang="ts">
// "Prefere conversar?" -- fecho da página Anuncie e do produto, com o
// WhatsApp da loja (verde oficial do WhatsApp no botão).
withDefaults(defineProps<{ mensagem?: string }>(), {
  mensagem: 'Olá! Quero anunciar no Meu Bairro Buritis e gostaria de ajuda para escolher o formato.',
})
const config = useRuntimeConfig()
</script>

<template>
  <section aria-labelledby="conversar-titulo" class="flex flex-wrap items-center justify-between gap-5 rounded-mbb-xl bg-ink px-5 py-6 text-white sm:px-9 sm:py-8">
    <div class="flex flex-[1_1_420px] flex-col gap-1.5">
      <h2 id="conversar-titulo" class="m-0 text-[22px] font-extrabold leading-7 tracking-[-0.02em] sm:text-[28px] sm:leading-9">Prefere conversar antes?</h2>
      <p class="m-0 text-[15px] leading-[23px] text-white/80">
        Fale com a gente pelo WhatsApp e monte o formato certo para o seu negócio.
      </p>
    </div>
    <a
      :href="`https://wa.me/${config.public.whatsappNumero}?text=${encodeURIComponent(mensagem)}`"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-mbb-md bg-success-ink px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#145530] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
    >
      <Icon name="simple-icons:whatsapp" class="h-5 w-5" aria-hidden="true" />
      Falar no WhatsApp
      <span class="sr-only">(abre em nova aba)</span>
    </a>
  </section>
</template>
