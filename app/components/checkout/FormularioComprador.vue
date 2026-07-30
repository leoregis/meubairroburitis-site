<script setup lang="ts">
const modelo = defineModel<{ nome: string; telefone: string; email: string }>({ required: true })
</script>

<template>
  <div class="space-y-4">
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
