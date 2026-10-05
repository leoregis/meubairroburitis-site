<script setup lang="ts">
const TITULO_SEO = 'Política Editorial | Meu Bairro Buritis'
const DESCRICAO_SEO =
  'Conheça os princípios e procedimentos editoriais adotados pelo Meu Bairro Buritis na produção de informação e jornalismo local.'

useSeoMeta({
  title: TITULO_SEO,
  description: DESCRICAO_SEO,
  ogTitle: TITULO_SEO,
  ogDescription: DESCRICAO_SEO,
  ogUrl: 'https://meubairroburitis.com.br/politica-editorial',
  ogType: 'website',
})
</script>

<template>
  <InstitucionalPagina titulo="Política Editorial">
    <p class="lead">
      O Meu Bairro Buritis produz conteúdo voltado principalmente aos moradores, trabalhadores, comerciantes e
      demais pessoas que vivem, circulam ou possuem interesse nos bairros Buritis e Estoril.
    </p>
    <p>
      Nosso trabalho busca informar a comunidade, registrar acontecimentos locais, dar visibilidade a histórias
      e iniciativas da região e acompanhar assuntos que possam afetar a vida dos moradores.
    </p>

    <h2>Apuração</h2>
    <p>As informações publicadas são apuradas de acordo com a natureza e a complexidade de cada pauta.</p>
    <p>
      Sempre que possível e pertinente, o Meu Bairro Buritis busca consultar fontes diretamente relacionadas ao
      fato, documentos, órgãos públicos, empresas, especialistas, envolvidos e/ou testemunhas.
    </p>
    <p>
      O grau de apuração pode variar de acordo com a natureza da informação e com a urgência do acontecimento.
    </p>

    <h2>Fontes</h2>
    <p>As fontes utilizadas podem incluir:</p>
    <ul>
      <li>documentos públicos;</li>
      <li>órgãos públicos;</li>
      <li>empresas e instituições;</li>
      <li>especialistas;</li>
      <li>moradores;</li>
      <li>testemunhas;</li>
      <li>entrevistas;</li>
      <li>informações encaminhadas à redação;</li>
      <li>bases de dados;</li>
      <li>outros veículos de comunicação;</li>
      <li>fontes identificadas ou, quando necessário, fontes que tenham sua identidade preservada.</li>
    </ul>
    <p>Quando relevante, as matérias apresentam links ou referências às fontes utilizadas.</p>

    <h2>Informações recebidas da comunidade</h2>
    <p>
      O Meu Bairro Buritis recebe informações, relatos, imagens, vídeos e denúncias encaminhados por moradores.
    </p>
    <p>O recebimento de uma informação não significa sua publicação automática.</p>
    <p>
      O conteúdo pode ser submetido a verificação antes da publicação, de acordo com a relevância, natureza e
      disponibilidade de informações para apuração.
    </p>

    <h2>Direito de manifestação</h2>
    <p>
      Quando uma matéria envolver pessoas, empresas ou instituições de maneira relevante, o Meu Bairro Buritis
      poderá buscar manifestação dos envolvidos antes ou depois da publicação, conforme as circunstâncias da
      apuração.
    </p>
    <p>
      Quando uma manifestação relevante for recebida posteriormente, ela poderá ser incorporada ou acrescentada
      à matéria.
    </p>

    <h2>Correções</h2>
    <p>
      Caso seja identificada uma informação factual incorreta, o Meu Bairro Buritis poderá corrigir o conteúdo
      publicado.
    </p>
    <p>Correções relevantes podem ser identificadas na própria matéria, quando necessário.</p>
    <p>
      Para solicitar uma correção, veja
      <NuxtLink to="/correcoes-e-direito-de-resposta">Correções e Direito de Resposta</NuxtLink>.
    </p>

    <h2>Atualizações</h2>
    <p>Matérias podem ser atualizadas quando surgirem novas informações relevantes.</p>
    <p>
      Quando a atualização alterar substancialmente a compreensão dos fatos, isso poderá ser indicado no
      conteúdo.
    </p>

    <h2>Conteúdo opinativo</h2>
    <p>Conteúdo opinativo, quando publicado, deve ser identificado como tal.</p>
    <p>
      Opiniões de entrevistados, moradores, especialistas ou colaboradores não devem ser apresentadas como
      fatos atribuíveis ao Meu Bairro Buritis.
    </p>

    <h2>Publicidade</h2>
    <p>O conteúdo publicitário deve ser identificado de maneira compatível com sua natureza.</p>
    <p>Publicidade e conteúdo editorial devem permanecer conceitualmente separados.</p>
    <p>
      A contratação de publicidade não garante cobertura jornalística positiva, alteração de conteúdo editorial
      ou tratamento editorial privilegiado.
    </p>

    <h2>Conteúdo patrocinado</h2>
    <p>
      Quando uma empresa ou instituição contratar conteúdo produzido especificamente para fins publicitários,
      esse conteúdo deverá ser identificado como publicidade, conteúdo patrocinado ou denominação equivalente.
    </p>
    <p>
      A identificação deve ser suficientemente clara para que o leitor consiga diferenciar publicidade de
      conteúdo editorial. Saiba mais em
      <NuxtLink to="/publicidade-e-conteudo-patrocinado">Publicidade e Conteúdo Patrocinado</NuxtLink>.
    </p>

    <h2>Independência editorial</h2>
    <p>
      A existência de relações comerciais, publicidade ou parcerias não determina automaticamente o conteúdo
      editorial publicado pelo Meu Bairro Buritis.
    </p>
    <p>Decisões editoriais devem considerar relevância jornalística e interesse da comunidade.</p>

    <h2>Uso de imagens e conteúdos de terceiros</h2>
    <p>
      O Meu Bairro Buritis deve procurar identificar a origem das imagens, vídeos e demais materiais utilizados
      quando sua origem for conhecida e relevante.
    </p>
    <p>
      Conteúdos enviados por terceiros podem ser utilizados mediante autorização, quando necessária, ou conforme
      a legislação aplicável.
    </p>
  </InstitucionalPagina>
</template>
