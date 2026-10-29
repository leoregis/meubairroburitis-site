<template>
  <div class="flex min-h-screen flex-col bg-white text-ink">
    <a
      href="#conteudo"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-mbb-md focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
    >
      Pular para o conteúdo
    </a>
    <LayoutTopBar />
    <LayoutHeader />
    <main id="conteudo" tabindex="-1" class="flex-1 focus:outline-none">
      <slot />
    </main>
    <LayoutFooter />
    <LayoutWhatsappFloat />
    <LayoutToastCarrinho />
  </div>
</template>
