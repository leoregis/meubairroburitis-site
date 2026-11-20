<script setup lang="ts">
import { LIMITE_DESCRICAO_GAME, type StatusGame } from '~/composables/useGames'

export interface DadosGameForm {
  nome: string
  slug: string
  descricao: string
  imagem_url: string
  imagem_alt: string
  link_url: string
  status: StatusGame
}

const props = defineProps<{
  salvando: boolean
  modoEdicao: boolean
  gameIdAtual?: string
  // imagem gravada no banco (não apagar do bucket ao trocar antes de salvar)
  imagemOriginal?: string
}>()

const emit = defineEmits<{ salvar: [] }>()

const modelo = defineModel<DadosGameForm>({ required: true })
const obterSupabase = useSupabaseSite()

// ------------------------------------------------------------------- slug
const slugTocado = ref(props.modoEdicao)

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(
  () => modelo.value.nome,
  (nome) => {
    if (!slugTocado.value) modelo.value.slug = gerarSlug(nome)
  },
)

function aoSairDoSlug() {
  slugTocado.value = true
  modelo.value.slug = gerarSlug(modelo.value.slug)
  conferirSlug()
}

const slugEmUso = ref(false)
async function conferirSlug(): Promise<boolean> {
  const $supabase = await obterSupabase()
  if (!$supabase || !modelo.value.slug) return false
  let consulta = $supabase.from('games').select('id').eq('slug', modelo.value.slug)
  if (props.gameIdAtual) consulta = consulta.neq('id', props.gameIdAtual)
  const { data } = await consulta.limit(1)
  slugEmUso.value = Boolean(data?.length)
  return slugEmUso.value
}

// -------------------------------------------------------------- validação
const tamanhoDescricao = computed(() => modelo.value.descricao.length)

function urlValida(url: string) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}
const linkInvalido = computed(() => Boolean(modelo.value.link_url.trim()) && !urlValida(modelo.value.link_url.trim()))
const avisoPublicadoSemLink = computed(() => modelo.value.status === 'publicado' && !modelo.value.link_url.trim())

const erroValidacao = ref('')
async function enviar() {
  erroValidacao.value = ''
  if (!modelo.value.nome.trim() || !modelo.value.slug.trim() || !modelo.value.descricao.trim()) {
    erroValidacao.value = 'Preencha nome, slug e descrição.'
    return
  }
  if (tamanhoDescricao.value > LIMITE_DESCRICAO_GAME) {
    erroValidacao.value = `A descrição passou de ${LIMITE_DESCRICAO_GAME} caracteres.`
    return
  }
  if (linkInvalido.value) {
    erroValidacao.value = 'O link não é uma URL válida (comece com https://).'
    return
  }
  if (await conferirSlug()) {
    erroValidacao.value = 'Já existe um jogo com esse slug.'
    return
  }
  emit('salvar')
}

// ----------------------------------------------------------------- imagem
const enviandoImagem = ref(false)
const erroImagem = ref('')
const avisoTamanho = ref('')

// apaga do bucket uma imagem enviada nesta tela e depois descartada (não a
// que está gravada no banco: essa só sai ao salvar ou ao excluir o jogo)
async function descartarEnviada(url: string) {
  if (!url || url === props.imagemOriginal) return
  const caminho = caminhoNoBucketGames(url)
  const $supabase = await obterSupabase()
  if (caminho && $supabase) await $supabase.storage.from('games').remove([caminho])
}

function conferirDimensoes(arquivo: File) {
  avisoTamanho.value = ''
  const url = URL.createObjectURL(arquivo)
  const imagem = new Image()
  imagem.onload = () => {
    const { naturalWidth: l, naturalHeight: a } = imagem
    const proporcao = l / a
    if (l < 1200 || Math.abs(proporcao - 16 / 9) > 0.03) {
      avisoTamanho.value = `A imagem tem ${l}×${a}. O ideal é 1200×675 (16:9): fora disso ela é recortada no card.`
    }
    URL.revokeObjectURL(url)
  }
  imagem.src = url
}

async function selecionarImagem(e: Event) {
  const input = e.target as HTMLInputElement
  const arquivo = input.files?.[0]
  const $supabase = await obterSupabase()
  if (!arquivo || !$supabase) return

  erroImagem.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
    erroImagem.value = 'Use JPG, PNG ou WebP.'
    input.value = ''
    return
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    erroImagem.value = 'A imagem passa de 5 MB. Reduza antes de enviar.'
    input.value = ''
    return
  }
  conferirDimensoes(arquivo)

  enviandoImagem.value = true
  const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const base = gerarSlug(modelo.value.slug || modelo.value.nome) || 'game'
  const caminho = `${base}-${Date.now()}.${extensao}`

  const { error } = await $supabase.storage.from('games').upload(caminho, arquivo, { contentType: arquivo.type })
  enviandoImagem.value = false
  input.value = ''

  if (error) {
    erroImagem.value = 'Não foi possível enviar a imagem. Tente novamente.'
    return
  }

  const anterior = modelo.value.imagem_url
  modelo.value.imagem_url = $supabase.storage.from('games').getPublicUrl(caminho).data.publicUrl
  await descartarEnviada(anterior)
}

async function removerImagem() {
  const anterior = modelo.value.imagem_url
  modelo.value.imagem_url = ''
  avisoTamanho.value = ''
  await descartarEnviada(anterior)
}

const classeCampo = 'w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none'
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
    <form class="space-y-5" novalidate @submit.prevent="enviar">
      <div>
        <label for="game-nome" class="mb-1 block text-sm font-medium text-stone-700">Nome</label>
        <input id="game-nome" v-model="modelo.nome" type="text" required :class="classeCampo" />
      </div>

      <div>
        <label for="game-slug" class="mb-1 block text-sm font-medium text-stone-700">Slug (identificador único)</label>
        <input
          id="game-slug"
          v-model="modelo.slug"
          type="text"
          required
          :class="[classeCampo, 'font-mono text-sm']"
          @blur="aoSairDoSlug"
        />
        <p v-if="slugEmUso" class="mt-1 text-xs text-red-600">Já existe um jogo com esse slug.</p>
      </div>

      <div>
        <label for="game-descricao" class="mb-1 block text-sm font-medium text-stone-700">Descrição breve</label>
        <textarea id="game-descricao" v-model="modelo.descricao" rows="3" required :class="classeCampo" />
        <p class="mt-1 text-xs" :class="tamanhoDescricao > LIMITE_DESCRICAO_GAME ? 'text-red-600' : 'text-stone-400'">
          {{ tamanhoDescricao }} / {{ LIMITE_DESCRICAO_GAME }} caracteres
        </p>
      </div>

      <div>
        <span class="mb-1 block text-sm font-medium text-stone-700">Imagem</span>
        <p class="mb-2 text-xs text-stone-500">Recomendado: 1200×675 px (16:9), JPG, PNG ou WebP, até 5 MB.</p>
        <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Enviar imagem do jogo" @change="selecionarImagem" />
        <p v-if="enviandoImagem" class="mt-1 text-xs text-stone-500">Enviando imagem...</p>
        <p v-if="erroImagem" class="mt-1 text-xs text-red-600">{{ erroImagem }}</p>
        <p v-if="avisoTamanho" class="mt-1 text-xs text-amber-700">{{ avisoTamanho }}</p>
        <div v-if="modelo.imagem_url" class="mt-2">
          <img :src="modelo.imagem_url" alt="" class="aspect-video w-full rounded-lg object-cover" />
          <button type="button" class="mt-1 text-xs font-semibold text-red-600 hover:underline" @click="removerImagem">
            Remover imagem
          </button>
        </div>
        <input
          v-model="modelo.imagem_alt"
          type="text"
          aria-label="Texto alternativo da imagem"
          placeholder="Texto alternativo da imagem (vazio usa o nome do jogo)"
          :class="[classeCampo, 'mt-2 text-sm']"
        />
      </div>

      <div>
        <label for="game-link" class="mb-1 block text-sm font-medium text-stone-700">Link do jogo</label>
        <input id="game-link" v-model="modelo.link_url" type="url" placeholder="https://..." :class="[classeCampo, 'font-mono text-sm']" />
        <p v-if="linkInvalido" class="mt-1 text-xs text-red-600">URL inválida. Comece com https://</p>
        <p v-else-if="avisoPublicadoSemLink" class="mt-1 text-xs text-amber-700">
          Publicado sem link: o card aparece, mas não é clicável.
        </p>
      </div>

      <div>
        <label for="game-status" class="mb-1 block text-sm font-medium text-stone-700">Status</label>
        <select id="game-status" v-model="modelo.status" :class="[classeCampo, 'bg-white']">
          <option value="publicado">Publicado (card clicável em /games)</option>
          <option value="em_breve">Em breve (selo "Em breve", sem link)</option>
          <option value="rascunho">Rascunho (não aparece no site)</option>
        </select>
      </div>

      <p v-if="erroValidacao" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erroValidacao }}</p>

      <div class="flex gap-3 pt-2">
        <NuxtLink
          to="/admin/games"
          class="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        >
          Cancelar
        </NuxtLink>
        <button
          type="submit"
          :disabled="salvando || enviandoImagem"
          class="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>

    <aside class="lg:sticky lg:top-6 lg:self-start">
      <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">Prévia do card</h2>
      <p v-if="modelo.status === 'rascunho'" class="mb-2 text-xs text-stone-500">Rascunho: este card não aparece em /games.</p>
      <!-- prévia não navega: um clique sem querer não pode tirar do formulário -->
      <GamesCard
        class="pointer-events-none"
        :game="{
          nome: modelo.nome || 'Nome do jogo',
          descricao: modelo.descricao || 'Descrição breve do jogo.',
          imagem_url: modelo.imagem_url || null,
          imagem_alt: modelo.imagem_alt || null,
          link_url: linkInvalido ? null : (modelo.link_url.trim() || null),
          status: modelo.status,
        }"
        previa
      />
    </aside>
  </div>
</template>
