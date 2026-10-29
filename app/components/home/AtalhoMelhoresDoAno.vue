<script setup lang="ts">
// Atalho Melhores do Ano (datas em constants/melhores-do-ano.ts).
// Sem salto de layout: no build, se a edição ainda não acabou, a altura do
// atalho fica reservada (o espaço vazio de 72px) e o conteúdo só aparece no
// navegador, já com o texto do dia. Depois do fim da votação, o próximo
// build nem reserva o espaço; entre o fim e esse build, o navegador deixa o
// espaço vazio em vez de mostrar texto vencido.
import { MELHORES_DO_ANO, faseMelhoresDoAno } from '~/constants/melhores-do-ano'

// avaliado no build e levado no payload (useState), para o navegador hidratar
// o mesmo HTML mesmo que a data dele já seja outra
const reservar = useState('melhores-do-ano-reservar', () => faseMelhoresDoAno() !== 'encerrado')
const fase = ref<ReturnType<typeof faseMelhoresDoAno> | null>(null)
onMounted(() => { fase.value = faseMelhoresDoAno() })

const texto = computed(() => (fase.value === 'indicacoes' || fase.value === 'votacao' ? MELHORES_DO_ANO.textos[fase.value] : ''))
</script>

<template>
  <div v-if="reservar" class="min-h-[72px]">
    <a
      v-if="texto"
      :href="MELHORES_DO_ANO.destino"
      class="flex min-h-[72px] items-center gap-3 rounded-mbb-md py-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <span class="flex h-11 w-11 flex-none items-center justify-center rounded-mbb-md bg-brand-tint text-brand-ink">
        <Icon name="lucide:trophy" class="h-5 w-5" aria-hidden="true" />
      </span>
      <span class="flex flex-col gap-0.5">
        <span class="text-[15px] font-bold">{{ MELHORES_DO_ANO.titulo }}</span>
        <span class="text-[13px] text-ink-muted">{{ texto }}</span>
      </span>
    </a>
  </div>
</template>
