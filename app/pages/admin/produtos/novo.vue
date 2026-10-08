<script setup lang="ts">
import type { DadosProdutoForm } from '~/components/admin/ProdutoForm.vue'

definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Novo produto — Admin Meu Bairro Buritis' })

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

const salvando = ref(false)
const erro = ref('')

async function salvar() {
  if (!$supabase || dados.value.preco_reais === null) return
  salvando.value = true
  erro.value = ''

  const { error } = await $supabase.from('produtos').insert({
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

  salvando.value = false

  if (error) {
    erro.value = error.message.includes('duplicate') ? 'Já existe um produto com esse slug.' : error.message
    return
  }

  // produto inativo não aparece no site: só pede publicação se nasceu ativo
  if (dados.value.ativo) {
    await dispararDeploy('produto novo: ' + dados.value.slug)
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
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Novo produto</h1>

    <p v-if="erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

    <div class="mt-6">
      <AdminProdutoForm v-model="dados" :salvando="salvando" :modo-edicao="false" @salvar="salvar" />
    </div>
  </div>
</template>
