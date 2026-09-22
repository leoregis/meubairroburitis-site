# meubairroburitis-site

Site institucional do Meu Bairro Buritis (meubairroburitis.com.br), reconstruído sem
WordPress/WooCommerce. Nuxt 3 com SSR + prerender real (SSG), vitrine de pacotes de
anúncio com carrinho client-side e finalização via WhatsApp.

Projeto separado do `meubairro-app` (Guia Buritis), com Supabase próprio.

## Rodando local

```bash
npm install
cp .env.example .env   # preencha com o projeto Supabase deste site
npm run dev
```

## Build estático (SSG)

```bash
npm run generate
```

Gera `.output/public/` com HTML real (SSR) de cada página, incluindo cada pacote da
vitrine — meta tags e Schema.org já embutidos no HTML, sem depender de JS no cliente.

## Estrutura

Ver o plano de arquitetura em
`C:\Users\leore\.claude\plans\rippling-jumping-dongarra.md` para o racional completo
(stack, rotas, modelo de dados, deploy).

## Deploy

`.github/workflows/deploy.yml` builda e sobe via `lftp` para uma pasta nova
(`public_html/_release_<sha>/`), depois faz um rename atômico pra
`public_html/_current/` — zero downtime, testado e confirmado no provedor atual.
Requer os secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`,
`NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY`.

## Pendências técnicas conhecidas

**Soft-404 em rotas dinâmicas.** O site é 100% SSG com fallback via
`.htaccess` (`_current/200.html` para qualquer caminho sem arquivo estático
correspondente), sempre retornando HTTP 200. Isso afeta igualmente
`/noticias/[slug]`, `/loja/[slug]`, `/empresas/[slug]` e
`/prestadores/[slug]`: um slug inexistente serve o shell client-only vazio
com status 200 em vez de 404 real, o que é ruim para SEO (risco de soft-404
no Google Search Console).

Corrigir isso exige alterar o `.htaccess` compartilhado por todo o site
(ex.: mapear rotas dinâmicas conhecidas para checagem antes do fallback, ou
mover para alguma forma de renderização sob demanda), o que é uma mudança
de arquitetura maior, fora do escopo de qualquer uma das fases da camada
pública de SEO (Fases 1-4, empresas/prestadores). Não corrigir apenas para
`/empresas/`/`/prestadores/` sem tratar `/noticias/`/`/loja/` da mesma
forma, para não criar inconsistência de comportamento entre seções do site.
