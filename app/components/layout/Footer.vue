<script setup lang="ts">
const config = useRuntimeConfig()

const canais = [
  { label: 'Instagram', href: 'https://www.instagram.com/meubairroburitis/', icon: 'lucide:instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/MeuBairroBuritis/', icon: 'lucide:facebook' },
  { label: 'Grupo Facebook', href: 'https://www.facebook.com/groups/MeuBairroBuritisGrupo', icon: 'lucide:users' },
  { label: 'WhatsApp', href: `https://wa.me/${config.public.whatsappNumero}`, icon: 'lucide:message-circle' },
  { label: 'E-mail', href: 'mailto:contato@meubairroburitis.com.br', icon: 'lucide:mail' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@meubairroburitis', icon: 'lucide:music-2' },
]
</script>

<template>
  <footer class="bg-stone-900">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
      <div>
        <NuxtPicture
          src="/logo/logo_mbb_rodape.png"
          alt="Meu Bairro Buritis"
          format="webp"
          :width="140"
          :height="68"
          sizes="140px"
          :img-attrs="{ class: 'mb-3 h-9 w-auto' }"
        />
        <p class="text-sm text-stone-300">A maior comunidade online do Buritis e Estoril, desde 2012.</p>
      </div>

      <div>
        <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">Navegação</p>
        <ul class="space-y-2 text-sm text-white">
          <li><NuxtLink to="/quem-somos" class="hover:text-orange-400">Quem Somos</NuxtLink></li>
          <li><NuxtLink to="/o-bairro-buritis" class="hover:text-orange-400">O Bairro Buritis</NuxtLink></li>
          <li><NuxtLink to="/loja" class="hover:text-orange-400">Anuncie com a gente</NuxtLink></li>
          <li><NuxtLink to="/midiakit" class="hover:text-orange-400">Midiakit</NuxtLink></li>
          <li>
            <a href="/guia/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 hover:text-orange-400">
              <Icon name="lucide:smartphone" class="h-4 w-4" />
              Guia Buritis (app)
            </a>
          </li>
        </ul>
      </div>

      <div>
        <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">Redes sociais</p>
        <ul class="flex flex-wrap gap-3">
          <li v-for="canal in canais" :key="canal.href">
            <a
              :href="canal.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="canal.label"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-white shadow-sm hover:bg-orange-600"
            >
              <Icon :name="canal.icon" class="h-5 w-5" />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-stone-800 px-4 py-4 text-center text-xs text-stone-400">
      © {{ new Date().getFullYear() }} Meu Bairro Buritis. Todos os direitos reservados.
    </div>
  </footer>
</template>
