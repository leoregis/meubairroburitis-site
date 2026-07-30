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
  <div class="mx-auto max-w-2xl px-4 py-16">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Canais</p>
    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">Onde nos encontrar</h1>

    <ul class="mt-8 divide-y divide-stone-200 rounded-xl border border-stone-200">
      <li v-for="canal in canais" :key="canal.href">
        <a
          :href="canal.href"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 px-4 py-4 hover:bg-stone-50"
        >
          <Icon :name="canal.icon" class="h-5 w-5 text-orange-700" />
          <span class="font-medium text-stone-800">{{ canal.label }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
