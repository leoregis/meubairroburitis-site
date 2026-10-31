# Core Web Vitals reais: o "antes" do redesign

Fonte: Cloudflare Web Analytics, pela API GraphQL (`rumWebVitalsEventsAdaptiveGroups`), extraído com `node docs/redesign/cwv.mjs`. Dados brutos em `cwv-antes.json`.

- **Período desta extração:** de 29/10/2026 00:00 a 31/10/2026 ~00:15 (UTC), cerca de 2 dias. O Web Analytics foi ligado em 29/10.
- **Filtros:** só `meubairroburitis.com.br` (a prévia e a Central ficam de fora) e sem bots.
  - **Bots:** as medições automáticas da sessão, com Chrome headless, aparecem como `bot = 1`. Foram 206 eventos na produção e 1.778 na prévia, todos excluídos.
- **Cálculo:** cada p75 só sobre os eventos que mediram aquela métrica. O CLS usa os eventos com LCP medido.

| Grupo | Aparelho | Amostra (LCP) | LCP p75 | CLS p75 | Amostra (INP) | INP p75 |
|---|---|---|---|---|---|---|
| `site inteiro (sem /guia/)` | celular | 68 | 1,51 s | 0,000 | 16 | 88 ms |
| `site inteiro (sem /guia/)` | computador | 19 (pequena) | 2,34 s | 0,000 | 4 | 56 ms |
| `site inteiro (sem /guia/)` | **todos** | 87 | 1,66 s | 0,000 | 20 | 80 ms |
| `/` | celular | 8 (pequena) | 1,00 s | 0,000 | 1 | 112 ms |
| `/` | computador | 1 (pequena) | 0,95 s | 0,000 | 0 | — |
| `/` | **todos** | 9 (pequena) | 1,00 s | 0,000 | 1 | 112 ms |
| `/loja` | celular | 3 (pequena) | 1,37 s | 0,000 | 1 | 8 ms |
| `/loja` | computador | 1 (pequena) | 1,44 s | 0,000 | 0 | — |
| `/loja` | **todos** | 4 (pequena) | 1,37 s | 0,000 | 1 | 8 ms |
| `/loja/*` | celular | 0 (pequena) | — | — | 0 | — |
| `/loja/*` | computador | 0 (pequena) | — | — | 0 | — |
| `/loja/*` | **todos** | 0 (pequena) | — | — | 0 | — |
| `/empresas/*` | celular | 18 (pequena) | 1,75 s | 0,000 | 4 | 80 ms |
| `/empresas/*` | computador | 10 (pequena) | 2,62 s | 0,000 | 3 | 56 ms |
| `/empresas/*` | **todos** | 28 (pequena) | 1,90 s | 0,000 | 7 | 80 ms |
| `/noticias/*` | celular | 15 (pequena) | 1,64 s | 0,000 | 4 | 112 ms |
| `/noticias/*` | computador | 5 (pequena) | 1,08 s | 0,000 | 1 | 8 ms |
| `/noticias/*` | **todos** | 20 (pequena) | 1,46 s | 0,000 | 5 | 112 ms |

## Limite importante: a amostra é pequena

- **Volume:** o Web Analytics registra ~170 visualizações de página por dia na produção, sem bots (165 em 29/10 e 179 em 30/10, sem amostragem: `sampleInterval` = 1). Bloqueadores de anúncio e navegadores dentro de apps também deixam parte das visitas sem medição.
- **Por grupo:** em 7 dias, a `/loja` deve somar ~15 medições e os produtos (`/loja/*`), poucas ou nenhuma. Nessa escala, um p75 muda bastante com 2 ou 3 visitas, e "piorar mais de 20%" pode acontecer por acaso.
- **Regra do gatilho de reversão** (aprovada pelo Leo em 30/10/2026; o texto completo está em `fase-7.md`, seção 4):
  1. **"Antes":** refazer esta extração em 09/11 com `--desde 2026-10-29 --ate 2026-11-10`, 12 dias de dados.
  2. **"Depois":** 7 dias; grupo com menos de 50 medições de LCP estende para 14 dias.
  3. **Gatilho de 20% no LCP p75:** só para grupo com 50 ou mais medições. Inclui o **site inteiro (sem `/guia/`)**, que já passa de 50 nestes 2 dias.
  4. **`/loja` e `/loja/*`, se não chegarem a 50:** decide a medição de laboratório com o critério novo. A `/loja` pode ficar atrás da produção, desde que fique **abaixo de 2,5 s de LCP no laboratório**. Acima disso, revertemos ou otimizamos antes de seguir.

## Como refazer

```
node docs/redesign/cwv.mjs --desde 2026-10-29 --ate 2026-11-10 --saida docs/redesign/cwv-antes.json
node docs/redesign/cwv.mjs --desde 2026-11-10 --ate 2026-11-17 --saida docs/redesign/cwv-depois.json
```

O token fica em `Documents\Projetos-locais\cloudflare-analytics.env`, com permissão Account > Account Analytics > Read (suficiente: confirmado em 30/10). O script nunca o exibe.
