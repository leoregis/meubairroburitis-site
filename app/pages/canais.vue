<script setup lang="ts">
useSeoMeta({
  title: 'Canais — Meu Bairro Buritis',
  description: 'Todos os canais oficiais do Meu Bairro Buritis: Instagram, Facebook, WhatsApp, Telegram, TikTok, YouTube e mais.',
})

const canais = [
  { label: 'Instagram', href: 'https://www.instagram.com/meubairroburitis/', icon: 'lucide:instagram' },
  { label: 'Fanpage Facebook', href: 'https://www.facebook.com/MeuBairroBuritis/', icon: 'lucide:facebook' },
  { label: 'Grupo Facebook', href: 'https://www.facebook.com/groups/MeuBairroBuritisGrupo', icon: 'lucide:users' },
  { label: 'Grupo 1 WhatsApp', href: 'https://chat.whatsapp.com/Dect3py66kEL0DWWKRbNJQ', icon: 'lucide:message-circle' },
  { label: 'Grupo 2 WhatsApp', href: 'https://chat.whatsapp.com/KqFtqXnjpXd3TYitMmtI0e', icon: 'lucide:message-circle' },
  { label: 'Threads', href: 'https://www.threads.net/@meubairroburitis', icon: 'lucide:at-sign' },
  { label: 'Google', href: 'https://g.co/kgs/vur7d5P', icon: 'lucide:map-pin' },
  { label: 'X (Twitter)', href: 'https://x.com/meuburitis', icon: 'lucide:twitter' },
  { label: 'Grupo Telegram', href: 'https://t.me/joinchat/I24oGtL5ZKAgMwpq', icon: 'lucide:send' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCUSyz1LfLxyQCPR6fm_UsLA', icon: 'lucide:youtube' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@meubairroburitis', icon: 'lucide:music-2' },
]
</script>

<template>
  <div>
    <div class="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pb-6 pt-6 sm:px-6 sm:pt-10">
      <header class="flex flex-col gap-2">
        <BaseEyebrow>Canais</BaseEyebrow>
        <h1 class="m-0 text-balance text-[32px] font-extrabold leading-[38px] tracking-[-0.025em] text-ink sm:text-[44px] sm:leading-[50px]">Onde nos encontrar</h1>
      </header>

      <ul class="m-0 list-none divide-y divide-line overflow-hidden rounded-mbb-xl border border-line p-0">
        <li v-for="canal in canais" :key="canal.href">
          <a
            :href="canal.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-h-[56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-ground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink sm:px-5"
          >
            <span class="flex h-9 w-9 flex-none items-center justify-center rounded-mbb-md bg-brand-tint text-brand-ink" aria-hidden="true">
              <Icon :name="canal.icon" class="h-5 w-5" />
            </span>
            <span class="flex-1 font-bold text-ink">{{ canal.label }}</span>
            <Icon name="lucide:arrow-up-right" class="h-4 w-4 flex-none text-ink-muted" aria-hidden="true" />
            <span class="sr-only">(abre em nova aba)</span>
          </a>
        </li>
      </ul>
    </div>
    <!-- veio da home no redesign (fase 2, decisão 12); visual novo na fase 6 -->
    <HomeInstagramEmbed />
  </div>
</template>
