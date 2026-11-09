<script setup lang="ts">
useSeoMeta({
  title: 'Dúvidas frequentes — Midiakit Meu Bairro Buritis',
  description: 'Respostas para as perguntas mais comuns sobre anunciar no Meu Bairro Buritis.',
})

const faq = [
  {
    pergunta: 'Paguei anúncio no Instagram mas ele não teve bom resultado. Por quê?',
    resposta:
      'Em alguns formatos, cedemos apenas o espaço para publicação — não garantimos resultado. Isso depende do seu conteúdo e do interesse que ele atrai no público, assim como qualquer outro post.',
  },
  {
    pergunta: 'Vocês criam o anúncio?',
    resposta:
      'Na Produção de Vídeo e no Conteúdo Publicitário Especial, sim: a produção é feita pela nossa equipe. Nos Stories, Colabs e pacotes mensais, o conteúdo (texto, imagens e/ou vídeos) deve ser enviado pronto, com data e horário de publicação definidos.',
  },
  {
    pergunta: 'Posso pagar depois que meu anúncio for publicado?',
    resposta: 'Não. Trabalhamos apenas com pagamento antecipado.',
  },
  {
    pergunta: 'Posso parcelar os valores do pacote?',
    resposta: 'No cartão de crédito, sim (com juros da operadora). No PIX não há parcelamento.',
  },
  {
    pergunta: 'Quero anunciar mas não entendo nada dessas coisas. Como faço?',
    resposta:
      'Nesse caso, as melhores opções são a Produção de Vídeo e o Conteúdo Publicitário Especial: nelas a nossa equipe faz tudo, você só nos passa as informações. Se preferir, também podemos indicar profissionais de social media parceiros — fale conosco pelo WhatsApp.',
  },
  {
    pergunta: 'Minha loja fica em outro bairro. Posso anunciar?',
    resposta: 'Se não for do Buritis ou de um bairro vizinho, infelizmente não aceitamos — nossos perfis são exclusivos dessa região.',
  },
  {
    pergunta: 'Posso anunciar qualquer coisa? Ou vocês não aceitam alguns tipos de anúncio?',
    resposta:
      'Não aceitamos anúncios de lojas fora do Buritis e bairros vizinhos, conteúdo sexual, armas, conteúdo religioso, concorrentes diretos, drogas ou qualquer substância ilícita.',
  },
]
</script>

<template>
  <div class="mx-auto flex max-w-[960px] flex-col gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-[72px] sm:pt-10">
    <MidiakitCabecalho titulo="Dúvidas frequentes" />

    <div class="flex flex-col border-t border-line">
      <details v-for="item in faq" :key="item.pergunta" class="group border-b border-line">
        <summary class="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-bold text-ink marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-[17px] [&::-webkit-details-marker]:hidden">
          {{ item.pergunta }}
          <Icon name="lucide:plus" class="h-5 w-5 flex-none text-brand-ink transition-transform group-open:rotate-45" aria-hidden="true" />
        </summary>
        <p class="m-0 max-w-[720px] pb-5 text-[15px] leading-[24px] text-ink-muted sm:text-base sm:leading-[26px]">{{ item.resposta }}</p>
      </details>
    </div>
  </div>
</template>
