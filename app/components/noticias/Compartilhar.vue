<script setup lang="ts">
// Compartilhamento da matéria (redesign, fase 3): WhatsApp primeiro (é onde
// o bairro conversa), Facebook e copiar o link. Sempre a URL da produção,
// mesmo na prévia -- é o endereço canônico da matéria.
const props = defineProps<{ titulo: string; caminho: string }>()

const url = `https://meubairroburitis.com.br${props.caminho}`
const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${props.titulo} ${url}`)}`
const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

const copiado = ref(false)
async function copiar() {
  try {
    await navigator.clipboard.writeText(url)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2500)
  } catch {
    // navegador sem permissão de área de transferência: abre o link para copiar à mão
    window.prompt('Copie o link da matéria:', url)
  }
}

const botao = 'inline-flex min-h-[44px] items-center gap-2 rounded-mbb-md border border-line bg-white px-3.5 text-sm font-bold text-ink transition-colors hover:border-ink-muted hover:bg-ground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="mr-1 text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">Compartilhe</span>
    <a :href="whatsapp" target="_blank" rel="noopener noreferrer" :class="botao">
      <Icon name="simple-icons:whatsapp" class="h-[18px] w-[18px] text-success-ink" aria-hidden="true" />
      WhatsApp<span class="sr-only"> (abre em nova aba)</span>
    </a>
    <a :href="facebook" target="_blank" rel="noopener noreferrer" :class="botao">
      <Icon name="simple-icons:facebook" class="h-[18px] w-[18px] text-[#1877F2]" aria-hidden="true" />
      Facebook<span class="sr-only"> (abre em nova aba)</span>
    </a>
    <button type="button" :class="botao" @click="copiar">
      <Icon :name="copiado ? 'lucide:check' : 'lucide:link'" class="h-[18px] w-[18px]" aria-hidden="true" />
      {{ copiado ? 'Link copiado' : 'Copiar link' }}
    </button>
    <span class="sr-only" aria-live="polite">{{ copiado ? 'Link da matéria copiado' : '' }}</span>
  </div>
</template>
