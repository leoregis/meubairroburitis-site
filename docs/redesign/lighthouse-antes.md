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

Observações para as próximas fases:

- **LCP no celular** é o ponto fraco: de 7 a 11 s em `/empresas`, na empresa e na matéria. As capas vêm direto do Storage do Supabase, sem redimensionar (PNG de 1,6 a 2,3 MB, ver o comentário do `og:image` no `nuxt.config.ts`).
- **Boas práticas** fica em 81 em todas as páginas, sempre pela mesma falha, "Uses deprecated APIs". A origem é o script de desafio de bots do Cloudflare (`/cdn-cgi/challenge-platform/.../main.js`, injetado pelo Bot Fight Mode / JS Detections da zona), não o código do site. O redesign não muda isso. Para subir esse número, a mudança é na configuração do Cloudflare (decisão de produto).
- **LCP da home no celular:** o Lighthouse aponta que a imagem do LCP não tem `fetchpriority=high`. Entra na fase 2, no hero novo.
