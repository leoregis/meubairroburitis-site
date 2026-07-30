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
      'Na Produção de Vídeo, sim. Nos outros formatos, o conteúdo (texto, imagens e/ou vídeos) deve ser enviado pronto, com data e horário de publicação definidos.',
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
      'Nesse caso o melhor é optar pela Produção de Vídeo ou procurar um profissional de social media. Podemos indicar profissionais parceiros — fale conosco pelo WhatsApp.',
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
  <div class="mx-auto max-w-2xl px-4 py-16">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Midiakit</p>
    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">Dúvidas frequentes</h1>

    <div class="mt-8">
      <MidiakitTabs />
    </div>

    <div class="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
      <details v-for="item in faq" :key="item.pergunta" class="group p-5">
        <summary class="cursor-pointer list-none font-semibold text-stone-800 marker:content-none">
          {{ item.pergunta }}
        </summary>
        <p class="mt-3 text-sm text-stone-600">{{ item.resposta }}</p>
      </details>
    </div>
  </div>
</template>
