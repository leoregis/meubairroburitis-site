<script setup lang="ts">
// Horário de funcionamento (redesign, fase 4). O dia de hoje e o "aberto
// agora" são calculados NO NAVEGADOR, no fuso de BH: o site é estático e o
// valor do build ficaria vencido. Sem salto de layout: o selo tem altura
// reservada e o destaque do dia só muda cor e fundo, não o tamanho.
// A regra de "aberto" é a mesma da RPC buscar_empresa_publica_seo (inclui o
// horário que passa da meia-noite e abertura = fechamento como 24h no dia).
import type { HorarioEmpresa } from '~/composables/useEmpresasPrestadores'
import { nomeDiaSemana, formatarHora } from '~/composables/useEmpresasPrestadores'

const props = defineProps<{ horarios: HorarioEmpresa[]; funciona24h: boolean }>()

const hoje = ref<number | null>(null)
const aberto = ref<boolean | null>(null)

function minutos(hora: string | null) {
  if (!hora) return null
  const [h, m] = hora.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

onMounted(() => {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date())
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.find((p) => p.type === 'weekday')?.value ?? '')
  const agora = (Number(partes.find((p) => p.type === 'hour')?.value) % 24) * 60 + Number(partes.find((p) => p.type === 'minute')?.value)
  hoje.value = dia
  if (props.funciona24h) { aberto.value = true; return }
  const ontem = (dia + 6) % 7
  aberto.value = props.horarios.some((h) => {
    if (h.fechado) return false
    const a = minutos(h.hora_abertura)
    const f = minutos(h.hora_fechamento)
    if (a === null || f === null) return false
    if (h.dia_semana === dia && a === f) return true
    if (h.dia_semana === dia && a < f) return agora >= a && agora <= f
    if (h.dia_semana === dia && a > f) return agora >= a
    if (h.dia_semana === ontem && a > f) return agora <= f
    return false
  })
})
</script>

<template>
  <section aria-labelledby="horario-titulo" class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
      <h2 id="horario-titulo" class="m-0 text-xl font-extrabold tracking-[-0.015em] text-ink">Horário de funcionamento</h2>
      <!-- altura reservada: o selo só aparece depois de calcular a hora local -->
      <span class="inline-flex min-h-[28px] min-w-[112px] justify-end">
        <span
          v-if="aberto !== null"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          :class="aberto ? 'bg-success-tint text-success-ink' : 'bg-chip text-ink-muted'"
        >
          <span class="h-2 w-2 rounded-full" :class="aberto ? 'bg-success' : 'bg-ink-muted'" aria-hidden="true" />
          {{ funciona24h ? 'Aberto 24 horas' : aberto ? 'Aberto agora' : 'Fechado agora' }}
        </span>
      </span>
    </div>
    <ul class="m-0 list-none p-0 text-[15px]">
      <li
        v-for="h in horarios"
        :key="h.dia_semana"
        class="flex justify-between rounded-mbb-sm px-3 py-2"
        :class="h.dia_semana === hoje ? 'bg-ground font-bold text-ink' : 'text-ink-muted'"
        :aria-current="h.dia_semana === hoje ? 'date' : undefined"
      >
        <span>{{ nomeDiaSemana(h.dia_semana) }}<span v-if="h.dia_semana === hoje" class="sr-only"> (hoje)</span></span>
        <span v-if="h.fechado">Fechado</span>
        <span v-else>{{ formatarHora(h.hora_abertura) }} – {{ formatarHora(h.hora_fechamento) }}</span>
      </li>
    </ul>
  </section>
</template>
