/**
 * Injeta JSON-LD (Schema.org) direto via useHead, sem depender dos
 * composables do @nuxtjs/seo — `useSchemaOrg`/`defineProduct` do módulo não
 * estavam renderizando o <script> no HTML via SSR nesta versão (nuxt 3.21 +
 * nuxt-schema-org 4.1.3), então usamos o mecanismo nativo do Nuxt, que
 * sempre funciona em SSR/prerender.
 */
export function useJsonLd(schema: Record<string, unknown>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({ '@context': 'https://schema.org', ...schema }),
      },
    ],
  })
}
