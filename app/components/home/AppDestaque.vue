<template>
  <section class="bg-orange-700 text-white">
    <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:grid-cols-2">
      <div>
        <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-100">
          Guia Buritis
        </p>
        <h2 class="text-balance text-2xl font-bold sm:text-3xl">
          Além do site, temos um app inteiro dedicado ao bairro
        </h2>
        <p class="mt-4 max-w-lg text-orange-50">
          Busca de empresas e prestadores de serviço, avaliações de moradores, mensagens direto com
          quem presta o serviço — tudo feito por quem vive o Buritis todos os dias.
        </p>
        <a
          href="/guia/"
          class="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-orange-900 hover:bg-orange-50"
        >
          Conhecer o Guia Buritis
        </a>
      </div>
      <div class="hidden justify-center sm:flex">
        <NuxtPicture
          src="/app.jpg.jpeg"
          alt="Tela do app Guia Buritis"
          format="avif,webp"
          :width="420"
          :height="401"
          :img-attrs="{ class: 'w-full max-w-sm rounded-2xl shadow-2xl' }"
        />
      </div>
    </div>
  </section>
</template>
