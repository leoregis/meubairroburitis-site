<script setup lang="ts">
import type { DadosGameForm } from '~/components/admin/GameForm.vue'

definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Editar jogo — Admin Meu Bairro Buritis' })

const route = useRoute()
const gameId = route.params.id as string

const obterSupabase = useSupabaseSite()
const { dispararDeploy, avisarSemPublicacao, fecharAviso, aviso } = useDispararDeploy()
const router = useRouter()

const dados = ref<DadosGameForm>({
  nome: '',
  slug: '',
  descricao: '',
  imagem_url: '',
  imagem_alt: '',
  link_url: '',
  status: 'rascunho',
})

const statusOriginal = ref<string | null>(null)
const imagemOriginal = ref('')
const carregando = ref(true)
const naoEncontrado = ref(false)
const salvando = ref(false)
const erro = ref('')

onMounted(async () => {
  const $supabase = await obterSupabase()
  if (!$supabase) return
  const { data, error } = await $supabase.from('games').select('*').eq('id', gameId).maybeSingle()
  carregando.value = false
  if (error || !data) {
    naoEncontrado.value = true
    return
  }
  statusOriginal.value = data.status
  imagemOriginal.value = data.imagem_url ?? ''
  dados.value = {
    nome: data.nome,
    slug: data.slug,
    descricao: data.descricao,
    imagem_url: data.imagem_url ?? '',
    imagem_alt: data.imagem_alt ?? '',
    link_url: data.link_url ?? '',
    status: data.status,
  }
})

async function salvar() {
  const $supabase = await obterSupabase()
  if (!$supabase) return
  salvando.value = true
  erro.value = ''

  const { error } = await $supabase
    .from('games')
    .update({
      nome: dados.value.nome.trim(),
      slug: dados.value.slug,
      descricao: dados.value.descricao.trim(),
      imagem_url: dados.value.imagem_url || null,
      imagem_alt: dados.value.imagem_alt.trim() || null,
      link_url: dados.value.link_url.trim() || null,
      status: dados.value.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  salvando.value = false

  if (error) {
    erro.value = error.message.includes('duplicate') ? 'Já existe um jogo com esse slug.' : error.message
    return
  }

  // imagem trocada ou removida: a antiga sai do bucket
  if (imagemOriginal.value && imagemOriginal.value !== dados.value.imagem_url) {
    const caminho = caminhoNoBucketGames(imagemOriginal.value)
    if (caminho) await $supabase.storage.from('games').remove([caminho])
  }

  // republica se o jogo aparece ou aparecia em /games
  if (dados.value.status !== 'rascunho' || statusOriginal.value !== 'rascunho') {
    await dispararDeploy('game editado: ' + dados.value.slug)
  } else {
    avisarSemPublicacao()
  }
  router.push('/admin/games')
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10">
    <AdminBannerPublicando :status="aviso.status" :previsao-minutos="aviso.previsaoMinutos" @fechar="fecharAviso" />

    <NuxtLink to="/admin/games" class="text-sm text-stone-500 hover:text-orange-700">← Voltar</NuxtLink>
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Editar jogo</h1>

    <p v-if="carregando" class="mt-6 text-stone-500">Carregando...</p>
    <p v-else-if="naoEncontrado" class="mt-6 text-stone-500">Jogo não encontrado.</p>

    <template v-else>
      <p v-if="erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>
      <div class="mt-6">
        <AdminGameForm
          v-model="dados"
          :salvando="salvando"
          :modo-edicao="true"
          :game-id-atual="gameId"
          :imagem-original="imagemOriginal"
          @salvar="salvar"
        />
      </div>
    </template>
  </div>
</template>
