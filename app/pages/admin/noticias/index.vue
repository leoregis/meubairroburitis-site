<script setup lang="ts">
definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Notícias — Admin Meu Bairro Buritis' })

interface NoticiaAdmin {
  id: string
  slug: string
  titulo: string
  status: 'rascunho' | 'publicado'
  data_publicacao: string | null
  criado_em: string
}

const { $supabase } = useNuxtApp()
const { dispararDeploy, avisarSemPublicacao, fecharAviso, aviso } = useDispararDeploy()

const noticias = ref<NoticiaAdmin[]>([])
const carregando = ref(true)

async function carregar() {
  if (!$supabase) return
  carregando.value = true
  const { data } = await $supabase
    .from('noticias')
    .select('id, slug, titulo, status, data_publicacao, criado_em')
    .order('criado_em', { ascending: false })
  noticias.value = (data as NoticiaAdmin[]) ?? []
  carregando.value = false
}

onMounted(carregar)

const modalAberto = ref(false)
const noticiaParaExcluir = ref<NoticiaAdmin | null>(null)
const excluindo = ref(false)

function pedirConfirmacaoExclusao(noticia: NoticiaAdmin) {
  noticiaParaExcluir.value = noticia
  modalAberto.value = true
}

async function confirmarExclusao() {
  if (!noticiaParaExcluir.value || !$supabase) return
  // só republica se o item excluído estava no ar
  const estavaNoAr = noticiaParaExcluir.value.status === 'publicado'
  const slugExcluido = noticiaParaExcluir.value.slug
  excluindo.value = true

  const { error } = await $supabase.from('noticias').delete().eq('id', noticiaParaExcluir.value.id)

  excluindo.value = false
  modalAberto.value = false

  if (error) {
    aviso.value = { status: 'erro', previsaoMinutos: null }
    console.error('Erro ao excluir notícia:', error)
    return
  }

  noticiaParaExcluir.value = null
  await carregar()
  if (estavaNoAr) {
    await dispararDeploy('noticia publicada excluida: ' + slugExcluido)
  } else {
    avisarSemPublicacao()
  }
}

function formatarData(data: string | null) {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <AdminBannerPublicando :status="aviso.status" :previsao-minutos="aviso.previsaoMinutos" @fechar="fecharAviso" />
    <AdminConfirmModal
      :aberto="modalAberto"
      titulo="Excluir notícia?"
      :mensagem="`Tem certeza que quer excluir &quot;${noticiaParaExcluir?.titulo}&quot;? Essa ação não pode ser desfeita, e o site será republicado sem essa notícia.`"
      :confirmando="excluindo"
      @confirmar="confirmarExclusao"
      @cancelar="modalAberto = false"
    />

    <div class="mb-8 flex items-center justify-between">
      <h1 class="font-serif text-2xl font-bold text-stone-900">Notícias</h1>
      <NuxtLink
        to="/admin/noticias/novo"
        class="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700"
      >
        + Nova notícia
      </NuxtLink>
    </div>

    <p v-if="carregando" class="text-stone-500">Carregando...</p>
    <p v-else-if="noticias.length === 0" class="text-stone-500">Nenhuma notícia cadastrada ainda.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th class="px-4 py-3">Título</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Publicação</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="noticia in noticias" :key="noticia.id" class="border-t border-stone-100">
            <td class="px-4 py-3">
              <p class="font-medium text-stone-900">{{ noticia.titulo }}</p>
              <p class="text-xs text-stone-400">/noticias/{{ noticia.slug }}</p>
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="noticia.status === 'publicado' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'"
              >
                {{ noticia.status === 'publicado' ? 'Publicado' : 'Rascunho' }}
              </span>
            </td>
            <td class="px-4 py-3 text-stone-500">{{ formatarData(noticia.data_publicacao) }}</td>
            <td class="px-4 py-3 text-right">
              <NuxtLink :to="`/admin/noticias/${noticia.id}`" class="font-semibold text-orange-700 hover:underline">
                Editar
              </NuxtLink>
              <button
                type="button"
                class="ml-4 font-semibold text-red-600 hover:underline"
                @click="pedirConfirmacaoExclusao(noticia)"
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
