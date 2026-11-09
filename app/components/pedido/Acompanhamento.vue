<script setup lang="ts">
// Acompanhamento do pedido pelo cliente (/pedido/<token>). Os dados vêm da
// projeção mínima que a Central manda ao banco do site (acompanhamento_receber);
// aqui só se lê pelo token (acompanhamento_por_link). Os textos de cada
// situação ficam aqui: a Central manda só o código.
// Em /meus-pedidos o pedido já vem da lista (meus_pedidos_listar), em `dados`.
import type { Entrega, PedidoAcompanhamento } from '~/types/acompanhamento'

const props = defineProps<{ token?: string, dados?: PedidoAcompanhamento }>()

const config = useRuntimeConfig()
const obterSupabase = useSupabaseSite()
const carregando = ref(true)
const falhou = ref(false)
const pedido = ref<PedidoAcompanhamento | null>(null)

async function carregar() {
  const $supabase = await obterSupabase()
  if (props.dados) {
    pedido.value = { ...props.dados, encontrado: true, disponivel: !props.dados.expirado }
    carregando.value = false
    return
  }
  carregando.value = true
  falhou.value = false
  const { data, error } = await $supabase.rpc('acompanhamento_por_link', { p_token: props.token })
  if (error) falhou.value = true
  else pedido.value = data as PedidoAcompanhamento
  carregando.value = false
}
onMounted(carregar)

// Situação da entrega -> texto para o cliente e tom do selo.
const SITUACOES: Record<string, { rotulo: string, tom: 'acao' | 'feito' | 'andamento' | 'neutro' }> = {
  aguardando_material: { rotulo: 'Aguardando seu material', tom: 'acao' },
  aguardando_aprovacao: { rotulo: 'Aguardando sua aprovação', tom: 'acao' },
  ajustes: { rotulo: 'Fazendo os ajustes', tom: 'andamento' },
  gravacao_marcada: { rotulo: 'Gravação marcada', tom: 'andamento' },
  em_producao: { rotulo: 'Em produção', tom: 'andamento' },
  pronta: { rotulo: 'Pronto para publicar', tom: 'andamento' },
  agendada: { rotulo: 'Publicação prevista', tom: 'andamento' },
  em_andamento: { rotulo: 'Em andamento', tom: 'andamento' },
  publicada: { rotulo: 'Publicado', tom: 'feito' },
  concluida: { rotulo: 'Concluído', tom: 'feito' },
  cancelada: { rotulo: 'Cancelado', tom: 'neutro' },
  devolvida: { rotulo: 'Crédito devolvido', tom: 'neutro' },
}
const situacao = (s: string) => SITUACOES[s] ?? { rotulo: 'Em andamento', tom: 'andamento' as const }
const TONS = {
  acao: 'bg-amber-100 text-amber-900',
  andamento: 'bg-orange-50 text-orange-800',
  feito: 'bg-emerald-50 text-emerald-800',
  neutro: 'bg-stone-100 text-stone-600',
}
const PONTOS = { acao: 'bg-amber-500', andamento: 'bg-orange-500', feito: 'bg-emerald-600', neutro: 'bg-stone-400' }

const FUSO = 'America/Sao_Paulo'
const dataCurta = (v: string) => new Date(v.length === 10 ? `${v}T12:00:00Z` : v)
  .toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' })
const hora = (v: string) => new Date(v).toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
const quando = (v: string, comHorario: boolean) => (comHorario ? `${dataCurta(v)} às ${hora(v)}` : dataCurta(v))

// Linha de data embaixo do selo, conforme a situação.
function detalhe(e: Entrega): string | null {
  if (e.situacao === 'publicada' && e.publicado_em) return `em ${dataCurta(e.publicado_em)}`
  if (e.situacao === 'gravacao_marcada' && e.gravacao_para) return `para ${quando(e.gravacao_para, e.gravacao_com_horario)}`
  if (e.previsto_para && ['agendada', 'pronta', 'aguardando_material', 'aguardando_aprovacao', 'ajustes', 'em_producao'].includes(e.situacao)) {
    return `publicação prevista para ${quando(e.previsto_para, e.com_horario)}`
  }
  if (e.situacao === 'em_andamento' && e.material_recebido_em) return `material recebido em ${dataCurta(e.material_recebido_em)}`
  return null
}

const situacaoGeral = computed(() => {
  if (pedido.value?.pagamento_estornado) return { rotulo: 'Pagamento estornado', classe: TONS.neutro }
  if (pedido.value?.cancelado) return { rotulo: 'Pedido cancelado', classe: TONS.neutro }
  if (pedido.value?.aguardando_registro) return { rotulo: 'Pagamento confirmado', classe: TONS.feito }
  if (pedido.value?.em_aberto) return { rotulo: 'Em andamento', classe: TONS.andamento }
  return { rotulo: 'Concluído', classe: TONS.feito }
})
const linkWhatsapp = computed(() => {
  const texto = pedido.value?.numero ? `Olá! Sobre o meu pedido nº ${pedido.value.numero}:` : 'Olá! Sobre o meu pedido:'
  return `https://wa.me/${config.public.whatsappNumero}?text=${encodeURIComponent(texto)}`
})
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-10 sm:py-14">
    <div v-if="carregando" class="space-y-4" aria-busy="true" aria-label="Carregando o pedido">
      <div class="h-6 w-40 animate-pulse rounded bg-line" />
      <div class="h-9 w-64 animate-pulse rounded bg-line" />
      <div class="h-40 animate-pulse rounded-mbb-xl bg-chip" />
    </div>

    <div v-else-if="falhou" class="text-center">
      <h1 class="text-2xl font-bold text-ink">Não conseguimos abrir o pedido agora</h1>
      <p class="mt-3 text-ink-muted">Confira sua conexão e tente de novo.</p>
      <button
        type="button"
        class="mt-6 rounded-mbb-md bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-deep"
        @click="carregar"
      >
        Tentar de novo
      </button>
    </div>

    <div v-else-if="!pedido?.encontrado || !pedido.disponivel" class="text-center">
      <h1 class="text-2xl font-bold text-ink">
        {{ pedido?.expirado ? 'Este acompanhamento foi encerrado' : 'Link de acompanhamento indisponível' }}
      </h1>
      <p class="mt-3 text-ink-muted">
        {{ pedido?.expirado
          ? 'O pedido terminou há mais de 90 dias.'
          : 'O link pode ter sido trocado ou pausado. Fale com a gente para receber o link atualizado.' }}
      </p>
      <a
        :href="linkWhatsapp"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-6 inline-block rounded-mbb-md bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-deep"
      >
        Falar no WhatsApp
      </a>
    </div>

    <template v-else>
      <header>
        <p class="text-sm font-semibold uppercase tracking-wide text-brand-ink">Acompanhe seu pedido</p>
        <h1 class="mt-2 text-3xl font-bold text-ink">{{ pedido.numero ? `Pedido nº ${pedido.numero}` : 'Seu pedido' }}</h1>
        <p class="mt-2 text-ink-muted">
          {{ pedido.empresa }}<span v-if="pedido.empresa && pedido.data"> · </span><span v-if="pedido.data">{{ pedido.empresa ? '' : 'Pago em ' }}{{ dataCurta(pedido.data) }}</span>
        </p>
        <p class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span class="rounded-full px-3 py-1 font-semibold" :class="situacaoGeral.classe">{{ situacaoGeral.rotulo }}</span>
          <span v-if="pedido.atualizado_em" class="text-ink-muted">Atualizado em {{ dataCurta(pedido.atualizado_em) }} às {{ hora(pedido.atualizado_em) }}</span>
        </p>
      </header>

      <p v-if="pedido.pagamento_estornado" class="mt-6 rounded-mbb-xl border border-line bg-ground p-4 text-sm text-ink">
        O pagamento deste pedido foi estornado ou cancelado no Mercado Pago. Se tiver dúvida, fale com a gente pelo WhatsApp.
      </p>
      <p v-else-if="pedido.aguardando_registro" class="mt-6 rounded-mbb-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Recebemos o seu pagamento. Em breve falamos com você para combinar as datas, e cada etapa aparece aqui.
      </p>

      <section
        v-for="(item, i) in pedido.itens"
        :key="i"
        class="mt-8 rounded-mbb-xl border border-line bg-white p-5 sm:p-6"
        :aria-label="item.produto"
      >
        <h2 class="text-lg font-bold text-ink">
          <span v-if="item.quantidade > 1">{{ item.quantidade }}× </span>{{ item.produto }}
        </h2>

        <ol v-if="item.entregas.length" class="mt-5">
          <li
            v-for="(e, j) in item.entregas"
            :key="j"
            class="relative flex gap-4"
            :class="j < item.entregas.length - 1 ? 'pb-6' : ''"
          >
            <div class="flex flex-col items-center">
              <span class="mt-1.5 h-3 w-3 flex-none rounded-full" :class="PONTOS[situacao(e.situacao).tom]" />
              <span v-if="j < item.entregas.length - 1" class="mt-1 w-px flex-1 bg-line" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-ink">
                {{ e.tipo }}<span v-if="e.quantidade > 1" class="font-normal text-ink-muted"> ({{ e.quantidade }})</span>
              </p>
              <p class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span class="rounded-full px-2.5 py-0.5 font-semibold" :class="TONS[situacao(e.situacao).tom]">{{ situacao(e.situacao).rotulo }}</span>
                <span v-if="detalhe(e)" class="text-ink-muted">{{ detalhe(e) }}</span>
              </p>
              <a
                v-if="e.aprovacao_link"
                :href="e.aprovacao_link"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-mbb-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                Ver o material para aprovar
                <Icon name="lucide:arrow-up-right" class="h-4 w-4" />
              </a>
              <ul v-if="e.publicacoes.length" class="mt-2 flex flex-wrap gap-x-4">
                <li v-for="(p, k) in e.publicacoes" :key="k">
                  <a
                    :href="p.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-brand-ink underline underline-offset-4 hover:text-brand-deep"
                  >
                    {{ p.canal ? `Ver publicação no ${p.canal}` : 'Ver publicação' }}
                    <Icon name="lucide:arrow-up-right" class="h-3.5 w-3.5" />
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ol>

        <p
          v-if="item.a_agendar > 0 && !pedido.cancelado && !pedido.pagamento_estornado"
          class="text-sm text-ink-muted"
          :class="item.entregas.length ? 'mt-5 border-t border-line pt-4' : 'mt-3'"
        >
          <span class="font-semibold text-ink">Aguardando agendamento:</span>
          {{ item.a_agendar }} {{ item.a_agendar === 1 ? 'entrega' : 'entregas' }}. Vamos combinar as datas com você.
        </p>
      </section>

      <div class="mt-8 rounded-mbb-xl border border-line bg-ground p-5 text-center sm:p-6">
        <p class="text-sm text-ink-muted">Alguma dúvida sobre o pedido?</p>
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

      <p v-if="token" class="mt-6 text-center">
        <NuxtLink
          to="/meus-pedidos"
          class="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-brand-ink underline underline-offset-4 hover:text-brand-deep"
        >
          Ver todos os seus pedidos
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </p>
    </template>
  </div>
</template>
