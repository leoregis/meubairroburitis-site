<script setup lang="ts">
definePageMeta({ layout: 'bio' })

useSeoMeta({
  title: 'Meu Bairro Buritis — Links',
  description: 'Todos os links e canais oficiais do Meu Bairro Buritis em um só lugar.',
})

const config = useRuntimeConfig()

// links internos usam NuxtLink (mesma aba, sem custo de reload) -- só os
// realmente externos (app separado em /guia, ou fora do domínio) abrem em
// nova aba, mesmo critério já usado no Header/Footer do site.
const botoes = [
  { label: 'Anuncie com a gente', icon: 'lucide:megaphone', to: '/loja', externo: false },
  { label: 'App Guia Buritis', icon: 'lucide:smartphone', href: '/guia/', externo: true },
  { label: 'Veja nosso site', icon: 'lucide:globe', to: '/', externo: false },
  { label: 'Fale com a gente', icon: 'lucide:message-circle', href: `https://wa.me/${config.public.whatsappNumero}`, externo: true },
]

// cores oficiais de marca (simple-icons) -- o círculo de fundo fica
// branco pra qualquer ícone (contraste garantido no fundo bordô), só o
// traço do ícone usa a cor real da marca.
const redes = [
  { label: 'Grupo Facebook', href: 'https://www.facebook.com/share/g/J9CCtBSbADTHJXv9/', icon: 'simple-icons:facebook', hex: '#1877F2' },
  { label: 'Grupo 1 do WhatsApp', numero: 1, href: 'https://chat.whatsapp.com/Dect3py66kEL0DWWKRbNJQ', icon: 'simple-icons:whatsapp', hex: '#25D366' },
  { label: 'Grupo 2 do WhatsApp', numero: 2, href: 'https://chat.whatsapp.com/KqFtqXnjpXd3TYitMmtI0e', icon: 'simple-icons:whatsapp', hex: '#25D366' },
  { label: 'Grupo 3 do WhatsApp', numero: 3, href: 'https://chat.whatsapp.com/F3GdPE5Ng8W1EHCIbmmyla?mode=ac_t', icon: 'simple-icons:whatsapp', hex: '#25D366' },
  { label: 'Telegram', href: 'https://t.me/+SNxwnjEs3IwgMwpq', icon: 'simple-icons:telegram', hex: '#26A5E4' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@meubairroburitis', icon: 'simple-icons:tiktok', hex: '#000000' },
  { label: 'YouTube', href: 'https://youtube.com/@meubairroburitis', icon: 'simple-icons:youtube', hex: '#FF0000' },
  { label: 'Google', href: 'https://g.co/kgs/vur7d5P', icon: 'simple-icons:google', hex: '#4285F4' },
]
</script>

<template>
  <div class="flex min-h-screen justify-center bg-gradient-to-b from-[#4a060c] via-[#7a0c14] to-[#4a060c] px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center">
        <div class="flex h-28 w-28 items-center justify-center rounded-full bg-white p-3 shadow-[0_0_0_3px_#d4af37]">
          <NuxtPicture
            src="/logo/logo_mbb_completa.png"
            alt="Meu Bairro Buritis"
            format="webp"
            :width="112"
            :height="58"
            sizes="112px"
            fetchpriority="high"
            loading="eager"
            :img-attrs="{ class: 'w-full object-contain' }"
          />
        </div>
        <h1 class="mt-4 text-center font-serif text-xl font-bold text-white">Meu Bairro Buritis</h1>
        <p class="mt-1 text-center text-sm text-[#e8c777]">A maior comunidade online do Buritis e Estoril</p>
      </div>

      <div class="mt-8 flex flex-col gap-3">
        <template v-for="botao in botoes" :key="botao.label">
          <a
            v-if="botao.externo"
            :href="botao.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#d4af37] bg-white px-5 py-4 text-center text-base font-bold text-[#7a0c14] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <Icon :name="botao.icon" class="h-5 w-5 shrink-0" />
            {{ botao.label }}
          </a>
          <NuxtLink
            v-else
            :to="botao.to"
            class="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#d4af37] bg-white px-5 py-4 text-center text-base font-bold text-[#7a0c14] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <Icon :name="botao.icon" class="h-5 w-5 shrink-0" />
            {{ botao.label }}
          </NuxtLink>
        </template>
      </div>

      <ul class="mt-10 flex flex-wrap items-center justify-center gap-4">
        <li v-for="rede in redes" :key="rede.label" class="relative">
          <a
            :href="rede.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="rede.label"
            :title="rede.label"
            class="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Icon :name="rede.icon" class="h-6 w-6" :style="{ color: rede.hex }" />
          </a>
          <span
            v-if="rede.numero"
            aria-hidden="true"
            class="pointer-events-none absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#d4af37] text-[10px] font-bold leading-none text-[#4a060c]"
          >
            {{ rede.numero }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
