# Lighthouse da produção antes do redesign

Medido em 29/10/2026, na produção atual (`https://meubairroburitis.com.br`).

- Lighthouse 13.5.0, Chrome headless, uma rodada por página.
- Perfil padrão no celular (Moto G Power com 4G lento simulado) e `--preset=desktop` no computador.
- Categorias: performance, acessibilidade, boas práticas e SEO.

Serve de "antes" para a fase 7. A comparação final roda o mesmo script, nas mesmas páginas, nas mesmas condições. Uma rodada só oscila alguns pontos em performance, então diferenças pequenas não contam.

| Página | Aparelho | Perf. | Acess. | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | celular | 62 | 100 | 81 | 100 | 4,6 s | 0 | 580 ms |
| `/` | computador | 96 | 95 | 81 | 100 | 1,2 s | 0,011 | 70 ms |
| `/noticias` | celular | 67 | 98 | 81 | 100 | 4,2 s | 0 | 350 ms |
| `/noticias` | computador | 61 | 93 | 81 | 100 | 6,8 s | 0 | 130 ms |
| `/noticias/guia-de-pizzarias-…` | celular | 58 | 100 | 81 | 100 | 10,8 s | 0 | 500 ms |
| `/noticias/guia-de-pizzarias-…` | computador | 92 | 95 | 81 | 100 | 1,8 s | 0 | 30 ms |
| `/empresas` | celular | 61 | 100 | 81 | 100 | 7,7 s | 0 | 330 ms |
| `/empresas` | computador | 90 | 95 | 81 | 100 | 1,6 s | 0 | 80 ms |
| `/empresas/hortisul-43` | celular | 62 | 96 | 81 | 100 | 7,3 s | 0 | 270 ms |
| `/empresas/hortisul-43` | computador | 86 | 96 | 81 | 100 | 2,2 s | 0 | 60 ms |
| `/loja` | celular | 82 | 93 | 81 | 100 | 3,1 s | 0 | 320 ms |
| `/loja` | computador | 84 | 93 | 81 | 100 | 2,1 s | 0 | 50 ms |

## Fase 2: home nova na prévia × produção (29/10/2026, noite)

Mesma ferramenta e mesmos perfis. Foram três rodadas, alternando produção e prévia na mesma sessão para as duas pegarem as mesmas condições de rede. A tabela traz a mediana do LCP e a faixa das três rodadas.

| Home | LCP (mediana) | LCP (rodadas) | Perf. | Acess. | Boas práticas | SEO | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Produção, celular | 4,62 s | 4,6 / 4,6 / 4,7 | 57–58 | 100 | 81 | 100 | 0 | 740–760 ms |
| **Prévia, celular** | **3,80 s** | 3,5 / 3,8 / 4,7 | 62–69 | 100 | 77 | 69 | 0 | 470–700 ms |
| Produção, computador | 1,01 s | 1,0 / 1,0 / 1,7 | 88–98 | 95 | 77–81 | 100 | 0,011 | 80–110 ms |
| **Prévia, computador** | **1,54 s** | 1,0 / 1,5 / 1,6 | 90–97 | 100 | 77 | 69 | 0,002 | 80–90 ms |

Na prévia, o SEO 69 vem do noindex, e as boas práticas 77 vêm do Cloudflare, que recusa o prefetch de arquivos em Workers. As duas coisas só existem na prévia.

## Fase 3: notícias na prévia × produção (29/10/2026, noite)

Mesma metodologia. No celular são 3 rodadas alternadas e a tabela traz a mediana; no computador, 1 rodada.

| Página | Celular, produção (LCP) | **Celular, prévia (LCP)** | Computador, produção | **Computador, prévia** |
|---|---|---|---|---|
| `/noticias` | 31,5 s (16,5 a 44) | **4,58 s** (4,5 / 4,6 / 5,0) | 3,77 s | **0,99 s** |
| matéria curta (`pintor-eletricista-faz-tudo…`) | 3,09 s | **4,03 s** (4,0 / 4,0 / 3,4) | 0,72 s | **1,02 s** |
| matéria longa (`entrevista-com-o-vereador…`) | 9,35 s | **4,05 s** (4,0 / 4,0 / 4,1) | 2,06 s | **0,84 s** |
| muitos elementos (`carros-eletricos…`, 8 listas + h1) | 9,58 s | **3,91 s** (4,2 / 3,9 / 3,9) | 1,74 s | **0,90 s** |

Performance no celular: a prévia fica entre 67 e 81; a produção, entre 51 e 89. Acessibilidade: 100 na prévia, 95 a 100 na produção. O CLS é 0 nos dois. O TBT na prévia vai de 100 a 220 ms; na produção, de 170 a 550 ms.

**Por que o celular ainda não fica abaixo de 4 s em todas:**

- A capa já não é o problema. Ela chega em menos de 0,7 s (WebP de 14 a 30 KB pelo IPX, contra PNG de 1,2 a 2,4 MB na produção).
- O que sobra é a primeira pintura (FCP de 2,5 a 3,0 s no Lighthouse simulado). Com o JS bloqueado, ela cai para 1,9 s; com a fonte ou as imagens bloqueadas, não muda.
- O peso está nos `modulepreload` do Nuxt (eram 12, ficaram 10 com a hidratação adiada do rodapé, do "Leia também" e do bloco dos canais) e nos ~137 KB de CSS embutidos em todo HTML.
- Desse CSS, ~85 KB são utilitários do Tailwind, ~20 KB são `prose` e ~15 KB são as cores que o Nuxt UI gera sem uso.
- A matéria curta piora em relação à produção porque lá a página não tem fonte própria nem preloads e a capa local já era pequena (AVIF 700 px). Na prévia ela fica em 4,0 s.
- **Proposta para a fase 7:** tirar o `@nuxt/ui`. O site não usa nenhum componente dele; ficariam só o `@nuxtjs/tailwindcss`, o `@nuxt/icon` e o plugin de tipografia. Isso corta o CSS das cores, o color-mode e JS do cliente, e vale para todas as páginas. É mudança de dependência e precisa de aprovação.

## CSS embutido × externo (fase 4, item 2), 30/10/2026

Medição em Playwright, celular simulado (412×823, 4G lento do Lighthouse: 150 ms de latência e 1,6 Mbps; CPU 4× mais lenta), mediana de 5 rodadas. A "2ª página" é outra página aberta logo depois, com o cache do navegador cheio. Na prévia, o `_headers` reproduz o cache de 6 meses do `.htaccess` da produção para `/_nuxt/` e `/_ipx/`.

| Situação | CSS embutido (LCP) | **CSS externo (LCP)** | FCP embutido | FCP externo |
|---|---|---|---|---|
| 1ª visita, `/` | 2.268 ms | **1.868 ms** | 1.324 ms | 1.868 ms |
| 1ª visita, `/noticias` | 1.976 ms | **1.528 ms** | 1.092 ms | 1.528 ms |
| 2ª página, matéria (depois da home) | 972 ms | **872 ms** | 600 ms | 540 ms |
| 2ª página, empresa (depois de `/noticias`) | 2.264 ms | **1.456 ms** | 628 ms | 692 ms |

O CSS externo vence em todos os LCPs. O HTML da home cai de 114 para 50 KB, e o CSS (64 KB, 13 KB comprimido) fica em cache. O primeiro conteúdo pintado da 1ª visita piora um pouco, porque o CSS bloqueia a primeira pintura, mas a página completa chega antes. **Aplicado:** `features.inlineStyles: false`.

## Fase 4: empresas e prestadores na prévia × produção (30/10/2026)

Mesma metodologia do Lighthouse. No celular são 3 rodadas alternadas (mediana); no computador, 1 rodada.

| Página | Celular, produção | **Celular, prévia** | Computador, produção | **Computador, prévia** |
|---|---|---|---|---|
| `/empresas` | 7,99 s | **4,23 s** (4,2 / 3,4 / 4,3) | 2,09 s | **0,87 s** |
| empresa com muitas fotos (`codice-digital-582`) | 5,75 s | **5,24 s** (5,2 / 5,2 / 5,7) | 1,20 s | **0,77 s** |
| empresa sem logo (`janet-felippetto-cabeleireira-686`) | 5,06 s | **4,60 s** (4,4 / 4,6 / 4,6) | 1,53 s | **0,85 s** |
| prestador (`bene-ditta-centro-auditivo-710`) | 3,41 s | **3,44 s** (3,6 / 3,4 / 3,4) | 0,64 s | **0,84 s** |

Acessibilidade: 100 na prévia e 95 a 96 na produção. CLS: 0 no celular nos dois lados.

**Por que três páginas ainda passam de 4 s no celular:**

- **Testes de bloqueio na empresa (Lighthouse):**

  | Bloqueado | LCP |
  |---|---|
  | `_nuxt/*.js` | 2,1 a 3,3 s |
  | imagens do Storage do Guia | 3,9 a 4,7 s |

  O peso está no JavaScript inicial: ~170 KB comprimido em toda página, igual em toda a rota.
- **De onde vem esse JS:** o runtime do Nuxt e **dois clientes completos do Supabase**, o do site e o do Guia, com Auth e Realtime, criados já na abertura por `plugins/supabase.ts` e `plugins/supabase-meubairro-app.ts`. Nas páginas públicas eles quase nunca são usados no navegador, porque os dados vêm do payload do build.
- **Proposta (precisa de aprovação, porque mexe no caminho de login, checkout e Meus pedidos):** criar os clientes do Supabase sob demanda, na primeira vez que alguma tela precisar. Pelo teste com o JS bloqueado, isso pode tirar de 1 a 2 s do LCP no celular.

Observações para as próximas fases:

- **LCP no celular** é o ponto fraco: de 7 a 11 s em `/empresas`, na empresa e na matéria. As capas vêm direto do Storage do Supabase, sem redimensionar (PNG de 1,6 a 2,3 MB, ver o comentário do `og:image` no `nuxt.config.ts`).
- **Boas práticas** fica em 81 em todas as páginas, sempre pela mesma falha, "Uses deprecated APIs". A origem é o script de desafio de bots do Cloudflare (`/cdn-cgi/challenge-platform/.../main.js`, injetado pelo Bot Fight Mode / JS Detections da zona), não o código do site. O redesign não muda isso. Para subir esse número, a mudança é na configuração do Cloudflare (decisão de produto).
- **LCP da home no celular:** o Lighthouse aponta que a imagem do LCP não tem `fetchpriority=high`. Entra na fase 2, no hero novo.
