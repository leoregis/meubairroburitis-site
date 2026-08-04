<script setup lang="ts">
import type { DadosNoticiaForm } from '~/components/admin/NoticiaForm.vue'

definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Nova notícia — Admin Meu Bairro Buritis' })

const { $supabase } = useNuxtApp()
const { dispararDeploy } = useDispararDeploy()
const router = useRouter()

const dados = ref<DadosNoticiaForm>({
  titulo: '',
  subtitulo: '',
  slug: '',
  conteudo: '',
  imagem_destaque_url: '',
  imagem_destaque_alt: '',
  categoria: '',
  autor: '',
  status: 'rascunho',
  seo_meta_titulo: '',
  seo_meta_descricao: '',
  seo_imagem_og: '',
  seo_palavras_chave: '',
})

const salvando = ref(false)
const erro = ref('')
const statusPublicacao = ref<'publicando' | 'ok' | 'erro' | null>(null)

onMounted(async () => {
  if (!$supabase) return
  const { data: sessao } = await $supabase.auth.getSession()
  if (!sessao.session) return

  const { data: admin } = await $supabase
    .from('admins')
    .select('nome')
    .eq('user_id', sessao.session.user.id)
    .maybeSingle()

  if (admin?.nome) dados.value.autor = admin.nome
})

async function salvar() {
  if (!$supabase) return
  salvando.value = true
  erro.value = ''

  const { error } = await $supabase.from('noticias').insert({
    titulo: dados.value.titulo,
    subtitulo: dados.value.subtitulo || null,
    slug: dados.value.slug,
    conteudo: dados.value.conteudo,
    imagem_destaque_url: dados.value.imagem_destaque_url || null,
    imagem_destaque_alt: dados.value.imagem_destaque_alt || null,
    categoria: dados.value.categoria || null,
    autor: dados.value.autor || null,
    status: dados.value.status,
    data_publicacao: dados.value.status === 'publicado' ? new Date().toISOString() : null,
    seo_meta_titulo: dados.value.seo_meta_titulo || null,
    seo_meta_descricao: dados.value.seo_meta_descricao || null,
    seo_imagem_og: dados.value.seo_imagem_og || null,
    seo_palavras_chave: dados.value.seo_palavras_chave || null,
  })

  salvando.value = false

  if (error) {
    erro.value = error.message.includes('duplicate') ? 'Já existe uma notícia com esse slug.' : error.message
    return
  }

  statusPublicacao.value = 'publicando'
  const ok = await dispararDeploy()
  statusPublicacao.value = ok ? 'ok' : 'erro'
  router.push('/admin/noticias')
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10">
    <AdminBannerPublicando :status="statusPublicacao" @fechar="statusPublicacao = null" />

    <NuxtLink to="/admin/noticias" class="text-sm text-stone-500 hover:text-orange-700">← Voltar</NuxtLink>
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Nova notícia</h1>

    <p v-if="erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

    <div class="mt-6">
      <AdminNoticiaForm v-model="dados" :salvando="salvando" :modo-edicao="false" @salvar="salvar" />
    </div>
  </div>
</template>
