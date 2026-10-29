<script setup lang="ts">
// Rodapé escuro (redesign, fase 1). Leva todos os links que saíram do
// cabeçalho (Quem Somos, Midiakit, Canais) -- ver constants/navegacao.ts.
import { LINKS_RODAPE_NAVEGACAO, LINKS_INSTITUCIONAIS, LINK_APP_GUIA, LINK_MEUS_PEDIDOS, redesOficiais } from '~/constants/navegacao'
import { DADOS_INSTITUCIONAIS } from '~/constants/institucional'

const config = useRuntimeConfig()
const redes = redesOficiais(config.public.whatsappNumero)

const link = 'inline-flex min-h-[32px] items-center text-white underline-offset-2 hover:text-brand-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
const titulo = 'm-0 mb-2 text-sm font-bold text-brand-soft'
</script>

<template>
  <!-- pb maior no celular: o botão flutuante do WhatsApp não cobre a última linha -->
  <footer class="bg-ink text-white">
    <div class="mx-auto max-w-site px-4 pb-28 pt-12 md:px-6 md:pb-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.3fr_1fr]">
        <div class="flex flex-col gap-3.5">
          <NuxtPicture
            src="/logo/logo-mbb-registrada-branca.png"
            alt="Meu Bairro Buritis e Região BH"
            format="webp"
            :width="124"
            :height="64"
            sizes="124px"
            loading="lazy"
            :img-attrs="{ class: 'block h-16 w-auto' }"
          />
          <p class="m-0 max-w-xs text-sm leading-[21px]">
            A maior comunidade online do Buritis e do Estoril, desde {{ DADOS_INSTITUCIONAIS.anoCriacao }}.
          </p>
        </div>

        <nav aria-labelledby="rodape-navegacao">
          <p id="rodape-navegacao" :class="titulo">Navegação</p>
          <ul class="list-none p-0 text-sm">
            <li v-for="item in LINKS_RODAPE_NAVEGACAO" :key="item.to">
              <NuxtLink :to="item.to" :class="link">{{ item.label }}</NuxtLink>
            </li>
            <li><NuxtLink :to="LINK_MEUS_PEDIDOS.to" :class="link">{{ LINK_MEUS_PEDIDOS.label }}</NuxtLink></li>
            <li>
              <a :href="LINK_APP_GUIA.href" target="_blank" rel="noopener noreferrer" :class="link">
                App {{ LINK_APP_GUIA.label }}<span class="sr-only"> (abre em nova aba)</span>
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="rodape-institucional">
          <p id="rodape-institucional" :class="titulo">Institucional</p>
          <ul class="list-none p-0 text-sm">
            <li v-for="item in LINKS_INSTITUCIONAIS" :key="item.to">
              <NuxtLink :to="item.to" :class="link">{{ item.label }}</NuxtLink>
            </li>
            <li><NuxtLink to="/o-bairro-buritis" :class="link">O Bairro Buritis</NuxtLink></li>
          </ul>
        </nav>

        <nav aria-labelledby="rodape-redes">
          <p id="rodape-redes" :class="titulo">Redes</p>
          <ul class="list-none p-0 text-sm">
            <li v-for="rede in redes" :key="rede.label">
              <a :href="rede.href" target="_blank" rel="noopener noreferrer" :class="link">
                {{ rede.label }}<span class="sr-only"> (abre em nova aba)</span>
              </a>
            </li>
            <li><a :href="`mailto:${DADOS_INSTITUCIONAIS.emailContato}`" :class="link">E-mail</a></li>
            <li><NuxtLink to="/canais" :class="link">Todos os canais</NuxtLink></li>
          </ul>
        </nav>
      </div>

      <p class="m-0 mt-10 border-t border-white/20 pt-5 text-xs leading-5">
        © {{ new Date().getFullYear() }} Meu Bairro Buritis. Todos os direitos reservados.
        Meu Bairro Buritis® é marca registrada.
      </p>
    </div>
  </footer>
</template>
