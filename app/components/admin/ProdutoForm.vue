<script setup lang="ts">
export interface DadosProdutoForm {
  slug: string
  nome: string
  descricao_curta: string
  descricao: string
  preco_reais: number | null
  imagem_url: string
  ordem: number
  ativo: boolean
}

const props = defineProps<{
  salvando: boolean
  modoEdicao: boolean
}>()

const emit = defineEmits<{ salvar: [] }>()

// defineModel -- mesmo padrão já usado em FormularioComprador.vue (checkout).
// A versão anterior usava um computed get/set manual reatribuindo o objeto
// inteiro a cada tecla digitada; misturado com v-model direto nos outros
// campos (que mutava o objeto por referência), os dois estilos colidiam e
// perdiam dados -- o campo "Nome" ficava vazio na hora de salvar, mesmo
// aparentando preenchido na tela. defineModel evita esse problema, é uma
// ref de verdade sincronizada com o pai.
const modelo = defineModel<DadosProdutoForm>({ required: true })

// gera o slug a partir do nome só enquanto o usuário não editou o slug
// manualmente (evita sobrescrever um slug já publicado/linkado)
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
  (novoNome) => {
    if (!slugTocado.value) modelo.value.slug = gerarSlug(novoNome)
  },
)

function aoDigitarSlug() {
  slugTocado.value = true
  modelo.value.slug = gerarSlug(modelo.value.slug)
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="emit('salvar')">
    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Nome</label>
      <input
        v-model="modelo.nome"
        type="text"
        required
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Slug (URL: /loja/{{ modelo.slug || '...' }})</label>
      <input
        v-model="modelo.slug"
        type="text"
        required
        class="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm focus:border-orange-500 focus:outline-none"
        @blur="aoDigitarSlug"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Descrição curta (aparece nos cards)</label>
      <input
        v-model="modelo.descricao_curta"
        type="text"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Descrição completa (aparece na página do produto)</label>
      <textarea
        v-model="modelo.descricao"
        rows="5"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700">Preço (R$)</label>
        <input
          v-model.number="modelo.preco_reais"
          type="number"
          step="0.01"
          min="0"
          required
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700">Ordem de exibição</label>
        <input
          v-model.number="modelo.ordem"
          type="number"
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
        />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-stone-700">Imagem (caminho em /public, ex: /produtos/meu-produto.jpg)</label>
      <input
        v-model="modelo.imagem_url"
        type="text"
        class="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm focus:border-orange-500 focus:outline-none"
      />
      <p class="mt-1 text-xs text-stone-500">
        O arquivo de imagem precisa existir em <code>app/public</code> no repositório -- este formulário não faz upload.
      </p>
    </div>

    <label class="flex items-center gap-2">
      <input v-model="modelo.ativo" type="checkbox" class="h-4 w-4 rounded border-stone-300" />
      <span class="text-sm text-stone-700">
        Publicado (visível na loja pública -- desmarque pra deixar como rascunho)
      </span>
    </label>

    <div class="flex gap-3 pt-2">
      <NuxtLink
        to="/admin/produtos"
        class="rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
      >
        Cancelar
      </NuxtLink>
      <button
        type="submit"
        :disabled="salvando"
        class="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {{ salvando ? 'Salvando...' : 'Salvar e publicar' }}
      </button>
    </div>
  </form>
</template>
