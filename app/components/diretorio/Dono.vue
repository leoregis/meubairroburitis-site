<script setup lang="ts">
// Rodapé "É dono deste cadastro?" (redesign, fase 4). Empresa: a
// reivindicação fica no perfil da empresa no Guia ("É dono desta empresa?",
// precisa entrar com a conta). Prestador não tem reivindicação: o próprio
// prestador atualiza o perfil pelo app.
defineProps<{ tipo: 'empresa' | 'prestador'; link: string }>()
</script>

<template>
  <aside aria-label="Para o dono do cadastro" class="flex items-start gap-3 rounded-mbb-xl border border-dashed border-line p-4 sm:p-5">
    <span class="flex h-11 w-11 flex-none items-center justify-center rounded-mbb-md bg-ground text-ink" aria-hidden="true">
      <Icon name="lucide:shield-check" class="h-5 w-5" />
    </span>
    <p class="m-0 text-sm leading-[21px] text-ink-muted">
      <strong class="block text-[15px] text-ink">{{ tipo === 'empresa' ? 'É dono deste cadastro?' : 'É você?' }}</strong>
      <template v-if="tipo === 'empresa'">
        Abra a página no Guia Buritis, entre com a sua conta e toque em “É dono desta empresa?” para reivindicar e atualizar as informações.
      </template>
      <template v-else>
        Entre no Guia Buritis com a sua conta para atualizar o seu perfil, os contatos e as fotos.
      </template>
      <a :href="link" class="mt-1 inline-flex min-h-[44px] items-center font-bold text-brand-ink underline-offset-2 hover:underline">
        {{ tipo === 'empresa' ? 'Reivindicar no Guia Buritis' : 'Abrir no Guia Buritis' }}
      </a>
    </p>
  </aside>
</template>
