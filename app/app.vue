<script setup lang="ts">
// Sem preload da fonte (fase 6, 30/10/2026): com o CSS embutido, o
// @font-face já é lido no começo do HTML e a fonte é pedida logo. O preload
// disputava a banda do celular com o HTML e o JS antes da 1ª pintura (ver
// nuxt.config.ts, features.inlineStyles). A fonte continua com
// font-display: swap: o texto aparece na fonte do sistema e troca quando ela chega.
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
