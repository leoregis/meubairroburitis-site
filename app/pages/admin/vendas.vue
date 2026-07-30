<script setup lang="ts">
definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Vendas — Admin Meu Bairro Buritis' })

interface ItemPedido { produto_id: string; nome: string; preco_centavos: number; quantidade: number }
interface Pedido {
  id: string
  nome_comprador: string
  telefone_comprador: string
  email_comprador: string | null
  itens: ItemPedido[]
  valor_total_centavos: number
  metodo_pagamento: string
  status: string
  criado_em: string
  pago_em: string | null
}

const { $supabase } = useNuxtApp()

const pedidos = ref<Pedido[]>([])
const carregando = ref(true)
const filtroStatus = ref<string>('')
const filtroDataInicio = ref('')
const filtroDataFim = ref('')

async function carregar() {
  if (!$supabase) return
  carregando.value = true

  let query = $supabase.from('pedidos').select('*').order('criado_em', { ascending: false })
  if (filtroStatus.value) query = query.eq('status', filtroStatus.value)
  if (filtroDataInicio.value) query = query.gte('criado_em', filtroDataInicio.value)
  if (filtroDataFim.value) query = query.lte('criado_em', `${filtroDataFim.value}T23:59:59`)

  const { data } = await query
  pedidos.value = (data as Pedido[]) ?? []
  carregando.value = false
}

onMounted(carregar)

async function sair() {
  await $supabase?.auth.signOut()
  navigateTo('/admin/login')
}

const pacotesDisponiveis = computed(() => {
  const nomes = new Set<string>()
  pedidos.value.forEach((p) => p.itens.forEach((i) => nomes.add(i.nome)))
  return Array.from(nomes)
})
const filtroPacote = ref('')

const pedidosFiltrados = computed(() => {
  if (!filtroPacote.value) return pedidos.value
  return pedidos.value.filter((p) => p.itens.some((i) => i.nome === filtroPacote.value))
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="font-serif text-2xl font-bold text-stone-900">Histórico de vendas</h1>
      <button type="button" class="text-sm text-stone-500 hover:text-stone-800" @click="sair">Sair</button>
    </div>

    <div class="mb-6 flex flex-wrap gap-3">
      <select v-model="filtroStatus" class="rounded-lg border border-stone-300 px-3 py-2 text-sm" @change="carregar">
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="recusado">Recusado</option>
        <option value="cancelado">Cancelado</option>
      </select>

      <select v-model="filtroPacote" class="rounded-lg border border-stone-300 px-3 py-2 text-sm">
        <option value="">Todos os pacotes</option>
        <option v-for="nome in pacotesDisponiveis" :key="nome" :value="nome">{{ nome }}</option>
      </select>

      <input v-model="filtroDataInicio" type="date" class="rounded-lg border border-stone-300 px-3 py-2 text-sm" @change="carregar" />
      <input v-model="filtroDataFim" type="date" class="rounded-lg border border-stone-300 px-3 py-2 text-sm" @change="carregar" />
    </div>

    <p v-if="carregando" class="text-stone-500">Carregando...</p>
    <p v-else-if="pedidosFiltrados.length === 0" class="text-stone-500">Nenhum pedido encontrado.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th class="px-4 py-3">Data</th>
            <th class="px-4 py-3">Comprador</th>
            <th class="px-4 py-3">Pacotes</th>
            <th class="px-4 py-3 text-right">Valor</th>
            <th class="px-4 py-3">Método</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in pedidosFiltrados" :key="pedido.id" class="border-t border-stone-100">
            <td class="px-4 py-3 tabular-nums">{{ new Date(pedido.criado_em).toLocaleDateString('pt-BR') }}</td>
            <td class="px-4 py-3">
              <p class="font-medium text-stone-900">{{ pedido.nome_comprador }}</p>
              <p class="text-xs text-stone-500">{{ pedido.telefone_comprador }}</p>
            </td>
            <td class="px-4 py-3">{{ pedido.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ') }}</td>
            <td class="px-4 py-3 text-right tabular-nums">{{ formatarPreco(pedido.valor_total_centavos) }}</td>
            <td class="px-4 py-3 uppercase">{{ pedido.metodo_pagamento }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="{
                  'bg-orange-100 text-orange-800': pedido.status === 'pago',
                  'bg-amber-100 text-amber-800': pedido.status === 'pendente',
                  'bg-red-100 text-red-800': pedido.status === 'recusado' || pedido.status === 'cancelado',
                }"
              >
                {{ pedido.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
