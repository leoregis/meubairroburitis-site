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
  <div class="flex flex-1 items-center justify-center px-4 py-16">
    <div class="mx-auto max-w-lg text-center">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Erro 404</p>

      <h1 class="mt-2 text-balance font-serif text-3xl font-bold text-stone-900 sm:text-4xl">
        Página não encontrada
      </h1>

      <p class="mt-4 text-stone-600">
        O endereço que você tentou acessar não existe ou o cadastro pode ter sido removido. Se era
        um link salvo de algum tempo atrás, é bem possível que a empresa ou o prestador tenha
        mudado de página.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <NuxtLink
          to="/"
          class="rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          Voltar para o início
        </NuxtLink>
        <NuxtLink
          to="/empresas"
          class="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Ver empresas
        </NuxtLink>
        <NuxtLink
          to="/prestadores"
          class="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Ver prestadores
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
