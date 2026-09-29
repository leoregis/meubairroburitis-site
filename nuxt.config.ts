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
      // /links não é linkada em nenhuma página crawleada (é uma página
      // "link na bio", só acessada direto via QR code/bio de rede social)
      // -- precisa entrar na lista explícita ou o crawler nunca a gera.
      // /termos-e-condicoes (Fase 7d) tem o mesmo problema -- só existe
      // pra receber o redirect da URL antiga do WordPress, sem link em
      // nenhuma página navegável ainda.
      routes: ['/', '/sitemap.xml', '/links', '/pagina-nao-encontrada', '/termos-e-condicoes'],
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
    // Fase 7b -- página de erro 404 real (ver ErrorDocument no
    // .htaccess) -- existe só pra ser servida como erro, nunca deve
    // aparecer no sitemap nem ser indexada como se fosse conteúdo.
    '/pagina-nao-encontrada': { robots: false },
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

  // sem `css: ['~/assets/css/main.css']` de propósito: o @nuxt/ui v2 já
  // instala o @nuxtjs/tailwindcss, que injeta o próprio tailwind.css (com
  // @tailwind base/components/utilities). O main.css repetia as mesmas 3
  // diretivas -- o Tailwind inteiro saía DUAS vezes inline no <head> de
  // toda página (~220KB antes das tags og:*).

  app: {
    head: {
      // sem isso o <html> sai sem lang (achado do PageSpeed) -- leitor de
      // tela lê o conteúdo com pronúncia de outro idioma.
      htmlAttrs: { lang: 'pt-BR' },
      // favicon (monograma "b", app/public). Nomes "icone-mbb*" e não
      // "favicon.svg" de propósito: existe um favicon.svg órfão (logo do
      // Vite) solto na raiz do hosting, e arquivo físico na raiz vence
      // o _current no .htaccess -- com o mesmo nome, ele seria servido no
      // lugar do nosso. /favicon.ico não tem esse problema (não existe na
      // raiz) e fica como o caminho convencional que crawlers pedem direto.
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icone-mbb.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icone-mbb-192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  // robots.txt gerado pelo build (nuxt-robots, via @nuxtjs/seo) é o dono da
  // raiz do domínio: declara o sitemap deste site (automático) e também o
  // do Guia Buritis (app em /guia/, deploy separado), pra não tirar o app
  // dos buscadores. O robots.txt solto que o app subia pra raiz saiu do
  // deploy dele, e o deploy.yml daqui remove a cópia que ficou lá.
  robots: {
    sitemap: ['https://meubairroburitis.com.br/guia/sitemap.xml'],
  },

  site: {
    url: 'https://meubairroburitis.com.br',
    name: 'Meu Bairro Buritis',
    defaultLocale: 'pt-BR',
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
      // Fase 4 -- projeto Supabase do meubairro-app, só pra leitura pública
      // (anon) das RPCs de SEO buscar_empresa_publica_seo/
      // buscar_prestador_publico_seo. Projeto SEPARADO do
      // NUXT_PUBLIC_SUPABASE_URL acima (que é o do site).
      meubairroAppSupabaseUrl: process.env.NUXT_PUBLIC_MEUBAIRRO_APP_SUPABASE_URL || '',
      meubairroAppSupabaseAnonKey: process.env.NUXT_PUBLIC_MEUBAIRRO_APP_SUPABASE_ANON_KEY || '',
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
        // Node 20 não tem WebSocket nativo, e o supabase-js sempre instancia
        // um RealtimeClient no construtor mesmo sem uso de realtime -- sem
        // isso, createClient lança "Node.js 20 detected without native
        // WebSocket support" e o try inteiro abaixo falha silenciosamente
        // (catch), inclusive pras rotas de produtos/notícias que já
        // existiam (mascarado até agora porque crawlLinks acaba
        // descobrindo essas rotas de outro jeito -- mas empresas/
        // prestadores não têm nenhuma página de listagem linkando ainda,
        // então dependem 100% desta injeção funcionar). Mesmo workaround
        // já usado em app/plugins/supabase.ts.
        const { default: ws } = await import('ws')
        const supabase = createClient(url, key, { realtime: { transport: ws as never } })
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

        const rotasNoticias = (noticiasData || []).map((n: { slug: string }) => `/noticias/${n.slug}`)

        const NOTICIAS_POR_PAGINA = 12
        const totalNoticias = noticiasData?.length ?? 0
        const totalPaginas = Math.max(1, Math.ceil(totalNoticias / NOTICIAS_POR_PAGINA))
        const rotasPaginacao = Array.from({ length: totalPaginas - 1 }, (_, i) => `/noticias/pagina/${i + 2}`)

        // Fase 4 -- empresas/prestadores (SEO) vivem no projeto Supabase do
        // meubairro-app, SEPARADO do projeto acima (site). Reaproveita
        // tabelas/views que já têm GRANT SELECT pra anon -- nenhuma view/RPC
        // nova foi criada só pra esta enumeração:
        //   - empresas_unidades: já tem GRANT direto pra anon.
        //   - prestadores (tabela base) NÃO tem GRANT pra anon -- por isso
        //     usa vw_prestadores_publico, que já expõe slug/ativo e já é
        //     pública, em vez de tentar ler a tabela base.
        const urlMba = process.env.NUXT_PUBLIC_MEUBAIRRO_APP_SUPABASE_URL
        const keyMba = process.env.NUXT_PUBLIC_MEUBAIRRO_APP_SUPABASE_ANON_KEY
        let rotasEmpresas: string[] = []
        let rotasPrestadores: string[] = []

        if (urlMba && keyMba) {
          const supabaseMba = createClient(urlMba, keyMba, { realtime: { transport: ws as never } })

          const { data: empresasData } = await supabaseMba
            .from('empresas_unidades')
            .select('slug')
            .eq('ativo', true)
            .not('slug', 'is', null)

          rotasEmpresas = (empresasData || []).map((e: { slug: string }) => `/empresas/${e.slug}`)

          const { data: prestadoresData } = await supabaseMba
            .from('vw_prestadores_publico')
            .select('slug')
            .eq('ativo', true)
            .not('slug', 'is', null)

          rotasPrestadores = (prestadoresData || []).map((p: { slug: string }) => `/prestadores/${p.slug}`)

          // Fase 5 -- listagens paginadas + por categoria. Depende de
          // vw_empresas_publico_listagem/vw_prestadores_publico_listagem e
          // da coluna slug_seo (migration própria, aplicada separadamente
          // da Fase 4) -- isolado em try/catch próprio pra que, se essa
          // migration ainda não tiver rodado no banco, o build continue
          // gerando normalmente as páginas de detalhe da Fase 3/4 (só as
          // rotas de listagem novas ficam de fora, em vez de derrubar a
          // enumeração inteira -- mesma lição do bug do `ws` da Fase 4).
          try {
            const ITENS_POR_PAGINA = 24

            async function enumerarPaginas(tabela: string, baseRota: string, categoriaSlug?: string) {
              let query = supabaseMba.from(tabela).select('*', { count: 'exact', head: true })
              if (categoriaSlug) query = query.eq('categoria_slug', categoriaSlug)
              const { count } = await query
              const totalPaginas = Math.max(1, Math.ceil((count || 0) / ITENS_POR_PAGINA))
              return Array.from({ length: totalPaginas - 1 }, (_, i) => `${baseRota}/pagina/${i + 2}`)
            }

            rotasEmpresas.push('/empresas', ...(await enumerarPaginas('vw_empresas_publico_listagem', '/empresas')))
            rotasPrestadores.push('/prestadores', ...(await enumerarPaginas('vw_prestadores_publico_listagem', '/prestadores')))

            const { data: categoriasEmpresa } = await supabaseMba.from('empresas_categorias').select('slug_seo')
            for (const c of categoriasEmpresa || []) {
              const base = `/empresas/categoria/${c.slug_seo}`
              rotasEmpresas.push(base, ...(await enumerarPaginas('vw_empresas_publico_listagem', base, c.slug_seo)))
            }

            const { data: categoriasPrestador } = await supabaseMba.from('categorias').select('slug_seo').eq('ativo', true)
            for (const c of categoriasPrestador || []) {
              const base = `/prestadores/categoria/${c.slug_seo}`
              rotasPrestadores.push(base, ...(await enumerarPaginas('vw_prestadores_publico_listagem', base, c.slug_seo)))
            }
          } catch (erroFase5) {
            console.warn('[nitro:config] Fase 5 (listagens/categorias) pulada -- provável migration slug_seo ainda não aplicada:', erroFase5)
          }
        }

        nitroConfig.prerender ||= {}
        nitroConfig.prerender.routes = [
          ...(nitroConfig.prerender.routes || []),
          ...rotasProdutos,
          ...rotasNoticias,
          ...rotasPaginacao,
          ...rotasEmpresas,
          ...rotasPrestadores,
        ]
      } catch {
        // build-time best-effort — se o Supabase não estiver acessível no
        // momento do build, o crawler ainda cobre as rotas linkadas da home
      }
    },
  },
})
