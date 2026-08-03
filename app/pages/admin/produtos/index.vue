<script setup lang="ts">
definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Produtos — Admin Meu Bairro Buritis' })

interface ProdutoAdmin {
  id: string
  slug: string
  nome: string
  preco_centavos: number
  ordem: number
  ativo: boolean
}

const { $supabase } = useNuxtApp()
const { dispararDeploy } = useDispararDeploy()

const produtos = ref<ProdutoAdmin[]>([])
const carregando = ref(true)
const statusPublicacao = ref<'publicando' | 'ok' | 'erro' | null>(null)

async function carregar() {
  if (!$supabase) return
  carregando.value = true
  const { data } = await $supabase
    .from('produtos')
    .select('id, slug, nome, preco_centavos, ordem, ativo')
    .order('ordem', { ascending: true })
  produtos.value = (data as ProdutoAdmin[]) ?? []
  carregando.value = false
}

onMounted(carregar)

const modalAberto = ref(false)
const produtoParaExcluir = ref<ProdutoAdmin | null>(null)
const excluindo = ref(false)

function pedirConfirmacaoExclusao(produto: ProdutoAdmin) {
  produtoParaExcluir.value = produto
  modalAberto.value = true
}

async function confirmarExclusao() {
  if (!produtoParaExcluir.value || !$supabase) return
  excluindo.value = true

  const { error } = await $supabase.from('produtos').delete().eq('id', produtoParaExcluir.value.id)

  excluindo.value = false
  modalAberto.value = false

  if (error) {
    statusPublicacao.value = 'erro'
    console.error('Erro ao excluir produto:', error)
    return
  }

  produtoParaExcluir.value = null
  await carregar()
  await publicar()
}

async function publicar() {
  statusPublicacao.value = 'publicando'
  const ok = await dispararDeploy()
  statusPublicacao.value = ok ? 'ok' : 'erro'
}

function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <AdminBannerPublicando :status="statusPublicacao" @fechar="statusPublicacao = null" />
    <AdminConfirmModal
      :aberto="modalAberto"
      titulo="Excluir produto?"
      :mensagem="`Tem certeza que quer excluir &quot;${produtoParaExcluir?.nome}&quot;? Essa ação não pode ser desfeita, e o site será republicado sem esse produto.`"
      :confirmando="excluindo"
      @confirmar="confirmarExclusao"
      @cancelar="modalAberto = false"
    />

    <div class="mb-8 flex items-center justify-between">
      <h1 class="font-serif text-2xl font-bold text-stone-900">Produtos da loja</h1>
      <NuxtLink
        to="/admin/produtos/novo"
        class="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700"
      >
        + Novo produto
      </NuxtLink>
    </div>

    <p v-if="carregando" class="text-stone-500">Carregando...</p>
    <p v-else-if="produtos.length === 0" class="text-stone-500">Nenhum produto cadastrado ainda.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3 text-right">Preço</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in produtos" :key="produto.id" class="border-t border-stone-100">
            <td class="px-4 py-3">
              <p class="font-medium text-stone-900">{{ produto.nome }}</p>
              <p class="text-xs text-stone-400">/{{ produto.slug }}</p>
            </td>
            <td class="px-4 py-3 text-right tabular-nums">{{ formatarPreco(produto.preco_centavos) }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="produto.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'"
              >
                {{ produto.ativo ? 'Publicado' : 'Rascunho' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <NuxtLink :to="`/admin/produtos/${produto.id}`" class="font-semibold text-orange-700 hover:underline">
                Editar
              </NuxtLink>
              <button
                type="button"
                class="ml-4 font-semibold text-red-600 hover:underline"
                @click="pedirConfirmacaoExclusao(produto)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
