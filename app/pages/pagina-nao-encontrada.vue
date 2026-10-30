<script setup lang="ts">
// Fase 7b -- página real (pré-renderizada com conteúdo de verdade no
// HTML, não a casca client-only vazia de error.vue) usada como
// ErrorDocument 404 no .htaccess. app/error.vue continua existindo
// separado, pra erros que acontecem durante navegação client-side
// (SPA) depois que o usuário já está no site.
useSeoMeta({
  title: 'Página não encontrada — Meu Bairro Buritis',
  robots: 'noindex',
})
</script>

<template>
  <div class="flex flex-1 items-center justify-center px-4 py-16 sm:py-24">
    <div class="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
      <BaseEyebrow>Erro 404</BaseEyebrow>

      <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">
        Página não encontrada
      </h1>

      <p class="m-0 text-[17px] leading-[27px] text-ink-muted">
        O endereço que você tentou acessar não existe ou o cadastro pode ter sido removido. Se era
        um link salvo de algum tempo atrás, é bem possível que a empresa ou o prestador tenha
        mudado de página.
      </p>

      <div class="mt-5 flex flex-wrap justify-center gap-2">
        <BaseBotao to="/">Voltar para o início</BaseBotao>
        <BaseBotao to="/empresas" variante="contorno">Ver empresas</BaseBotao>
        <BaseBotao to="/prestadores" variante="contorno">Ver prestadores</BaseBotao>
      </div>
    </div>
  </div>
</template>
