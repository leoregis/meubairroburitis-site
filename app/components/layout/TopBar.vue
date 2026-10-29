<script setup lang="ts">
// Barra superior fina (só computador/tablet): data, redes, Anuncie e Meus
// pedidos. No celular, Anuncie fica no cabeçalho e o resto no menu.
import { LINK_ANUNCIE, LINK_MEUS_PEDIDOS, redesOficiais } from '~/constants/navegacao'

const config = useRuntimeConfig()
const redes = redesOficiais(config.public.whatsappNumero).slice(0, 3)

// A data é montada no navegador: o site é estático, e renderizada no build
// ela mostraria o dia do último deploy.
const hoje = ref('')
onMounted(() => {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  }).format(new Date())
  hoje.value = texto.charAt(0).toUpperCase() + texto.slice(1)
})

const linkClasses = 'inline-flex min-h-[32px] items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
</script>

<template>
  <nav aria-label="Atalhos e redes" class="hidden border-b border-line bg-ground px-6 lg:block">
    <div class="mx-auto flex min-h-10 max-w-site flex-wrap items-center justify-between gap-x-5 gap-y-1 text-xs text-ink-muted">
      <p class="m-0 font-semibold">
        <span v-if="hoje">{{ hoje }} · </span>Belo Horizonte
      </p>
      <ul class="m-0 flex list-none flex-wrap items-center gap-x-[18px] p-0">
        <li v-for="rede in redes" :key="rede.label">
          <a :href="rede.href" target="_blank" rel="noopener noreferrer" class="font-semibold hover:text-ink hover:underline" :class="linkClasses">
            {{ rede.label }}<span class="sr-only"> (abre em nova aba)</span>
          </a>
        </li>
        <li>
          <NuxtLink :to="LINK_ANUNCIE.to" class="font-bold text-brand-ink hover:text-brand-deep hover:underline" :class="linkClasses">
            {{ LINK_ANUNCIE.label }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="LINK_MEUS_PEDIDOS.to" class="font-bold text-ink hover:underline" :class="linkClasses">
            {{ LINK_MEUS_PEDIDOS.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
