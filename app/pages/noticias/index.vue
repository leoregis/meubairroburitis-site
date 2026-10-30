<script setup lang="ts">
useSeoMeta({
  title: 'Notícias — Meu Bairro Buritis',
  description: 'Fique por dentro das notícias do bairro Buritis: eventos, segurança, comércio local e mais.',
})
</script>

<template>
  <div class="mx-auto flex max-w-[1248px] flex-col gap-5 px-4 pb-16 pt-6 sm:gap-6 sm:px-6 sm:pb-[72px] sm:pt-10">
    <header class="flex flex-col gap-2">
      <BaseEyebrow>Meu Bairro Buritis</BaseEyebrow>
      <h1 class="m-0 text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">Notícias</h1>
      <p class="m-0 max-w-[640px] text-[15px] leading-[23px] text-ink-muted sm:text-[17px] sm:leading-[27px]">
        O que acontece no Buritis e no Estoril: segurança, mobilidade, comércio, gente e eventos do bairro.
      </p>
    </header>

    <NoticiasEditorias />
    <NoticiasListagem :pagina="1" />
  </div>
</template>
