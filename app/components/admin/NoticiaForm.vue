<script setup lang="ts">
export interface DadosNoticiaForm {
  titulo: string
  subtitulo: string
  slug: string
  conteudo: string
  imagem_destaque_url: string
  imagem_destaque_alt: string
  categoria: string
  categoria_id: string
  subcategoria_guia_id: string
  tipo_conteudo: 'reportagem' | 'guia' | 'opiniao' | 'patrocinado' | 'nao_classificado'
  autor: string
  status: 'rascunho' | 'publicado'
  seo_meta_titulo: string
  seo_meta_descricao: string
  seo_imagem_og: string
  seo_palavras_chave: string
  relacionados: string[]
}

const props = defineProps<{
  salvando: boolean
  modoEdicao: boolean
  noticiaIdAtual?: string
}>()

const emit = defineEmits<{ salvar: [] }>()

// mesmo padrão de ProdutoForm.vue -- defineModel evita o bug de perda de
// dados já corrigido lá (computed get/set manual colidindo com v-model
// direto nos campos).
const modelo = defineModel<DadosNoticiaForm>({ required: true })

const { $supabase } = useNuxtApp()

const { data: categorias } = await useCategorias()
const { data: subcategoriasGuia } = await useSubcategoriasGuia()
const { data: todasNoticias } = await useTodasNoticiasPublicadas()

const buscaRelacionados = ref('')

const opcoesRelacionados = computed(() =>
  (todasNoticias.value ?? []).filter((n) => n.id !== props.noticiaIdAtual),
)

const relacionadosFiltrados = computed(() => {
  const termo = buscaRelacionados.value.trim().toLowerCase()
  if (!termo) return opcoesRelacionados.value
  return opcoesRelacionados.value.filter((n) => n.titulo.toLowerCase().includes(termo))
})

const relacionadosSelecionados = computed(() =>
  opcoesRelacionados.value.filter((n) => modelo.value.relacionados.includes(n.id)),
)

function alternarRelacionado(id: string) {
  modelo.value.relacionados = modelo.value.relacionados.includes(id)
    ? modelo.value.relacionados.filter((x) => x !== id)
    : [...modelo.value.relacionados, id]
}

function removerRelacionado(id: string) {
  modelo.value.relacionados = modelo.value.relacionados.filter((x) => x !== id)
}

const slugTocado = ref(props.modoEdicao)

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function aoTrocarCategoria() {
  if (modelo.value.categoria_id !== 'guias') {
    modelo.value.subcategoria_guia_id = ''
  }
}

watch(
  () => modelo.value.titulo,
  (novoTitulo) => {
    if (!slugTocado.value) modelo.value.slug = gerarSlug(novoTitulo)
  },
)

function aoDigitarSlug() {
  slugTocado.value = true
  modelo.value.slug = gerarSlug(modelo.value.slug)
}

// --- upload da imagem destacada -- sobe pro Storage assim que escolhida,
// atualiza modelo.imagem_destaque_url direto (form fica autocontido, as
// páginas novo/editar não precisam saber de File nenhum).
const enviandoImagem = ref(false)
const erroImagem = ref('')

async function selecionarImagemDestaque(e: Event) {
  const arquivo = (e.target as HTMLInputElement).files?.[0]
  if (!arquivo || !$supabase) return

  enviandoImagem.value = true
  erroImagem.value = ''

  const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const caminho = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`

  const { error: erroUpload } = await $supabase.storage
    .from('noticias-imagens')
    .upload(caminho, arquivo)

  if (erroUpload) {
    erroImagem.value = 'Não foi possível enviar a imagem. Tente novamente.'
    enviandoImagem.value = false
    return
  }

  const { data: publicData } = $supabase.storage
    .from('noticias-imagens')
    .getPublicUrl(caminho)

  modelo.value.imagem_destaque_url = publicData.publicUrl
  enviandoImagem.value = false
}

const limiteMetaDescricao = 160
</script>

<template>
  <form class="space-y-5" @submit.prevent="emit('salvar')">
    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Título</label>
      <input
        v-model="modelo.titulo"
        type="text"
        required
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Slug (URL: /noticias/{{ modelo.slug || '...' }})</label>
      <input
        v-model="modelo.slug"
        type="text"
        required
        class="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm focus:border-orange-500 focus:outline-none"
        @blur="aoDigitarSlug"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Subtítulo / resumo</label>
      <textarea
        v-model="modelo.subtitulo"
        rows="2"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
      <p class="mt-1 text-xs text-stone-500">
        Aparece como chamada da notícia e também serve de descrição pra buscadores, se o campo de SEO abaixo ficar vazio.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700">Categoria</label>
        <select
          v-model="modelo.categoria_id"
          class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
          @change="aoTrocarCategoria"
        >
          <option value="">Não classificado</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.rotulo }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700">Autor</label>
        <input
          v-model="modelo.autor"
          type="text"
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>
    </div>

    <div v-if="modelo.categoria_id === 'guias'">
      <label class="mb-1 block text-sm font-medium text-stone-700">Subcategoria do guia</label>
      <select
        v-model="modelo.subcategoria_guia_id"
        class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
      >
        <option value="">Selecione...</option>
        <option v-for="sub in subcategoriasGuia" :key="sub.id" :value="sub.id">{{ sub.rotulo }}</option>
      </select>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Tipo de conteúdo</label>
      <select
        v-model="modelo.tipo_conteudo"
        class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
      >
        <option value="nao_classificado">Não classificado</option>
        <option value="reportagem">Reportagem/Notícia</option>
        <option value="guia">Guia</option>
        <option value="opiniao">Opinião/Coluna</option>
        <option value="patrocinado">Conteúdo Patrocinado</option>
      </select>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Imagem destacada</label>
      <input type="file" accept="image/*" @change="selecionarImagemDestaque" />
      <p v-if="enviandoImagem" class="mt-1 text-xs text-stone-500">Enviando imagem...</p>
      <p v-if="erroImagem" class="mt-1 text-xs text-red-600">{{ erroImagem }}</p>
      <img
        v-if="modelo.imagem_destaque_url"
        :src="modelo.imagem_destaque_url"
        class="mt-2 h-40 w-full rounded-lg object-cover"
      />
      <input
        v-model="modelo.imagem_destaque_alt"
        type="text"
        placeholder="Texto alternativo da imagem (importante pra SEO e acessibilidade)"
        class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Conteúdo</label>
      <AdminTiptapEditor v-model="modelo.conteudo" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Leia também (relacionados)</label>
      <p class="mb-2 text-xs text-stone-500">
        Escolha manualmente os artigos que devem aparecer no bloco "Leia também" desta notícia
        -- a recíproca é gravada automaticamente nos artigos escolhidos. Deixe vazio pra usar o
        cálculo automático (artigos mais recentes da mesma categoria).
      </p>

      <div v-if="relacionadosSelecionados.length" class="mb-2 flex flex-wrap gap-2">
        <span
          v-for="rel in relacionadosSelecionados"
          :key="rel.id"
          class="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700"
        >
          {{ rel.titulo }}
          <button type="button" class="font-bold" @click="removerRelacionado(rel.id)">×</button>
        </span>
      </div>

      <input
        v-model="buscaRelacionados"
        type="text"
        placeholder="Buscar notícia por título..."
        class="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
      />

      <div class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-stone-200">
        <label
          v-for="n in relacionadosFiltrados"
          :key="n.id"
          class="flex items-center gap-2 border-b border-stone-100 px-3 py-2 text-sm last:border-b-0 hover:bg-stone-50"
        >
          <input
            type="checkbox"
            :checked="modelo.relacionados.includes(n.id)"
            @change="alternarRelacionado(n.id)"
          />
          {{ n.titulo }}
        </label>
        <p v-if="!relacionadosFiltrados.length" class="px-3 py-2 text-sm text-stone-400">
          Nenhuma notícia encontrada.
        </p>
      </div>
    </div>

    <div class="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">SEO</h3>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">
            Meta título <span class="font-normal text-stone-400">(vazio usa o título acima)</span>
          </label>
          <input
            v-model="modelo.seo_meta_titulo"
            type="text"
            :placeholder="modelo.titulo"
            class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">
            Meta descrição <span class="font-normal text-stone-400">(vazio usa o subtítulo acima)</span>
          </label>
          <textarea
            v-model="modelo.seo_meta_descricao"
            rows="2"
            :placeholder="modelo.subtitulo"
            class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
          />
          <p
            class="mt-1 text-xs"
            :class="modelo.seo_meta_descricao.length > limiteMetaDescricao ? 'text-red-600' : 'text-stone-400'"
          >
            {{ modelo.seo_meta_descricao.length }} / {{ limiteMetaDescricao }} caracteres recomendados
          </p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">
            Imagem para compartilhamento (Open Graph) <span class="font-normal text-stone-400">(vazio usa a imagem destacada)</span>
          </label>
          <input
            v-model="modelo.seo_imagem_og"
            type="text"
            :placeholder="modelo.imagem_destaque_url || 'https://...'"
            class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700">Palavras-chave</label>
          <input
            v-model="modelo.seo_palavras_chave"
            type="text"
            placeholder="separadas por vírgula"
            class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>
    </div>

    <label class="flex items-center gap-2">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-stone-300"
        :checked="modelo.status === 'publicado'"
        @change="modelo.status = ($event.target as HTMLInputElement).checked ? 'publicado' : 'rascunho'"
      />
      <span class="text-sm text-stone-700">
        Publicado (visível no site público -- desmarque pra deixar como rascunho)
      </span>
    </label>

    <div class="flex gap-3 pt-2">
      <NuxtLink
        to="/admin/noticias"
        class="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
      >
        Cancelar
      </NuxtLink>
      <button
        type="submit"
        :disabled="salvando || enviandoImagem"
        class="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {{ salvando ? 'Salvando...' : 'Salvar e publicar' }}
      </button>
    </div>
  </form>
</template>
