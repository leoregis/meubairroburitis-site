<script setup lang="ts">
useSeoMeta({
  title: 'Dados de alcance — Midiakit Meu Bairro Buritis',
  description: 'Mais de 150 mil membros no Facebook e mais de 55 mil seguidores no Instagram. Veja o alcance real do Meu Bairro Buritis.',
})

const numeros = [
  { valor: '150 mil+', legenda: 'membros no maior grupo de bairros de BH, no Facebook' },
  { valor: '55 mil+', legenda: 'seguidores no perfil comercial do Instagram' },
  { valor: 'desde 2012', legenda: 'site no ar, com design responsivo' },
]
</script>

<template>
  <div class="mx-auto flex max-w-[960px] flex-col gap-8 px-4 pb-16 pt-6 sm:gap-10 sm:px-6 sm:pb-[72px] sm:pt-10">
    <MidiakitCabecalho titulo="Dados de alcance" />

    <dl class="m-0 grid gap-3 sm:grid-cols-3">
      <div v-for="n in numeros" :key="n.legenda" class="flex flex-col-reverse gap-1 rounded-mbb-xl border border-line bg-white p-5 sm:p-6">
        <dt class="text-sm leading-5 text-ink-muted">{{ n.legenda }}</dt>
        <dd class="m-0 text-[30px] font-extrabold leading-9 tracking-[-0.025em] tabular-nums text-ink sm:text-[36px] sm:leading-[42px]">{{ n.valor }}</dd>
      </div>
    </dl>

    <div class="prose prose-lg max-w-[680px] text-ink prose-p:text-ink">
      <p>
        Nosso website já está no ar desde 2012, com design moderno e estrutura responsiva. No
        Facebook temos o maior grupo de bairros de BH, sempre em crescimento e com alto volume de
        interação todos os dias.
      </p>
      <p>
        Também estamos presentes com um perfil comercial no Instagram, além de grupo no Telegram,
        perfis no TikTok e no Threads, grupos no WhatsApp e um canal no YouTube.
      </p>
      <p>
        Além da vida online, participamos da vida offline da região — já apoiamos feiras
        gastronômicas, blocos de carnaval e ações sociais, e realizamos campeonatos esportivos,
        concursos musicais e palestras.
      </p>
    </div>
  </div>
</template>
