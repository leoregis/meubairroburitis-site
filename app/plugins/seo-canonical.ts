// nuxt-seo-utils (submódulo do @nuxtjs/seo responsável pelo canonical
// automático a partir de site.url) está desabilitado nesta versão --
// incompatível com o Nuxt instalado (nuxt-seo-utils@6.x exige nuxt
// <3.16.0, este projeto usa 3.21.10). O build mostra isso claramente:
// "Module nuxt-seo-utils is disabled due to incompatibility issues".
// Por isso NENHUMA página do site (não só a home) tem <link
// rel="canonical">, mesmo com site.url configurado -- confirmado testando
// a home e uma notícia real, as duas sem a tag. Corrige explicitamente
// até o pacote ser atualizado pra uma versão compatível (upgrade maior,
// fora do escopo desta correção pontual).
export default defineNuxtPlugin(() => {
  const route = useRoute()
  const siteConfig = useSiteConfig()

  useHead({
    link: [
      {
        rel: 'canonical',
        href: () => `${siteConfig.url}${route.path}`,
      },
    ],
  })
})
