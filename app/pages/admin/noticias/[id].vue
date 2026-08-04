<script setup lang="ts">
import type { DadosNoticiaForm } from '~/components/admin/NoticiaForm.vue'

definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Editar notícia — Admin Meu Bairro Buritis' })

const route = useRoute()
const noticiaId = route.params.id as string

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

// guarda a data_publicacao original -- só é definida na primeira vez que
// a notícia vira "publicado", uma edição posterior não deve empurrar a
// data pra frente de novo
const dataPublicacaoOriginal = ref<string | null>(null)

const carregando = ref(true)
const naoEncontrado = ref(false)
const salvando = ref(false)
const erro = ref('')
const statusPublicacao = ref<'publicando' | 'ok' | 'erro' | null>(null)

onMounted(async () => {
  if (!$supabase) return
  const { data, error: erroCarregar } = await $supabase
    .from('noticias')
    .select('*')
    .eq('id', noticiaId)
    .maybeSingle()

  carregando.value = false

  if (erroCarregar || !data) {
    naoEncontrado.value = true
    return
  }

  dataPublicacaoOriginal.value = data.data_publicacao

  dados.value = {
    titulo: data.titulo,
    subtitulo: data.subtitulo ?? '',
    slug: data.slug,
    conteudo: data.conteudo ?? '',
    imagem_destaque_url: data.imagem_destaque_url ?? '',
    imagem_destaque_alt: data.imagem_destaque_alt ?? '',
    categoria: data.categoria ?? '',
    autor: data.autor ?? '',
    status: data.status,
    seo_meta_titulo: data.seo_meta_titulo ?? '',
    seo_meta_descricao: data.seo_meta_descricao ?? '',
    seo_imagem_og: data.seo_imagem_og ?? '',
    seo_palavras_chave: data.seo_palavras_chave ?? '',
  }
})

async function salvar() {
  if (!$supabase) return
  salvando.value = true
  erro.value = ''

  const publicandoAgoraPelaPrimeiraVez = dados.value.status === 'publicado' && !dataPublicacaoOriginal.value

  const { error: erroSalvar } = await $supabase
    .from('noticias')
    .update({
      titulo: dados.value.titulo,
      subtitulo: dados.value.subtitulo || null,
      slug: dados.value.slug,
      conteudo: dados.value.conteudo,
      imagem_destaque_url: dados.value.imagem_destaque_url || null,
      imagem_destaque_alt: dados.value.imagem_destaque_alt || null,
      categoria: dados.value.categoria || null,
      autor: dados.value.autor || null,
      status: dados.value.status,
      data_publicacao: publicandoAgoraPelaPrimeiraVez ? new Date().toISOString() : dataPublicacaoOriginal.value,
      seo_meta_titulo: dados.value.seo_meta_titulo || null,
      seo_meta_descricao: dados.value.seo_meta_descricao || null,
      seo_imagem_og: dados.value.seo_imagem_og || null,
      seo_palavras_chave: dados.value.seo_palavras_chave || null,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', noticiaId)

  salvando.value = false

  if (erroSalvar) {
    erro.value = erroSalvar.message.includes('duplicate') ? 'Já existe uma notícia com esse slug.' : erroSalvar.message
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
    <h1 class="mt-2 font-serif text-2xl font-bold text-stone-900">Editar notícia</h1>

    <p v-if="carregando" class="mt-6 text-stone-500">Carregando...</p>
    <p v-else-if="naoEncontrado" class="mt-6 text-stone-500">Notícia não encontrada.</p>

    <template v-else>
      <p v-if="erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

      <div class="mt-6">
        <AdminNoticiaForm v-model="dados" :salvando="salvando" :modo-edicao="true" @salvar="salvar" />
      </div>
    </template>
  </div>
</template>
