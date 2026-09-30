<script setup lang="ts">
import { MAPA_BURITIS } from './mapaBuritisDados'

// Mapa estático dos limites do Buritis, desenhado só com a geometria oficial
// da PBH (ver mapaBuritisDados.ts / scripts/gerar-mapa-buritis.mjs): SVG
// inline, sem biblioteca, sem tiles e sem requisição extra. Coordenadas em
// metros, por isso a barra de escala é real.
defineProps<{ fonteUrl: string }>()

const { largura, altura, buritis, vizinhos } = MAPA_BURITIS
const ESCALA_M = 500
const nomesVizinhos = vizinhos.map((v) => v.nome).join(', ')
</script>

<template>
  <figure class="not-prose my-8">
    <div class="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
      <svg
        :viewBox="`0 0 ${largura} ${altura}`"
        role="img"
        aria-labelledby="mapa-buritis-titulo mapa-buritis-desc"
        class="block h-auto w-full"
        :style="{ aspectRatio: `${largura} / ${altura}` }"
      >
        <title id="mapa-buritis-titulo">Limite do bairro Buritis e bairros vizinhos</title>
        <desc id="mapa-buritis-desc">
          Contorno do bairro Buritis, destacado, segundo a delimitação de bairros populares da Prefeitura de
          Belo Horizonte (base de 2022). Bairros que fazem divisa: {{ nomesVizinhos }}.
        </desc>
        <path
          v-for="v in vizinhos"
          :key="v.nome"
          :d="v.d"
          fill-rule="evenodd"
          class="fill-white stroke-stone-300"
          stroke-width="8"
        />
        <path :d="buritis.d" fill-rule="evenodd" class="fill-orange-100 stroke-orange-700" stroke-width="16" />
        <text
          v-for="v in vizinhos.filter((x) => x.rotulo)"
          :key="`r-${v.nome}`"
          :x="v.rotulo![0]"
          :y="v.rotulo![1]"
          text-anchor="middle"
          class="fill-stone-600"
          font-size="72"
          paint-order="stroke"
          stroke="white"
          stroke-width="18"
          stroke-linejoin="round"
        >
          {{ v.nome }}
        </text>
        <text
          :x="buritis.rotulo[0]"
          :y="buritis.rotulo[1]"
          text-anchor="middle"
          class="fill-orange-900 font-semibold"
          font-size="110"
        >
          Buritis
        </text>
        <!-- barra de escala: 500 m reais (coordenadas em metros) -->
        <g :transform="`translate(${largura - ESCALA_M - 120} ${altura - 110})`" class="fill-stone-700">
          <rect :width="ESCALA_M" height="16" />
          <text :x="ESCALA_M / 2" y="-24" text-anchor="middle" font-size="64">500 m</text>
        </g>
      </svg>
    </div>
    <figcaption class="mt-3 text-sm leading-relaxed text-stone-600">
      <span class="mr-3 inline-flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm border-2 border-orange-700 bg-orange-100" aria-hidden="true" />
        Bairro Buritis
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="inline-block h-3 w-3 rounded-sm border border-stone-300 bg-white" aria-hidden="true" />
        Bairros vizinhos
      </span>
      <span class="mt-1 block">
        Delimitação de bairro popular, PBH 2022. Fonte:
        <a :href="fonteUrl" target="_blank" rel="noopener noreferrer" class="font-medium text-orange-700 underline hover:no-underline">
          Prefeitura de Belo Horizonte, População e Domicílio por Bairro 2022
        </a>.
        Bairros que fazem divisa com o Buritis nessa base: {{ nomesVizinhos }}.
      </span>
    </figcaption>
  </figure>
</template>
