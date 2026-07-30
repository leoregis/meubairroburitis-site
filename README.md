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
