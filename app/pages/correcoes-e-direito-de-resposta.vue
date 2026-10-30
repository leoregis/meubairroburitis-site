<script setup lang="ts">
import { DADOS_INSTITUCIONAIS as D } from '~/constants/institucional'

const TITULO_SEO = 'Correções e Direito de Resposta | Meu Bairro Buritis'
const DESCRICAO_SEO =
  'Saiba como solicitar correções, apresentar esclarecimentos ou encaminhar uma solicitação de direito de resposta ao Meu Bairro Buritis.'

useSeoMeta({
  title: TITULO_SEO,
  description: DESCRICAO_SEO,
  ogTitle: TITULO_SEO,
  ogDescription: DESCRICAO_SEO,
  ogUrl: 'https://meubairroburitis.com.br/correcoes-e-direito-de-resposta',
  ogType: 'website',
})

const ASSUNTO_SUGERIDO = 'Correção / Direito de Resposta — [nome da matéria]'
const mailto = `mailto:${D.emailEditorial}?subject=${encodeURIComponent(ASSUNTO_SUGERIDO)}`
</script>

<template>
  <InstitucionalPagina titulo="Correções e Direito de Resposta">
    <p class="lead">
      O Meu Bairro Buritis busca publicar informações corretas e verificadas, mas reconhece que erros podem
      ocorrer.
    </p>
    <p>
      Pessoas, empresas e instituições que tenham sido mencionadas em uma publicação podem entrar em contato
      para solicitar correção de informação factual, apresentar esclarecimentos ou encaminhar manifestação
      relacionada ao conteúdo publicado.
    </p>

    <h2>Correção de informação</h2>
    <p>Solicitações de correção devem indicar:</p>
    <ul>
      <li>URL da matéria;</li>
      <li>informação considerada incorreta;</li>
      <li>qual seria a informação correta;</li>
      <li>documentação ou elementos que possam comprovar a alegação, quando disponíveis;</li>
      <li>nome e forma de contato do solicitante.</li>
    </ul>
    <p>A solicitação será analisada pela equipe responsável pelo conteúdo.</p>
    <p>Caso seja constatado erro factual, a publicação poderá ser corrigida ou atualizada.</p>

    <h2>Direito de resposta</h2>
    <p>Solicitações de direito de resposta devem identificar claramente:</p>
    <ul>
      <li>a publicação questionada;</li>
      <li>a pessoa, empresa ou instituição que solicita a manifestação;</li>
      <li>os pontos específicos aos quais pretende responder;</li>
      <li>o texto ou conteúdo proposto para manifestação, quando aplicável;</li>
      <li>documentação ou informações relevantes.</li>
    </ul>
    <p>
      A solicitação será analisada individualmente, considerando o conteúdo publicado, a natureza da
      manifestação e a legislação aplicável.
    </p>
    <p>A apresentação de uma solicitação não implica publicação automática.</p>

    <h2>Esclarecimentos</h2>
    <p>
      Pessoas ou instituições mencionadas em uma matéria podem encaminhar esclarecimentos ou informações
      adicionais.
    </p>
    <p>
      Quando relevantes para a compreensão dos fatos, esses esclarecimentos poderão ser incorporados ou
      vinculados à publicação original.
    </p>

    <h2>Canal de contato</h2>
    <div class="not-prose rounded-mbb-xl border border-line bg-white p-5 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-wide text-ink-muted">E-mail editorial</p>
      <a
        :href="mailto"
        class="mt-1 inline-flex min-h-[44px] items-center gap-2 break-all font-semibold text-brand-ink underline underline-offset-2 hover:text-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-ink"
      >
        <Icon name="lucide:mail" class="h-4 w-4 flex-none" aria-hidden="true" />
        {{ D.emailEditorial }}
      </a>
      <p class="mt-3 text-sm text-ink-muted">Assunto sugerido:</p>
      <p class="mt-1 rounded-mbb-md bg-chip px-3 py-2 text-[15px] text-ink">{{ ASSUNTO_SUGERIDO }}</p>
    </div>

    <h2>Prazo de análise</h2>
    <p>As solicitações serão analisadas de acordo com sua natureza e complexidade.</p>
    <p>
      Em situações urgentes ou envolvendo informações potencialmente prejudiciais, a análise poderá receber
      prioridade.
    </p>
  </InstitucionalPagina>
</template>
