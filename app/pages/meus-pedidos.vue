<script setup lang="ts">
// "Meus pedidos" (projeto Meus pedidos, fatia 3): o cliente entra com o celular
// e um código de 6 dígitos que chega pelo WhatsApp, e vê todos os pedidos daquele
// número (do site e das vendas da Central). Sessão própria (meus_pedidos_sessoes,
// 30 dias), não é login do Supabase: não mexe na sessão do admin no mesmo navegador.
import type { PedidoDaLista } from '~/types/acompanhamento'

definePageMeta({ ssr: false })

// noindex explícito: rota client-only, o robots:false de routeRules não chega
// ao HTML (ver carrinho.vue).
useSeoMeta({ title: 'Meus pedidos — Meu Bairro Buritis', robots: 'noindex' })
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const obterSupabase = useSupabaseSite()

const CHAVE_SESSAO = 'mbb-meus-pedidos-sessao'
interface SessaoSalva { sessao: string, expira_em: string, telefone_final: string }

function lerSessao(): SessaoSalva | null {
  try {
    const salva = JSON.parse(localStorage.getItem(CHAVE_SESSAO) ?? 'null') as SessaoSalva | null
    if (!salva?.sessao || new Date(salva.expira_em) <= new Date()) return null
    return salva
  } catch {
    return null
  }
}
function gravarSessao(s: SessaoSalva | null) {
  try {
    if (s) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s))
    else localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    // sem armazenamento (aba anônima, bloqueio): a sessão vale só nesta visita
  }
}
// o celular que o comprador já usou no carrinho (mesma chave de carrinho.vue)
function celularDoCarrinho(): string {
  try {
    return JSON.parse(localStorage.getItem('mbb-comprador-dados') ?? '{}')?.telefone ?? ''
  } catch {
    return ''
  }
}

type Etapa = 'carregando' | 'telefone' | 'codigo' | 'lista'
const etapa = ref<Etapa>('carregando')
const sessao = ref<SessaoSalva | null>(null)
const telefone = ref('')
const codigo = ref('')
const enviando = ref(false)
const erro = ref<string | null>(null)
const aviso = ref<string | null>(null)
const pedidos = ref<PedidoDaLista[]>([])
const falhouLista = ref(false)

// reenviar só depois de 60 s
const espera = ref(0)
let relogio: ReturnType<typeof setInterval> | null = null
function iniciarEspera() {
  espera.value = 60
  if (relogio) clearInterval(relogio)
  relogio = setInterval(() => {
    espera.value -= 1
    if (espera.value <= 0 && relogio) {
      clearInterval(relogio)
      relogio = null
    }
  }, 1000)
}
onBeforeUnmount(() => { if (relogio) clearInterval(relogio) })

async function enviarCodigo() {
  erro.value = null
  aviso.value = null
  if (usePrevia().ehPrevia) {
    erro.value = AVISO_PREVIA
    return
  }
  if (telefone.value.replace(/\D/g, '').length < 10) {
    erro.value = 'Digite o celular com DDD.'
    return
  }
  enviando.value = true
  try {
    await $fetch(`${config.public.supabaseUrl}/functions/v1/meus_pedidos_codigo`, {
      method: 'POST',
      headers: { apikey: config.public.supabaseAnonKey, Authorization: `Bearer ${config.public.supabaseAnonKey}` },
      body: { telefone: telefone.value },
    })
    codigo.value = ''
    etapa.value = 'codigo'
    iniciarEspera()
  } catch (e: unknown) {
    const dados = (e as { data?: { erro?: string, minutos?: number } })?.data
    if (dados?.erro === 'telefone_invalido') erro.value = 'Confira o número: digite o celular com DDD.'
    else if (dados?.erro === 'limite') {
      erro.value = `Muitos pedidos de código para este número. Tente de novo em ${dados.minutos ?? 15} ${dados.minutos === 1 ? 'minuto' : 'minutos'}.`
    } else erro.value = 'Não conseguimos pedir o código agora. Confira sua conexão e tente de novo.'
  } finally {
    enviando.value = false
  }
}

async function entrar() {
  const $supabase = await obterSupabase()
  erro.value = null
  if (!/^\d{6}$/.test(codigo.value)) {
    erro.value = 'O código tem 6 números.'
    return
  }
  enviando.value = true
  const { data, error } = await $supabase.rpc('meus_pedidos_validar_codigo', { p_telefone: telefone.value, p_codigo: codigo.value })
  enviando.value = false
  if (error) {
    erro.value = 'Não conseguimos conferir o código agora. Tente de novo.'
    return
  }
  if (!data.ok) {
    codigo.value = ''
    if (data.motivo === 'incorreto') {
      erro.value = `Código incorreto. ${data.tentativas_restantes === 1 ? 'Resta 1 tentativa' : `Restam ${data.tentativas_restantes} tentativas`}.`
    } else if (data.motivo === 'tentativas') erro.value = 'Código incorreto várias vezes. Peça um código novo.'
    else erro.value = 'Este código não vale mais (ele dura 10 minutos). Peça um código novo.'
    return
  }
  sessao.value = { sessao: data.sessao, expira_em: data.expira_em, telefone_final: data.telefone_final }
  gravarSessao(sessao.value)
  await carregarLista()
}

async function carregarLista() {
  const $supabase = await obterSupabase()
  if (!sessao.value) return
  falhouLista.value = false
  const { data, error } = await $supabase.rpc('meus_pedidos_listar', { p_sessao: sessao.value.sessao })
  if (error) {
    falhouLista.value = true
    etapa.value = 'lista'
    return
  }
  if (!data.ok) {
    sair(false)
    aviso.value = 'Sua sessão terminou. Entre de novo com o seu celular.'
    return
  }
  sessao.value.telefone_final = data.telefone_final
  pedidos.value = data.pedidos as PedidoDaLista[]
  aba.value = pedidos.value.some(emAndamento) || !pedidos.value.length ? 'andamento' : 'historico'
  etapa.value = 'lista'
}

async function sair(noServidor = true) {
  const $supabase = await obterSupabase()
  const atual = sessao.value
  sessao.value = null
  gravarSessao(null)
  pedidos.value = []
  codigo.value = ''
  erro.value = null
  etapa.value = 'telefone'
  if (route.query.pedido) router.replace({ query: {} })
  if (noServidor && atual) await $supabase.rpc('meus_pedidos_sair', { p_sessao: atual.sessao })
}

// só números; com os 6 digitados (ou colados/sugeridos pelo celular), entra sozinho
function aoDigitarCodigo() {
  codigo.value = codigo.value.replace(/\D/g, '').slice(0, 6)
  if (codigo.value.length === 6 && !enviando.value) entrar()
}

function trocarNumero() {
  erro.value = null
  codigo.value = ''
  etapa.value = 'telefone'
}

onMounted(async () => {
  telefone.value = celularDoCarrinho()
  sessao.value = lerSessao()
  if (sessao.value) await carregarLista()
  else etapa.value = 'telefone'
})

// ---------------------------------------------------------------------------
// lista
// ---------------------------------------------------------------------------
const emAndamento = (p: PedidoDaLista) =>
  !p.antigo && !p.expirado && !!p.em_aberto && !p.cancelado && !p.pagamento_estornado
const aba = ref<'andamento' | 'historico'>('andamento')
const andamento = computed(() => pedidos.value.filter(emAndamento))
const historico = computed(() => pedidos.value.filter((p) => !emAndamento(p)))
const visiveis = computed(() => (aba.value === 'andamento' ? andamento.value : historico.value))

const selecionado = computed(() =>
  typeof route.query.pedido === 'string' ? pedidos.value.find((p) => p.ref === route.query.pedido) ?? null : null,
)
function abrir(p: PedidoDaLista) {
  router.push({ query: { pedido: p.ref } })
}
function voltar() {
  if (window.history.state?.back) router.back()
  else router.replace({ query: {} })
}

const FUSO = 'America/Sao_Paulo'
const dataCompleta = (v: string) => new Date(v.length === 10 ? `${v}T12:00:00Z` : v)
  .toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', year: 'numeric' })

function titulo(p: PedidoDaLista) {
  if (p.numero) return `Pedido nº ${p.numero}`
  const nomes = (p.itens ?? []).map((i) => (i.quantidade > 1 ? `${i.quantidade}× ${i.produto}` : i.produto))
  if (!nomes.length) return 'Pedido'
  return nomes.length > 2 ? `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}` : nomes.join(' e ')
}
function produtos(p: PedidoDaLista) {
  if (!p.numero) return null
  return (p.itens ?? []).map((i) => i.produto).join(', ') || null
}

const TONS = {
  acao: 'bg-amber-100 text-amber-900',
  andamento: 'bg-orange-50 text-orange-800',
  feito: 'bg-emerald-50 text-emerald-800',
  neutro: 'bg-stone-100 text-stone-600',
}
function situacao(p: PedidoDaLista) {
  if (p.pagamento_estornado) return { rotulo: 'Pagamento estornado', classe: TONS.neutro }
  if (p.cancelado) return { rotulo: 'Pedido cancelado', classe: TONS.neutro }
  if (p.antigo || p.aguardando_registro) return { rotulo: 'Pagamento confirmado', classe: TONS.feito }
  if (p.expirado) return { rotulo: 'Concluído', classe: TONS.feito }
  if (p.em_aberto) return { rotulo: 'Em andamento', classe: TONS.andamento }
  return { rotulo: 'Concluído', classe: TONS.feito }
}
// o que depende do cliente agora (material ou aprovação)
function suaVez(p: PedidoDaLista): string | null {
  if (!emAndamento(p)) return null
  const entregas = (p.itens ?? []).flatMap((i) => i.entregas)
  if (entregas.some((e) => e.situacao === 'aguardando_aprovacao')) return 'Aguardando sua aprovação'
  if (entregas.some((e) => e.situacao === 'aguardando_material')) return 'Aguardando seu material'
  return null
}
const podeAbrir = (p: PedidoDaLista) => !p.antigo && !p.expirado

const linkWhatsapp = `https://wa.me/${config.public.whatsappNumero}?text=${encodeURIComponent('Olá! Tenho uma dúvida sobre um pedido:')}`
</script>

<template>
  <div v-if="etapa === 'lista' && selecionado">
    <div class="mx-auto max-w-xl px-4 pt-6">
      <button
        type="button"
        class="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-brand-ink hover:text-brand-deep"
        @click="voltar"
      >
        <Icon name="lucide:arrow-left" class="h-4 w-4" />
        Meus pedidos
      </button>
    </div>
    <PedidoAcompanhamento :key="selecionado.ref" :dados="selecionado" />
  </div>

  <div v-else class="mx-auto max-w-xl px-4 py-10 sm:py-14">
    <div v-if="etapa === 'carregando'" class="space-y-4" aria-busy="true" aria-label="Carregando seus pedidos">
      <div class="h-9 w-56 animate-pulse rounded bg-line" />
      <div class="h-28 animate-pulse rounded-mbb-xl bg-chip" />
      <div class="h-28 animate-pulse rounded-mbb-xl bg-chip" />
    </div>

    <!-- 1. celular -->
    <template v-else-if="etapa === 'telefone'">
      <h1 class="text-3xl font-bold text-ink">Meus pedidos</h1>
      <p class="mt-3 text-ink-muted">
        Entre com o celular usado na compra. Enviamos um código pelo WhatsApp para você ver todos os seus pedidos.
      </p>
      <p v-if="aviso" class="mt-6 rounded-mbb-xl border border-line bg-ground p-4 text-sm text-ink" role="status">{{ aviso }}</p>

      <form class="mt-8" novalidate @submit.prevent="enviarCodigo">
        <label for="mp-telefone" class="block text-sm font-semibold text-ink">Celular (WhatsApp) com DDD</label>
        <input
          id="mp-telefone"
          v-model="telefone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="(31) 99999-9999"
          class="mt-2 block min-h-[48px] w-full rounded-mbb-lg border border-line bg-white px-4 text-lg text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ink/30"
          :aria-invalid="!!erro"
          :aria-describedby="erro ? 'mp-erro' : undefined"
        >
        <p v-if="erro" id="mp-erro" class="mt-2 text-sm font-medium text-red-700" role="alert">{{ erro }}</p>
        <button
          type="submit"
          :disabled="enviando"
          class="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-mbb-md bg-brand px-6 font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
        >
          <Icon name="lucide:message-circle" class="h-5 w-5" />
          {{ enviando ? 'Enviando...' : 'Enviar código pelo WhatsApp' }}
        </button>
      </form>
      <p class="mt-6 text-sm text-ink-muted">
        Tem o link de acompanhamento que mandamos por e-mail ou WhatsApp? Ele continua funcionando sem código.
      </p>
    </template>

    <!-- 2. código -->
    <template v-else-if="etapa === 'codigo'">
      <h1 class="text-3xl font-bold text-ink">Digite o código</h1>
      <p class="mt-3 text-ink-muted">
        Se o número <span class="font-semibold text-ink">{{ telefone }}</span> tiver pedidos, você recebe agora um
        código de 6 números no WhatsApp. Ele vale por 10 minutos.
      </p>

      <form class="mt-8" novalidate @submit.prevent="entrar">
        <label for="mp-codigo" class="block text-sm font-semibold text-ink">Código</label>
        <input
          id="mp-codigo"
          v-model="codigo"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="\d{6}"
          maxlength="6"
          placeholder="000000"
          class="mt-2 block min-h-[48px] w-full rounded-mbb-lg border border-line bg-white px-4 text-center font-mono text-2xl tracking-[0.4em] text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-ink/30"
          :aria-invalid="!!erro"
          :aria-describedby="erro ? 'mp-erro' : undefined"
          @input="aoDigitarCodigo"
        >
        <p v-if="erro" id="mp-erro" class="mt-2 text-sm font-medium text-red-700" role="alert">{{ erro }}</p>
        <button
          type="submit"
          :disabled="enviando"
          class="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-mbb-md bg-brand px-6 font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
        >
          {{ enviando ? 'Conferindo...' : 'Entrar' }}
        </button>
      </form>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <button
          type="button"
          :disabled="espera > 0 || enviando"
          class="inline-flex min-h-[44px] items-center font-semibold text-brand-ink hover:text-brand-deep disabled:font-normal disabled:text-ink-muted"
          @click="enviarCodigo"
        >
          {{ espera > 0 ? `Reenviar código em ${espera} s` : 'Reenviar código' }}
        </button>
        <button type="button" class="inline-flex min-h-[44px] items-center text-ink-muted underline underline-offset-4 hover:text-ink" @click="trocarNumero">
          Trocar número
        </button>
      </div>
      <p class="mt-6 text-sm text-ink-muted">
        Não chegou? Confira se é o mesmo número usado na compra. Se precisar,
        <a :href="linkWhatsapp" target="_blank" rel="noopener noreferrer" class="font-semibold text-brand-ink underline underline-offset-4">fale com a gente</a>.
      </p>
    </template>

    <!-- 3. lista -->
    <template v-else>
      <header class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h1 class="text-3xl font-bold text-ink">Meus pedidos</h1>
          <p v-if="sessao" class="mt-1 text-sm text-ink-muted">Celular final {{ sessao.telefone_final }}</p>
        </div>
        <button
          type="button"
          class="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
          @click="sair()"
        >
          <Icon name="lucide:log-out" class="h-4 w-4" />
          Sair
        </button>
      </header>

      <div v-if="falhouLista" class="mt-10 text-center">
        <p class="text-ink-muted">Não conseguimos carregar seus pedidos agora.</p>
        <button
          type="button"
          class="mt-4 rounded-mbb-md bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-deep"
          @click="carregarLista"
        >
          Tentar de novo
        </button>
      </div>

      <template v-else>
        <div class="mt-8 flex gap-1 rounded-full bg-chip p-1" role="tablist" aria-label="Pedidos">
          <button
            v-for="opcao in ([['andamento', 'Em andamento', andamento.length], ['historico', 'Histórico', historico.length]] as const)"
            :key="opcao[0]"
            type="button"
            role="tab"
            :aria-selected="aba === opcao[0]"
            class="min-h-[44px] flex-1 rounded-full px-4 text-sm font-semibold"
            :class="aba === opcao[0] ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'"
            @click="aba = opcao[0]"
          >
            {{ opcao[1] }} <span class="font-normal text-ink-muted">({{ opcao[2] }})</span>
          </button>
        </div>

        <p v-if="!visiveis.length" class="mt-8 rounded-mbb-xl border border-line bg-ground p-5 text-center text-sm text-ink-muted">
          {{ !pedidos.length
            ? 'Não encontramos pedidos para este número.'
            : aba === 'andamento' ? 'Nenhum pedido em andamento. Os anteriores estão no Histórico.' : 'Nada no histórico ainda.' }}
        </p>

        <ul v-else class="mt-6 space-y-4">
          <li v-for="p in visiveis" :key="p.ref" class="rounded-mbb-xl border border-line bg-white p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-lg font-bold text-ink">{{ titulo(p) }}</h2>
                <p class="mt-1 text-sm text-ink-muted">
                  {{ p.empresa }}<span v-if="p.empresa && p.data"> · </span><span v-if="p.data">{{ p.antigo || p.aguardando_registro ? 'Pago em ' : '' }}{{ dataCompleta(p.data) }}</span>
                </p>
                <p v-if="produtos(p)" class="mt-1 truncate text-sm text-ink-muted">{{ produtos(p) }}</p>
              </div>
              <span class="flex-none rounded-full px-3 py-1 text-xs font-semibold" :class="situacao(p).classe">{{ situacao(p).rotulo }}</span>
            </div>

            <p v-if="suaVez(p)" class="mt-3 flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold" :class="TONS.acao">
              <Icon name="lucide:bell" class="h-4 w-4" />
              {{ suaVez(p) }}
            </p>
            <p v-if="p.antigo" class="mt-3 text-sm text-ink-muted">
              Pedido anterior ao acompanhamento online. Dúvidas sobre ele? Fale com a gente pelo WhatsApp.
            </p>
            <p v-else-if="p.expirado" class="mt-3 text-sm text-ink-muted">Pedido encerrado há mais de 90 dias.</p>

            <button
              v-if="podeAbrir(p)"
              type="button"
              class="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-mbb-md border border-brand px-5 text-sm font-semibold text-brand-ink hover:bg-brand-tint"
              @click="abrir(p)"
            >
              Ver detalhes
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </button>
          </li>
        </ul>

        <div class="mt-8 rounded-mbb-xl border border-line bg-ground p-5 text-center sm:p-6">
          <p class="text-sm text-ink-muted">Alguma dúvida sobre um pedido?</p>
          <a
            :href="linkWhatsapp"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-mbb-md bg-brand px-6 font-semibold text-white hover:bg-brand-deep"
          >
            <Icon name="lucide:message-circle" class="h-5 w-5" />
            Falar no WhatsApp
          </a>
        </div>
      </template>
    </template>
  </div>
</template>
