<!--
  Identificação de conteúdo patrocinado no topo da matéria (ver
  /publicidade-e-conteudo-patrocinado). Renderizado pela página só quando
  tipo_conteudo === 'patrocinado' -- o aviso vem do campo estruturado, nunca
  do texto da matéria.

  Rótulo em caixa alta via CSS (o texto real fica em caixa normal, pra leitor
  de tela não soletrar). Não é heading de propósito -- não entra no sumário
  de títulos da página.
-->
<template>
  <aside aria-label="Aviso de conteúdo publicitário" class="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 sm:px-5">
    <p class="text-xs font-bold uppercase tracking-wider text-stone-700">Conteúdo publicitário</p>
    <p class="mt-1 text-sm leading-relaxed text-stone-600">
      Esta publicação foi produzida mediante contratação de espaço publicitário pelo anunciante.
    </p>
  </aside>
</template>
