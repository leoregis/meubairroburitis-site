<script setup lang="ts">
// Plano Imobiliário: cartão sem checkout (contrato cobrado pelo Asaas, fora do
// carrinho). Dados em constants/anuncie.ts; o botão abre o WhatsApp da loja.
import { PLANO_IMOBILIARIO } from '~/constants/anuncie'

const config = useRuntimeConfig()
const linkWhatsapp = `https://wa.me/${config.public.whatsappNumero}?text=${encodeURIComponent(PLANO_IMOBILIARIO.mensagemWhatsapp)}`
</script>

<template>
  <article class="flex flex-col gap-4 rounded-mbb-xl border border-line bg-ground p-5 sm:p-7">
    <div class="flex flex-col gap-1">
      <h3 class="m-0 flex items-center gap-2 text-xl font-extrabold tracking-[-0.015em] text-ink sm:text-2xl">
        <Icon name="lucide:building-2" class="h-6 w-6 flex-none text-brand-ink" aria-hidden="true" />
        {{ PLANO_IMOBILIARIO.nome }}
      </h3>
      <p class="m-0 text-sm leading-[21px] text-ink-muted">{{ PLANO_IMOBILIARIO.publico }}</p>
    </div>
    <p class="m-0 flex items-baseline gap-1.5">
      <span class="text-[34px] font-extrabold leading-10 tracking-[-0.03em] tabular-nums text-ink">{{ PLANO_IMOBILIARIO.precoMensal }}</span>
      <span class="text-sm font-semibold text-ink-muted">/mês</span>
    </p>
    <ul class="m-0 flex list-none flex-col gap-2.5 border-t border-line p-0 pt-4 text-sm leading-5 text-ink">
      <li v-for="item in PLANO_IMOBILIARIO.inclui" :key="item" class="flex gap-2.5">
        <Icon name="lucide:check" class="mt-0.5 h-[18px] w-[18px] flex-none text-brand-ink" aria-hidden="true" />
        <span>{{ item }}</span>
      </li>
    </ul>
    <p class="m-0 flex flex-1 gap-2.5 text-[13px] leading-5 text-ink-muted">
      <Icon name="lucide:info" class="mt-px h-[18px] w-[18px] flex-none" aria-hidden="true" />
      <span>{{ PLANO_IMOBILIARIO.naoInclui }} Contratação pelo WhatsApp, fora do carrinho.</span>
    </p>
    <a
      :href="linkWhatsapp"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-mbb-md bg-success-ink px-4 text-sm font-bold text-white transition-colors hover:bg-[#145530] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <Icon name="simple-icons:whatsapp" class="h-[18px] w-[18px]" aria-hidden="true" />
      Contratar pelo WhatsApp
      <span class="sr-only">(abre em nova aba)</span>
    </a>
  </article>
</template>
