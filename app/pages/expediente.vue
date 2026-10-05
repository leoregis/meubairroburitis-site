<script setup lang="ts">
import { DADOS_INSTITUCIONAIS as D } from '~/constants/institucional'

const TITULO_SEO = 'Expediente | Meu Bairro Buritis'
const DESCRICAO_SEO =
  'Conheça os responsáveis pelo Meu Bairro Buritis, veículo de informação e jornalismo local sobre Buritis e Estoril, em Belo Horizonte.'

useSeoMeta({
  title: TITULO_SEO,
  description: DESCRICAO_SEO,
  ogTitle: TITULO_SEO,
  ogDescription: DESCRICAO_SEO,
  ogUrl: 'https://meubairroburitis.com.br/expediente',
  ogType: 'website',
})

const dadosVeiculo = [
  { termo: 'Empresa responsável', valor: D.razaoSocial },
  { termo: 'CNPJ', valor: D.cnpj },
  { termo: 'Sede', valor: D.sede },
  { termo: 'Domínio', valor: D.dominio },
  { termo: 'Atuação', valor: D.atuacao },
]

const contatos = [
  {
    id: 'contato-editorial',
    titulo: 'Contato editorial',
    email: D.emailEditorial,
    uso: 'Assuntos relacionados a matérias, informações, correções, esclarecimentos, sugestões de pauta e questões editoriais.',
  },
  {
    id: 'contato-comercial',
    titulo: 'Contato comercial',
    email: D.emailComercial,
    uso: 'Publicidade, parcerias comerciais e anunciantes.',
  },
]
</script>

<template>
  <InstitucionalPagina titulo="Expediente">
    <h2>{{ D.nomeVeiculo }}</h2>
    <p>
      O Meu Bairro Buritis é um veículo de informação e jornalismo local dedicado aos bairros Buritis e
      Estoril, em Belo Horizonte (MG).
    </p>
    <p>
      O projeto foi criado em {{ D.anoCriacao }} e atua na produção e disseminação de informações de interesse
      da comunidade, incluindo notícias, reportagens, entrevistas, histórias de moradores, assuntos
      relacionados ao comércio e serviços locais, mobilidade, urbanismo, cultura, segurança, meio ambiente e
      demais temas relevantes para a região.
    </p>

    <h2>Responsável pelo veículo</h2>
    <p>
      <strong>{{ D.responsavel }}</strong><br>
      Criador e administrador do Meu Bairro Buritis.
    </p>

    <h2>Responsável editorial</h2>
    <p>
      <strong>{{ D.responsavel }}</strong><br>
      Responsável pela coordenação editorial, publicação e administração do conteúdo jornalístico e
      informativo do Meu Bairro Buritis.
    </p>

    <h2>Dados do veículo</h2>
    <dl class="not-prose divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white text-[15px] sm:text-base">
      <div v-for="item in dadosVeiculo" :key="item.termo" class="grid gap-1 px-5 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
        <dt class="font-semibold text-stone-900">{{ item.termo }}</dt>
        <dd class="text-stone-700">{{ item.valor }}</dd>
      </div>
    </dl>
    <p>
      O Meu Bairro Buritis também mantém presença em diferentes canais digitais. Veja todos na página
      <NuxtLink to="/canais">Canais</NuxtLink>.
    </p>

    <h2>Contatos</h2>
    <div class="not-prose grid gap-4 sm:grid-cols-2">
      <section
        v-for="contato in contatos"
        :key="contato.titulo"
        :aria-labelledby="contato.id"
        class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h3 :id="contato.id" class="font-serif text-lg font-bold text-stone-900">{{ contato.titulo }}</h3>
        <a
          :href="`mailto:${contato.email}`"
          class="mt-2 inline-flex min-h-[44px] items-center gap-2 break-all font-semibold text-orange-800 underline underline-offset-2 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-700"
        >
          <Icon name="lucide:mail" class="h-4 w-4 flex-none" aria-hidden="true" />
          {{ contato.email }}
        </a>
        <p class="mt-2 text-sm leading-relaxed text-stone-600">
          <span class="font-semibold text-stone-700">Uso:</span> {{ contato.uso }}
        </p>
      </section>
    </div>

    <h2>Correções e direito de resposta</h2>
    <p>
      Para solicitar correção de informação, apresentar esclarecimento ou exercer direito de resposta,
      consulte a página
      <NuxtLink to="/correcoes-e-direito-de-resposta">Correções e Direito de Resposta</NuxtLink>.
    </p>
  </InstitucionalPagina>
</template>
