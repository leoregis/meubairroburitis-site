<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Login administrativo — Meu Bairro Buritis' })

const { $supabase } = useNuxtApp()
const router = useRouter()

const email = ref('')
const senha = ref('')
const erro = ref<string | null>(null)
const carregando = ref(false)

async function entrar() {
  if (!$supabase) return
  carregando.value = true
  erro.value = null

  const { data, error } = await $supabase.auth.signInWithPassword({
    email: email.value,
    password: senha.value,
  })

  if (error || !data.session) {
    erro.value = 'E-mail ou senha inválidos.'
    carregando.value = false
    return
  }

  const { data: souAdmin } = await $supabase.rpc('is_admin')
  if (!souAdmin) {
    await $supabase.auth.signOut()
    erro.value = 'Esta conta não tem acesso administrativo.'
    carregando.value = false
    return
  }

  router.push('/admin/vendas')
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-sm items-center px-4">
    <form class="w-full space-y-4" @submit.prevent="entrar">
      <h1 class="font-serif text-2xl font-bold text-stone-900">Acesso administrativo</h1>

      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700" for="email">E-mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700" for="senha">Senha</label>
        <input
          id="senha"
          v-model="senha"
          type="password"
          required
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <p v-if="erro" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

      <button
        type="submit"
        :disabled="carregando"
        class="w-full rounded-full bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>
