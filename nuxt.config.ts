// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-29',
  srcDir: 'app/',
  devtools: { enabled: true },

  ssr: true,
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml'],
      // não deixa um link quebrado (ou externo/cross-app, como /guia/)
      // abortar o build inteiro — só evita que aquela rota específica saia
      // do build, o resto continua normalmente.
      failOnError: false,
    },
  },

  routeRules: {
    // /guia/ é o outro app (Guia Buritis), publicado à parte no mesmo
    // domínio — não faz parte deste build, então o crawler do prerender
    // não deve tentar gerar essa rota aqui.
    '/guia/**': { prerender: false },
    // páginas dinâmicas/privadas: não existem em build-time (pedido) ou não
    // devem ser indexadas nem geradas estaticamente (admin).
    '/pedido/**': { prerender: false, robots: false },
    '/admin/**': { prerender: false, robots: false },
    '/carrinho': { prerender: false, robots: false },
  },

  // combinado com routeRules acima, o manifesto client-side de route-rules
  // quebra a resolução do módulo virtual "#app-manifest" em `nuxt dev`
  // nesta versão (não afeta `nuxt generate`, que já foi validado
  // funcionando ponta a ponta) — desativado só para destravar o dev.
  experimental: {
    appManifest: false,
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/seo',
  ],

  icon: {
    serverBundle: false,
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://meubairroburitis.com.br',
    name: 'Meu Bairro Buritis',
  },

  // geração automática de OG image via satori está quebrando no build
  // (conflito de versão do unenv) e não é algo que usamos nesta fase —
  // og:image vem de arquivo estático (ver useSeoMeta ogImage por página).
  ogImage: {
    enabled: false,
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      whatsappNumero: '5531990749082',
      // chave PÚBLICA do Mercado Pago (não é segredo — usada só pra
      // tokenizar cartão no navegador via Card Payment Brick). O access
      // token real fica só nos secrets das edge functions, nunca aqui.
      mpPublicKey: process.env.NUXT_PUBLIC_MP_PUBLIC_KEY || '',
    },
  },

  hooks: {
    // @nuxtjs/sitemap descobre <img> nas páginas já renderizadas usando a
    // lib ultrahtml, que NÃO decodifica entidades HTML dos atributos —
    // pega o "&amp;" literal (já escapado corretamente uma vez pelo HTML)
    // como texto puro, e o serializador de XML escapa esse "&" de novo por
    // cima, virando "&amp;amp;" (corrompe toda <image:loc> que usa o proxy
    // de imagem do Nuxt Image, que separa parâmetros com "&" no path, ex:
    // /_ipx/f_jpeg&s_3072x2048/...). Bug é da dependência, não dá pra
    // corrigir na origem sem forkar ela -- intercepta aqui, na única rota
    // afetada, bem antes do arquivo final ser escrito em disco.
    'nitro:init'(nitro) {
      nitro.hooks.hook('prerender:generate', (route) => {
        if (route.route === '/sitemap.xml' && typeof route.contents === 'string') {
          route.contents = route.contents.replaceAll('&amp;amp;', '&amp;')
        }
      })
    },
    async 'nitro:config'(nitroConfig) {
      // Garante que cada página de produto seja pré-renderizada mesmo que o
      // crawler não a alcance a partir de / — busca os slugs direto no
      // Supabase em tempo de build.
      const url = process.env.NUXT_PUBLIC_SUPABASE_URL
      const key = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) return

      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(url, key)
        const { data } = await supabase.from('produtos').select('slug').eq('ativo', true)
        const rotas = (data || []).map((p: { slug: string }) => `/loja/${p.slug}`)
        nitroConfig.prerender ||= {}
        nitroConfig.prerender.routes = [...(nitroConfig.prerender.routes || []), ...rotas]
      } catch {
        // build-time best-effort — se o Supabase não estiver acessível no
        // momento do build, o crawler ainda cobre as rotas linkadas da home
      }
    },
  },
})
