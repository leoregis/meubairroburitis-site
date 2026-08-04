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
      routes: ['/', '/sitemap.xml', '/conteudo'],
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
    // páginas 2+ da listagem de notícias -- conteúdo já indexado via a
    // página do artigo em si, não precisa disputar posição no Google nem
    // aparecer no sitemap (página 1, /noticias, continua indexável normal)
    '/noticias/pagina/**': { robots: false },
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
        const rotasProdutos = (data || []).map((p: { slug: string }) => `/loja/${p.slug}`)

        // notícias: cada slug publicado vira uma rota, mais uma rota por
        // página da listagem (paginação em caminho de verdade -- /noticias,
        // /noticias/pagina/2, etc. -- query string tipo ?pagina=2 não
        // funciona em host 100% estático, o Apache serve sempre o mesmo
        // arquivo pra mesma URL não importa a query).
        const { data: noticiasData } = await supabase
          .from('noticias')
          .select('slug', { count: 'exact' })
          .eq('status', 'publicado')
          .eq('tipo', 'noticia')

        const rotasNoticias = (noticiasData || []).map((n: { slug: string }) => `/noticias/${n.slug}`)

        const NOTICIAS_POR_PAGINA = 12
        const totalNoticias = noticiasData?.length ?? 0
        const totalPaginas = Math.max(1, Math.ceil(totalNoticias / NOTICIAS_POR_PAGINA))
        const rotasPaginacao = Array.from({ length: totalPaginas - 1 }, (_, i) => `/noticias/pagina/${i + 2}`)

        // conteúdo (blog/guia -- rota /conteudo, mesma tabela de notícias
        // filtrada por tipo): cada artigo publicado vira uma rota explícita,
        // pelo mesmo motivo das notícias -- não depender só do crawler achar
        // o link a partir de /.
        const { data: conteudoData } = await supabase
          .from('noticias')
          .select('slug')
          .eq('status', 'publicado')
          .eq('tipo', 'conteudo')

        const rotasConteudo = (conteudoData || []).map((c: { slug: string }) => `/conteudo/${c.slug}`)

        nitroConfig.prerender ||= {}
        nitroConfig.prerender.routes = [
          ...(nitroConfig.prerender.routes || []),
          ...rotasProdutos,
          ...rotasNoticias,
          ...rotasPaginacao,
          ...rotasConteudo,
        ]
      } catch {
        // build-time best-effort — se o Supabase não estiver acessível no
        // momento do build, o crawler ainda cobre as rotas linkadas da home
      }
    },
  },
})
