<script setup lang="ts">
import type { DadosGameForm } from '~/components/admin/GameForm.vue'

definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Novo jogo — Admin Meu Bairro Buritis' })

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

const salvando = ref(false)
const erro = ref('')

async function salvar() {
  const $supabase = await obterSupabase()
  if (!$supabase) return
  salvando.value = true
  erro.value = ''

  // jogo novo entra no fim da lista
  const { data: ultimo } = await $supabase.from('games').select('ordem').order('ordem', { ascending: false }).limit(1)
  const ordem = (ultimo?.[0]?.ordem ?? 0) + 1

  const { error } = await $supabase.from('games').insert({
    nome: dados.value.nome.trim(),
    slug: dados.value.slug,
    descricao: dados.value.descricao.trim(),
    imagem_url: dados.value.imagem_url || null,
    imagem_alt: dados.value.imagem_alt.trim() || null,
    link_url: dados.value.link_url.trim() || null,
    status: dados.value.status,
    ordem,
  })

  salvando.value = false

  if (error) {
    erro.value = error.message.includes('duplicate') ? 'Já existe um jogo com esse slug.' : error.message
    return
  }

  // rascunho não aparece em /games: só republica se nasceu publicado/em breve
  if (dados.value.status !== 'rascunho') {
    await dispararDeploy('game novo: ' + dados.value.slug)
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
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Novo jogo</h1>

    <p v-if="erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

    <div class="mt-6">
      <AdminGameForm v-model="dados" :salvando="salvando" :modo-edicao="false" @salvar="salvar" />
    </div>
  </div>
</template>
