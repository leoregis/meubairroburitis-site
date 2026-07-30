<script setup lang="ts">
useSeoMeta({
  title: 'Quem Somos — Meu Bairro Buritis',
  description:
    'A história do Meu Bairro Buritis, criado em 2012 por Leonardo Régis Orrico para conectar moradores do Buritis e do Estoril.',
})

// background-image via CSS não passa pelo <NuxtPicture>, então usamos
// useImage() pra gerar a mesma URL otimizada (webp) manualmente.
const img = useImage()
const fundoOtimizado = img('/hero/postfixo-facebook.png', { width: 1600, format: 'webp' })
</script>

<template>
  <article>
    <div
      class="bg-cover bg-center py-24"
      :style="{ backgroundImage: `linear-gradient(rgba(20, 20, 18, 0.75), rgba(20, 20, 18, 0.75)), url(${fundoOtimizado})` }"
    >
      <div class="mx-auto max-w-2xl px-4 text-center text-white">
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-300">Quem Somos</p>
        <h1 class="mt-2 text-balance font-serif text-3xl font-bold">
          Conectando vidas, contando histórias
        </h1>
      </div>
    </div>

    <div class="mx-auto max-w-2xl px-4 py-16">

    <div class="prose prose-stone mt-8 max-w-none">
      <p>
        Tudo começou com uma ideia simples: conectar os moradores do Buritis e do Estoril em um
        espaço acolhedor, onde informação de qualidade e espírito de comunidade andassem lado a
        lado. Em 2012, muito antes das redes sociais dominarem a comunicação local, nascia o
        projeto Meu Bairro Buritis — criado por Leonardo Régis Orrico, publicitário, especialista
        em marketing digital e morador apaixonado pelo bairro.
      </p>
      <p>
        O objetivo era claro: dar voz à vizinhança, apoiar o comércio local e fortalecer os laços
        entre os moradores. O que começou como um pequeno grupo no Facebook cresceu e se
        transformou em uma verdadeira rede de apoio, informação e oportunidades. Ao longo dos anos,
        fomos palco de campanhas solidárias, promovemos eventos gratuitos, valorizamos histórias
        inspiradoras, denunciamos problemas urbanos e celebramos conquistas da nossa região.
      </p>
      <p>
        Nosso projeto é feito por quem vive o bairro todos os dias. Gente que acredita no poder da
        união e da informação local. Hoje, com mais de uma década de atuação, o Meu Bairro Buritis
        está presente no Instagram, Facebook, WhatsApp, Telegram, TikTok e YouTube — além de manter
        este portal completo, moderno e cheio de novidades para você.
      </p>
      <p>
        A mente por trás dessa jornada é Leonardo Régis Orrico. Nascido em Brasília, mas criado em
        BH, ele enfrentou desde jovem uma deficiência física progressiva que afeta sua coordenação
        motora e audição. Mesmo diante dos desafios, Leonardo nunca deixou de acreditar no impacto
        que a comunicação pode ter na vida das pessoas. Seu olhar sensível, seu perfeccionismo e sua
        dedicação diária ao projeto são os pilares que sustentam tudo isso. Em 2024, pela primeira
        vez, ele decidiu mostrar seu rosto em um vídeo para a comunidade, revelando sua história e a
        trajetória por trás do projeto. O vídeo viralizou e trouxe ainda mais reconhecimento e afeto
        por parte dos seguidores.
      </p>
      <p>
        O Meu Bairro Buritis é mais do que um site ou um perfil nas redes: é uma ponte. Um canal
        direto entre quem quer divulgar, quem quer descobrir e quem quer transformar o bairro num
        lugar ainda melhor. Se você também acredita nisso, junte-se a nós.
      </p>
      <p class="font-semibold text-stone-900">
        Juntos, somos mais fortes. Juntos, somos Meu Bairro Buritis.
      </p>
      </div>
    </div>
  </article>
</template>
