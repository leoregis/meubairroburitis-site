<script setup lang="ts">
useSeoMeta({
  title: 'Dados de alcance — Midiakit Meu Bairro Buritis',
  description: 'Mais de 150 mil membros no Facebook e 55 mil seguidores no Instagram. Veja o alcance real do Meu Bairro Buritis.',
})

const numeros = [
  { valor: '150 mil+', legenda: 'membros no maior grupo de bairros de BH, no Facebook' },
  { valor: '~55 mil', legenda: 'seguidores no perfil comercial do Instagram' },
  { valor: 'desde 2012', legenda: 'site no ar, com design responsivo' },
]
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-16">
    <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Midiakit</p>
    <h1 class="mt-2 font-serif text-3xl font-bold text-stone-900">Dados de alcance</h1>

    <div class="mt-8">
      <MidiakitTabs />
    </div>

    <div class="grid gap-6 sm:grid-cols-3">
      <div v-for="n in numeros" :key="n.legenda" class="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p class="font-serif text-3xl font-bold tabular-nums text-orange-800">{{ n.valor }}</p>
        <p class="mt-2 text-sm text-stone-500">{{ n.legenda }}</p>
      </div>
    </div>

    <div class="prose prose-stone mt-10 max-w-none">
      <p>
        Nosso website já está no ar desde 2012, com design moderno e estrutura responsiva. No
        Facebook temos o maior grupo de bairros de BH, sempre em crescimento e com alto volume de
        interação todos os dias.
      </p>
      <p>
        Também estamos presentes com um perfil comercial no Instagram, além de grupo no Telegram,
        perfis no TikTok, Threads e X (antigo Twitter), grupos no WhatsApp e um canal no YouTube.
      </p>
      <p>
        Além da vida online, participamos da vida offline da região — já apoiamos feiras
        gastronômicas, blocos de carnaval e ações sociais, e realizamos campeonatos esportivos,
        concursos musicais e palestras.
      </p>
    </div>
  </div>
</template>
