<script setup lang="ts">
import type { DadosProdutoForm } from '~/components/admin/ProdutoForm.vue'

definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Editar produto — Admin Meu Bairro Buritis' })

const route = useRoute()
const produtoId = route.params.id as string

const { $supabase } = useNuxtApp()
const { dispararDeploy, avisarSemPublicacao, fecharAviso, aviso } = useDispararDeploy()
const router = useRouter()

const dados = ref<DadosProdutoForm>({
  slug: '',
  nome: '',
  descricao_curta: '',
  descricao: '',
  preco_reais: null,
  preco_original_reais: null,
  imagem_url: '',
  ordem: 0,
  ativo: true,
})

const ativoOriginal = ref(false)
const carregando = ref(true)
const naoEncontrado = ref(false)
const salvando = ref(false)
const erro = ref('')

onMounted(async () => {
  if (!$supabase) return
  const { data, error: erroCarregar } = await $supabase
    .from('produtos')
    .select('*')
    .eq('id', produtoId)
    .maybeSingle()

  carregando.value = false

  if (erroCarregar || !data) {
    naoEncontrado.value = true
    return
  }

  dados.value = {
    slug: data.slug,
    nome: data.nome,
    descricao_curta: data.descricao_curta ?? '',
    descricao: data.descricao ?? '',
    preco_reais: data.preco_centavos / 100,
    preco_original_reais: data.preco_original_centavos ? data.preco_original_centavos / 100 : null,
    imagem_url: data.imagem_url ?? '',
    ordem: data.ordem,
    ativo: data.ativo,
  }
  ativoOriginal.value = data.ativo
})

async function salvar() {
  if (!$supabase || dados.value.preco_reais === null) return
  salvando.value = true
  erro.value = ''

  const { error: erroSalvar } = await $supabase
    .from('produtos')
    .update({
      slug: dados.value.slug,
      nome: dados.value.nome,
      descricao_curta: dados.value.descricao_curta || null,
      descricao: dados.value.descricao || null,
      preco_centavos: Math.round(dados.value.preco_reais * 100),
      preco_original_centavos: dados.value.preco_original_reais ? Math.round(dados.value.preco_original_reais * 100) : null,
      imagem_url: dados.value.imagem_url || null,
      ordem: dados.value.ordem,
      ativo: dados.value.ativo,
    })
    .eq('id', produtoId)

  salvando.value = false

  if (erroSalvar) {
    erro.value = erroSalvar.message.includes('duplicate') ? 'Já existe um produto com esse slug.' : erroSalvar.message
    return
  }

  // só pede publicação se o produto é ou ERA ativo (ativar, desativar ou
  // editar ativo); inativo -> inativo não muda o site
  if (dados.value.ativo || ativoOriginal.value) {
    await dispararDeploy('produto editado: ' + dados.value.slug)
    ativoOriginal.value = dados.value.ativo
  } else {
    avisarSemPublicacao()
  }
  router.push('/admin/produtos')
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10">
    <AdminBannerPublicando :status="aviso.status" :previsao-minutos="aviso.previsaoMinutos" @fechar="fecharAviso" />

    <NuxtLink to="/admin/produtos" class="text-sm text-stone-500 hover:text-orange-700">← Voltar</NuxtLink>
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Editar produto</h1>

    <p v-if="carregando" class="mt-6 text-stone-500">Carregando...</p>
    <p v-else-if="naoEncontrado" class="mt-6 text-stone-500">Produto não encontrado.</p>

    <template v-else>
      <p v-if="erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

      <div class="mt-6">
        <AdminProdutoForm v-model="dados" :salvando="salvando" :modo-edicao="true" @salvar="salvar" />
      </div>
    </template>
  </div>
</template>
