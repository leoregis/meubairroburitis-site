<script setup lang="ts">
const links = [
  { label: 'Início', to: '/' },
  { label: 'Quem Somos', to: '/quem-somos' },
  { label: 'O Bairro Buritis', to: '/o-bairro-buritis' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Anuncie', to: '/loja' },
  { label: 'Midiakit', to: '/midiakit' },
  { label: 'Canais', to: '/canais' },
]

// 🔥 app é uma aplicação separada (meubairro-app, hospedado em /guia) --
// abre em nova aba, por isso fica fora do array `links` acima (que
// alimenta o mesmo NuxtLink pros dois, interno e externo). Mesmo
// texto/URL relativa já usados em AppDestaque.vue (seção da home).
const linkApp = { label: 'Guia Buritis', href: '/guia/' }

const menuAberto = ref(false)
const { quantidadeTotal } = useCarrinho()
</script>

<template>
  <header class="sticky top-0 z-40 bg-[#dd0202]">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <NuxtLink to="/" class="flex items-center gap-2">
        <NuxtPicture
          src="/logo/logo_mbb_rodape.png"
          alt="Meu Bairro Buritis"
          format="webp"
          :width="140"
          :height="68"
          sizes="140px"
          fetchpriority="high"
          loading="eager"
          :img-attrs="{ class: 'h-9 w-auto' }"
        />
      </NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-white/90 hover:text-white"
          active-class="text-white font-semibold"
        >
          {{ link.label }}
        </NuxtLink>

        <a
          :href="linkApp.href"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/25"
        >
          <Icon name="lucide:smartphone" class="h-4 w-4" />
          {{ linkApp.label }}
        </a>
      </nav>

      <div class="flex items-center gap-4">
        <NuxtLink to="/carrinho" aria-label="Ver carrinho" class="relative">
          <Icon name="lucide:shopping-cart" class="h-6 w-6 text-white" />
          <ClientOnly>
            <span
              v-if="quantidadeTotal > 0"
              class="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white"
            >
              {{ quantidadeTotal }}
            </span>
          </ClientOnly>
        </NuxtLink>

        <button
          type="button"
          class="md:hidden"
          aria-label="Abrir menu"
          @click="menuAberto = !menuAberto"
        >
          <Icon :name="menuAberto ? 'lucide:x' : 'lucide:menu'" class="h-6 w-6 text-white" />
        </button>
      </div>
    </div>

    <nav v-if="menuAberto" class="flex flex-col gap-1 border-t border-white/20 px-4 py-3 md:hidden">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-md px-2 py-2 text-sm font-medium text-white hover:bg-white/10"
        @click="menuAberto = false"
      >
        {{ link.label }}
      </NuxtLink>

      <a
        :href="linkApp.href"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-1 flex items-center gap-2 rounded-md bg-white/15 px-2 py-2 text-sm font-semibold text-white hover:bg-white/25"
        @click="menuAberto = false"
      >
        <Icon name="lucide:smartphone" class="h-4 w-4" />
        {{ linkApp.label }}
      </a>
    </nav>
  </header>
</template>
