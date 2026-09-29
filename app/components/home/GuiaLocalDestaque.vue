<script setup lang="ts">
// Vitrine do comércio local na home -- uma amostra de empresas e de
// prestadores (os mais avaliados pelos moradores, ver
// useEmpresasDestaqueHome) com link pra listagem completa. Reaproveita os
// mesmos cards das páginas /empresas e /prestadores, sem estilo novo.
const { data: empresas } = await useEmpresasDestaqueHome()
const { data: prestadores } = await usePrestadoresDestaqueHome()
</script>

<template>
  <section v-if="empresas?.length || prestadores?.length" class="bg-stone-50 py-16">
    <div class="mx-auto max-w-6xl space-y-14 px-4">
      <div v-if="empresas?.length">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Comércio local</p>
            <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">Empresas do bairro</h2>
          </div>
          <NuxtLink to="/empresas" class="inline-flex min-h-[44px] items-center text-sm font-semibold text-orange-700 hover:underline">
            Ver todas as empresas →
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
          <EmpresasCard v-for="empresa in empresas" :key="empresa.unidade_id" :empresa="empresa" />
        </div>
      </div>

      <div v-if="prestadores?.length">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Serviços</p>
            <h2 class="mt-2 text-balance text-2xl font-bold text-stone-900 sm:text-3xl">Prestadores de confiança</h2>
          </div>
          <NuxtLink to="/prestadores" class="inline-flex min-h-[44px] items-center text-sm font-semibold text-orange-700 hover:underline">
            Ver todos os prestadores →
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
          <PrestadoresCard v-for="prestador in prestadores" :key="prestador.id" :prestador="prestador" />
        </div>
      </div>
    </div>
  </section>
</template>
