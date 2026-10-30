<!--
  Identificação de conteúdo patrocinado no topo da matéria (ver
  /publicidade-e-conteudo-patrocinado). Renderizado pela página só quando
  tipo_conteudo === 'patrocinado' -- o aviso vem do campo estruturado, nunca
  do texto da matéria.

  Rótulo em caixa alta via CSS (o texto real fica em caixa normal, pra leitor
  de tela não soletrar). Não é heading de propósito -- não entra no sumário
  de títulos da página. Cor de publicidade (sponsor, 5:1 sobre o fundo).
-->
<template>
  <aside aria-label="Aviso de conteúdo publicitário" class="rounded-mbb-lg border border-line border-l-4 border-l-sponsor bg-ground px-4 py-3 sm:px-5">
    <p class="m-0 text-xs font-bold uppercase tracking-[0.1em] text-sponsor">Conteúdo publicitário</p>
    <p class="m-0 mt-1 text-sm leading-relaxed text-ink">
      Esta publicação foi produzida mediante contratação de espaço publicitário pelo anunciante.
    </p>
  </aside>
</template>
