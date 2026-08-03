<script setup lang="ts">
const route = useRoute()
const { $supabase } = useNuxtApp()

async function sair() {
  await $supabase?.auth.signOut()
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <nav v-if="route.path !== '/admin/login'" class="border-b border-stone-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-6">
          <span class="font-serif font-bold text-stone-900">Admin</span>
          <NuxtLink
            to="/admin/vendas"
            class="text-sm font-medium"
            :class="route.path.startsWith('/admin/vendas') ? 'text-orange-700' : 'text-stone-500 hover:text-stone-800'"
          >
            Vendas
          </NuxtLink>
          <NuxtLink
            to="/admin/produtos"
            class="text-sm font-medium"
            :class="route.path.startsWith('/admin/produtos') ? 'text-orange-700' : 'text-stone-500 hover:text-stone-800'"
          >
            Produtos
          </NuxtLink>
        </div>
        <button type="button" class="text-sm text-stone-500 hover:text-stone-800" @click="sair">Sair</button>
      </div>
    </nav>
    <slot />
  </div>
</template>
