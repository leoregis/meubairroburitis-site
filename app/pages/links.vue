<script setup lang="ts">
definePageMeta({ layout: 'bio' })

useSeoMeta({
  title: 'Meu Bairro Buritis — Links',
  description: 'Todos os links e canais oficiais do Meu Bairro Buritis em um só lugar.',
})

const config = useRuntimeConfig()
const { $supabase } = useNuxtApp()
const { ehPrevia } = usePrevia()

// links internos usam NuxtLink (mesma aba, sem custo de reload) -- só os
// realmente externos (app separado em /guia, ou fora do domínio) abrem em
// nova aba, mesmo critério já usado no Header/Footer do site.
//
// Ordem pedida (09/09): app em primeiro lugar, "Anuncie com a gente" em
// segundo -- antes "Anuncie" vinha primeiro.
const botoes = [
  { slug: 'app', label: 'App Guia Buritis', icon: 'lucide:smartphone', href: '/guia/', externo: true },
  { slug: 'anuncie', label: 'Anuncie com a gente', icon: 'lucide:megaphone', to: '/loja', externo: false },
  { slug: 'site', label: 'Veja nosso site', icon: 'lucide:globe', to: '/', externo: false },
  { slug: 'whatsapp', label: 'Fale com a gente', icon: 'lucide:message-circle', href: `https://wa.me/${config.public.whatsappNumero}`, externo: true },
]

// cores oficiais de marca (simple-icons) -- o círculo de fundo fica
// branco pra qualquer ícone (contraste garantido no fundo escuro), só o
// traço do ícone usa a cor real da marca. Redesign (fase 5, decisão 19):
// fundo ink e botões vermelho/branco da marca; só os ícones das redes
// mantêm as cores de cada uma.
const redes = [
  { slug: 'facebook', label: 'Grupo Facebook', href: 'https://www.facebook.com/share/g/J9CCtBSbADTHJXv9/', icon: 'simple-icons:facebook', hex: '#1877F2' },
  { slug: 'whatsapp-grupo-1', label: 'Grupo 1 do WhatsApp', numero: 1, href: 'https://chat.whatsapp.com/Dect3py66kEL0DWWKRbNJQ', icon: 'simple-icons:whatsapp', hex: '#25D366' },
  { slug: 'whatsapp-grupo-2', label: 'Grupo 2 do WhatsApp', numero: 2, href: 'https://chat.whatsapp.com/KqFtqXnjpXd3TYitMmtI0e', icon: 'simple-icons:whatsapp', hex: '#25D366' },
  { slug: 'whatsapp-grupo-3', label: 'Grupo 3 do WhatsApp', numero: 3, href: 'https://chat.whatsapp.com/F3GdPE5Ng8W1EHCIbmmyla?mode=ac_t', icon: 'simple-icons:whatsapp', hex: '#25D366' },
  { slug: 'telegram', label: 'Telegram', href: 'https://t.me/+SNxwnjEs3IwgMwpq', icon: 'simple-icons:telegram', hex: '#26A5E4' },
  { slug: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@meubairroburitis', icon: 'simple-icons:tiktok', hex: '#000000' },
  { slug: 'youtube', label: 'YouTube', href: 'https://youtube.com/@meubairroburitis', icon: 'simple-icons:youtube', hex: '#FF0000' },
  { slug: 'google', label: 'Google', href: 'https://g.co/kgs/vur7d5P', icon: 'simple-icons:google', hex: '#4285F4' },
]

// fire-and-forget: nunca atrasa/bloqueia a navegação do clique (o link
// já abre normalmente) e nunca quebra o clique se a tabela/RPC falhar
// por qualquer motivo -- é só telemetria, não pode ser o que decide se o
// visitante consegue sair da página.
function registrarClique(slug: string) {
  if (!$supabase || ehPrevia) return
  $supabase
    .from('links_bio_cliques')
    .insert({ link_slug: slug, user_agent: navigator.userAgent })
    .then(({ error }) => {
      if (error) console.error('Erro ao registrar clique do link da bio:', error)
    })
}
</script>

<template>
  <main class="flex min-h-screen justify-center bg-ink px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="flex flex-col items-center">
        <div class="flex h-28 w-28 items-center justify-center rounded-full bg-white p-3">
          <NuxtPicture
            src="/logo/logo-mbb-registrada-preta.png"
            alt="Meu Bairro Buritis e Região"
            format="webp"
            :width="112"
            :height="58"
            sizes="112px"
            fetchpriority="high"
            loading="eager"
            :img-attrs="{ class: 'w-full object-contain' }"
          />
        </div>
        <h1 class="mt-4 text-center text-xl font-extrabold tracking-[-0.015em] text-white">Meu Bairro Buritis</h1>
        <p class="mt-1 text-center text-sm text-white/75">A maior comunidade online do Buritis e Estoril</p>
      </div>

      <div class="mt-8 flex flex-col gap-3">
        <template v-for="(botao, i) in botoes" :key="botao.label">
          <a
            v-if="botao.externo"
            :href="botao.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-h-[56px] items-center justify-center gap-2.5 rounded-mbb-lg px-5 py-4 text-center text-base font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            :class="i === 0 ? 'bg-brand text-white hover:bg-brand-deep' : 'bg-white text-ink hover:bg-ground'"
            @click="registrarClique(botao.slug)"
          >
            <Icon :name="botao.icon" class="h-5 w-5 shrink-0" :class="i === 0 ? '' : 'text-brand-ink'" aria-hidden="true" />
            {{ botao.label }}
          </a>
          <NuxtLink
            v-else
            :to="botao.to"
            class="flex min-h-[56px] items-center justify-center gap-2.5 rounded-mbb-lg px-5 py-4 text-center text-base font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            :class="i === 0 ? 'bg-brand text-white hover:bg-brand-deep' : 'bg-white text-ink hover:bg-ground'"
            @click="registrarClique(botao.slug)"
          >
            <Icon :name="botao.icon" class="h-5 w-5 shrink-0" :class="i === 0 ? '' : 'text-brand-ink'" aria-hidden="true" />
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
            class="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            @click="registrarClique(rede.slug)"
          >
            <Icon :name="rede.icon" class="h-6 w-6" :style="{ color: rede.hex }" aria-hidden="true" />
          </a>
          <span
            v-if="rede.numero"
            aria-hidden="true"
            class="pointer-events-none absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-ink bg-brand text-[10px] font-bold leading-none text-white"
          >
            {{ rede.numero }}
          </span>
        </li>
      </ul>
    </div>
  </main>
</template>
