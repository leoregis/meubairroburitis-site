<script setup lang="ts">
const modelo = defineModel<{ nome: string; telefone: string; email: string; empresa: string }>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <!-- honeypot anti-spam: campo real pra bot nenhum humano preenche (fora
    da tela, sem label visível, tabindex -1). Se vier preenchido, o servidor
    (criar_pagamento) rejeita silenciosamente -- não é validação real de
    negócio, então fica escondido em vez de disabled/hidden (alguns bots
    pulam campos hidden/display:none, mas ainda preenchem tudo que existe
    no DOM). -->
    <div class="absolute -left-[9999px]" aria-hidden="true">
      <label for="empresa">Empresa</label>
      <input id="empresa" v-model="modelo.empresa" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700" for="nome">Nome completo</label>
      <input
        id="nome"
        v-model="modelo.nome"
        type="text"
        required
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700" for="telefone">WhatsApp</label>
      <input
        id="telefone"
        v-model="modelo.telefone"
        type="tel"
        placeholder="31990000000"
        required
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700" for="email">E-mail (opcional)</label>
      <input
        id="email"
        v-model="modelo.email"
        type="email"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>
  </div>
</template>
