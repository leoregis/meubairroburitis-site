<script setup lang="ts">
// Rota reservada para o conteúdo de SEO de cauda longa (blog/guia do bairro)
// combinado com o usuário — arquitetura pronta, conteúdo fica para uma fase
// futura (ver decisão em C:\Users\leore\.claude\plans\rippling-jumping-dongarra.md).
useSeoMeta({ title: 'Conteúdo — Meu Bairro Buritis' })
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Em breve</p>
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Conteúdo sobre o bairro Buritis</h1>
    <p class="mt-4 text-stone-500">
      Estamos preparando guias e artigos sobre o Buritis e o Estoril. Enquanto isso, confira
      <NuxtLink to="/o-bairro-buritis" class="font-semibold text-orange-700 hover:underline">a história do bairro</NuxtLink>.
    </p>
  </div>
</template>
