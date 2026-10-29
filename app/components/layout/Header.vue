<script setup lang="ts">
// Cabeçalho editorial (redesign, fase 1): fundo branco, logo preto, linha 1
// com as ações e linha 2 com as editorias + Empresas/Prestadores, fechada
// pela linha vermelha de 3px. No celular só a linha 1 fica presa no topo;
// as editorias rolam na horizontal e somem ao descer a página.
import { LINKS_CABECALHO, LINKS_DIRETORIO, LINK_ANUNCIE, LINK_APP_GUIA } from '~/constants/navegacao'

const route = useRoute()
const { quantidadeTotal } = useCarrinho()

const menuAberto = ref(false)
const botaoMenu = ref<HTMLButtonElement | null>(null)

function fecharMenu() {
  menuAberto.value = false
  nextTick(() => botaoMenu.value?.focus())
}

// "Últimas" vale para /noticias e a paginação; as outras, para a rota e
// tudo abaixo dela (/empresas/categoria/..., /empresas/pagina/2...).
function ativo(to: string) {
  const caminho = route.path.replace(/\/$/, '') || '/'
  if (to === '/noticias') return caminho === '/noticias' || caminho.startsWith('/noticias/pagina/')
  return caminho === to || caminho.startsWith(`${to}/`)
}

const primeiroDoDiretorio = LINKS_DIRETORIO[0]!.to
const foco = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
</script>

<template>
  <div class="sticky top-0 z-40 border-b border-line bg-white lg:static lg:border-b-0">
    <div class="mx-auto flex max-w-site items-center justify-between gap-3 px-4 py-2 lg:px-6 lg:py-4">
      <NuxtLink to="/" aria-label="Meu Bairro Buritis, página inicial" class="flex-none rounded-sm" :class="foco">
        <NuxtPicture
          src="/logo/logo-mbb-registrada-preta.png"
          alt=""
          format="webp"
          :width="124"
          :height="64"
          sizes="124px"
          fetchpriority="high"
          loading="eager"
          :img-attrs="{ class: 'block h-11 w-auto lg:h-16' }"
        />
      </NuxtLink>

      <div class="flex items-center gap-1.5 lg:gap-2">
        <!-- celular: Anuncie sempre visível, em vermelho (decisão 8) -->
        <NuxtLink
          :to="LINK_ANUNCIE.to"
          class="inline-flex min-h-[44px] items-center rounded-mbb-md px-2.5 text-sm font-bold text-brand-ink hover:bg-brand-tint lg:hidden"
          :class="foco"
        >
          {{ LINK_ANUNCIE.label }}
        </NuxtLink>

        <!-- carrinho só aparece com item (decisão 7) -->
        <ClientOnly>
          <NuxtLink
            v-if="quantidadeTotal > 0"
            to="/carrinho"
            :aria-label="`Carrinho, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'item' : 'itens'}`"
            class="relative flex h-11 w-11 items-center justify-center rounded-mbb-md border border-line text-ink hover:bg-ground"
            :class="foco"
          >
            <Icon name="lucide:shopping-cart" class="h-5 w-5" aria-hidden="true" />
            <span class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white" aria-hidden="true">
              {{ quantidadeTotal }}
            </span>
          </NuxtLink>
        </ClientOnly>

        <!-- computador: o app abre em nova aba (decisão 6) -->
        <BaseBotao :href="LINK_APP_GUIA.href" nova-aba class="!hidden lg:!inline-flex">
          <Icon name="lucide:smartphone" class="h-[18px] w-[18px]" aria-hidden="true" />
          {{ LINK_APP_GUIA.label }}
        </BaseBotao>

        <button
          ref="botaoMenu"
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-mbb-md border border-line text-ink hover:bg-ground lg:hidden"
          :class="foco"
          aria-label="Abrir menu"
          aria-haspopup="dialog"
          :aria-expanded="menuAberto"
          aria-controls="menu-celular"
          @click="menuAberto = true"
        >
          <Icon name="lucide:menu" class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>

  <nav aria-label="Editorias" class="border-b-3 border-brand bg-white">
    <ul class="mx-auto m-0 flex max-w-site list-none gap-1 overflow-x-auto px-3 py-0 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible lg:px-3.5 [&::-webkit-scrollbar]:hidden">
      <template v-for="link in LINKS_CABECALHO" :key="link.to">
        <li v-if="link.to === primeiroDoDiretorio" aria-hidden="true" class="mx-1 hidden w-px flex-none self-center bg-line lg:block lg:h-5" />
        <li class="flex-none">
          <NuxtLink
            :to="link.to"
            class="inline-flex min-h-[44px] items-center whitespace-nowrap border-b-2 px-2 text-sm text-ink lg:min-h-[48px] lg:px-3 lg:text-[15px]"
            :class="[ativo(link.to) ? 'border-brand font-bold' : 'border-transparent font-semibold hover:border-line', foco]"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </template>
    </ul>
  </nav>

  <LayoutMenuCelular v-if="menuAberto" @fechar="fecharMenu" />
</template>
