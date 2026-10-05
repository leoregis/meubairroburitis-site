<script setup lang="ts">
import { DADOS_INSTITUCIONAIS as D } from '~/constants/institucional'

const TITULO_SEO = 'Publicidade e Conteúdo Patrocinado | Meu Bairro Buritis'
const DESCRICAO_SEO =
  'Entenda como funciona a publicidade, o conteúdo patrocinado e a separação entre atividade comercial e conteúdo editorial no Meu Bairro Buritis.'

useSeoMeta({
  title: TITULO_SEO,
  description: DESCRICAO_SEO,
  ogTitle: TITULO_SEO,
  ogDescription: DESCRICAO_SEO,
  ogUrl: 'https://meubairroburitis.com.br/publicidade-e-conteudo-patrocinado',
  ogType: 'website',
})
</script>

<template>
  <InstitucionalPagina titulo="Publicidade e Conteúdo Patrocinado">
    <p class="lead">
      O Meu Bairro Buritis possui espaços e formatos comerciais destinados a empresas, instituições e
      profissionais que desejam divulgar seus produtos, serviços ou marcas para a comunidade do Buritis e
      Estoril.
    </p>
    <p>
      Os formatos comerciais disponíveis podem ser consultados nas páginas
      <NuxtLink to="/loja">Anuncie</NuxtLink> e <NuxtLink to="/midiakit/formatos">Midiakit — Formatos</NuxtLink>.
      Contato comercial: <a :href="`mailto:${D.emailComercial}`">{{ D.emailComercial }}</a>.
    </p>

    <h2>Separação entre publicidade e conteúdo editorial</h2>
    <p>
      A contratação de publicidade não implica garantia de cobertura jornalística favorável nem interfere
      automaticamente nas decisões editoriais do Meu Bairro Buritis.
    </p>
    <p>Conteúdos produzidos com finalidade publicitária serão identificados de forma clara.</p>

    <h2>Conteúdo Publicitário Especial</h2>
    <p>
      Quando uma empresa contratar conteúdo produzido especificamente para divulgação comercial, o conteúdo
      deverá ser identificado como publicidade, conteúdo patrocinado ou denominação equivalente.
    </p>
    <p>O objetivo é permitir que o leitor compreenda claramente a natureza comercial daquele conteúdo.</p>

    <h2>Publicidade e matérias jornalísticas</h2>
    <p>
      A existência de publicidade de uma empresa não impede nem determina a publicação de informações
      jornalísticas relacionadas a ela.
    </p>
    <p>
      Eventuais conflitos entre interesse comercial e interesse editorial devem ser tratados preservando a
      independência editorial do veículo. Os princípios completos estão na
      <NuxtLink to="/politica-editorial">Política Editorial</NuxtLink>.
    </p>
  </InstitucionalPagina>
</template>
