<script setup lang="ts">
definePageMeta({ middleware: 'admin', ssr: false, layout: 'admin' })
useSeoMeta({ title: 'Games — Admin Meu Bairro Buritis' })

interface GameAdmin {
  id: string
  slug: string
  nome: string
  imagem_url: string | null
  status: 'publicado' | 'em_breve' | 'rascunho'
  ordem: number
}

const ROTULO_STATUS = { publicado: 'Publicado', em_breve: 'Em breve', rascunho: 'Rascunho' }
const COR_STATUS = {
  publicado: 'bg-emerald-100 text-emerald-800',
  em_breve: 'bg-amber-100 text-amber-800',
  rascunho: 'bg-stone-100 text-stone-500',
}

const obterSupabase = useSupabaseSite()
const { dispararDeploy, avisarSemPublicacao, fecharAviso, aviso } = useDispararDeploy()

const games = ref<GameAdmin[]>([])
const carregando = ref(true)
const erro = ref('')

async function carregar() {
  const $supabase = await obterSupabase()
  if (!$supabase) return
  carregando.value = true
  const { data } = await $supabase
    .from('games')
    .select('id, slug, nome, imagem_url, status, ordem')
    .order('ordem', { ascending: true })
    .order('nome', { ascending: true })
  games.value = (data as GameAdmin[]) ?? []
  carregando.value = false
}

onMounted(carregar)

const noSite = (g: GameAdmin) => g.status !== 'rascunho'

// ---------------------------------------------------------------- reordenar
// Troca com o vizinho e grava ordem 1..n só nas linhas que mudaram. A fila de
// deploy junta cliques seguidos num deploy só (3 min sem pedido novo).
const reordenando = ref(false)

async function mover(indice: number, direcao: -1 | 1) {
  const destino = indice + direcao
  if (reordenando.value || destino < 0 || destino >= games.value.length) return
  const $supabase = await obterSupabase()
  if (!$supabase) return

  const lista = [...games.value]
  const [item] = lista.splice(indice, 1)
  lista.splice(destino, 0, item!)
  const mudancas = lista
    .map((g, i) => ({ g, ordem: i + 1 }))
    .filter(({ g, ordem }) => g.ordem !== ordem)

  reordenando.value = true
  erro.value = ''
  games.value = lista.map((g, i) => ({ ...g, ordem: i + 1 }))

  const agora = new Date().toISOString()
  const resultados = await Promise.all(
    mudancas.map(({ g, ordem }) => $supabase.from('games').update({ ordem, updated_at: agora }).eq('id', g.id)),
  )
  reordenando.value = false

  if (resultados.some((r) => r.error)) {
    erro.value = 'Não foi possível gravar a nova ordem. A lista foi recarregada.'
    await carregar()
    return
  }

  if (mudancas.some(({ g }) => noSite(g))) {
    await dispararDeploy('games reordenados')
  } else {
    avisarSemPublicacao()
  }
}

// ------------------------------------------------------------------ excluir
const modalAberto = ref(false)
const paraExcluir = ref<GameAdmin | null>(null)
const excluindo = ref(false)

function pedirConfirmacao(game: GameAdmin) {
  paraExcluir.value = game
  modalAberto.value = true
}

async function confirmarExclusao() {
  const $supabase = await obterSupabase()
  const game = paraExcluir.value
  if (!game || !$supabase) return
  excluindo.value = true

  const { error } = await $supabase.from('games').delete().eq('id', game.id)

  excluindo.value = false
  modalAberto.value = false

  if (error) {
    erro.value = 'Não foi possível excluir o jogo.'
    console.error('Erro ao excluir jogo:', error)
    return
  }

  // a imagem do jogo sai do bucket junto
  const caminho = caminhoNoBucketGames(game.imagem_url)
  if (caminho) {
    const { error: erroImagem } = await $supabase.storage.from('games').remove([caminho])
    if (erroImagem) console.error('Jogo excluído, mas a imagem ficou no bucket:', erroImagem)
  }

  paraExcluir.value = null
  await carregar()
  if (noSite(game)) {
    await dispararDeploy('game excluido: ' + game.slug)
  } else {
    avisarSemPublicacao()
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <AdminBannerPublicando :status="aviso.status" :previsao-minutos="aviso.previsaoMinutos" @fechar="fecharAviso" />
    <AdminConfirmModal
      :aberto="modalAberto"
      titulo="Excluir jogo?"
      :mensagem="`Tem certeza que quer excluir &quot;${paraExcluir?.nome}&quot;? A imagem dele também será apagada. Essa ação não pode ser desfeita${paraExcluir && noSite(paraExcluir) ? ', e /games será republicada sem esse jogo' : ''}.`"
      :confirmando="excluindo"
      @confirmar="confirmarExclusao"
      @cancelar="modalAberto = false"
    />

    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-serif text-2xl font-bold text-stone-900">Games</h1>
        <p class="text-sm text-stone-500">
          Jogos da página <a href="/games" target="_blank" rel="noopener" class="text-orange-700 hover:underline">/games</a>, na ordem em que aparecem.
        </p>
      </div>
      <NuxtLink
        to="/admin/games/novo"
        class="rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700"
      >
        + Novo jogo
      </NuxtLink>
    </div>

    <p v-if="erro" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ erro }}</p>

    <p v-if="carregando" class="text-stone-500">Carregando...</p>
    <p v-else-if="games.length === 0" class="text-stone-500">Nenhum jogo cadastrado ainda.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th class="px-4 py-3">Ordem</th>
            <th class="px-4 py-3">Jogo</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(game, i) in games" :key="game.id" class="border-t border-stone-100">
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <span class="w-6 tabular-nums text-stone-500">{{ game.ordem }}</span>
                <button
                  type="button"
                  class="rounded px-2 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                  :disabled="i === 0 || reordenando"
                  :aria-label="`Subir ${game.nome}`"
                  @click="mover(i, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="rounded px-2 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                  :disabled="i === games.length - 1 || reordenando"
                  :aria-label="`Descer ${game.nome}`"
                  @click="mover(i, 1)"
                >
                  ↓
                </button>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="game.imagem_url"
                  :src="game.imagem_url"
                  alt=""
                  class="h-10 w-[72px] flex-none rounded object-cover"
                />
                <div v-else class="flex h-10 w-[72px] flex-none items-center justify-center rounded bg-stone-800 text-[10px] font-bold uppercase text-white">
                  sem imagem
                </div>
                <div>
                  <p class="font-medium text-stone-900">{{ game.nome }}</p>
                  <p class="text-xs text-stone-400">{{ game.slug }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-1 text-xs font-semibold" :class="COR_STATUS[game.status]">
                {{ ROTULO_STATUS[game.status] }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <NuxtLink :to="`/admin/games/${game.id}`" class="font-semibold text-orange-700 hover:underline">
                Editar
              </NuxtLink>
              <button
                type="button"
                class="ml-4 font-semibold text-red-600 hover:underline"
                @click="pedirConfirmacao(game)"
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
