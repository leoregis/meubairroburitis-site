# Core Web Vitals reais: o "antes" do redesign

Fonte: Cloudflare Web Analytics, pela API GraphQL, extraído com `node docs/redesign/cwv.mjs`. Dados em `cwv-antes.json`, com os eventos brutos.

## Extração oficial: 29/10 a 09/11/2026 (feita em 09/11, ~13:30 UTC)

```
node docs/redesign/cwv.mjs --desde 2026-10-29 --ate 2026-11-10 --eventos --saida docs/redesign/cwv-antes.json
```

- **Período:** de 29/10/2026 00:00 a 09/11/2026 ~13:30 (UTC). O `--ate` é exclusivo; o resto de 09/11 ainda não tinha acontecido.
- **Filtros:** só `meubairroburitis.com.br` (a prévia e a Central ficam de fora) e sem bots.
- **Cálculo:** cada p75 só sobre os eventos que mediram aquela métrica. O CLS usa os eventos com LCP medido.
- **Amostra:** medições reais, contadas evento a evento (ver "Por que `--eventos`").
- **Arquivo congelado:** não refazer depois de 09/11. Os dias mais antigos viram amostra de 10% com o tempo, e uma nova extração do mesmo período daria outro resultado.

| Grupo | Aparelho | Amostra (LCP) | LCP p75 | CLS p75 | Amostra (INP) | INP p75 |
|---|---|---|---|---|---|---|
| `site inteiro (sem /guia/)` | celular | 386 | 1,22 s | 0,000 | 105 | 104 ms |
| `site inteiro (sem /guia/)` | computador | 152 | 1,43 s | 0,000 | 54 | 56 ms |
| `site inteiro (sem /guia/)` | **todos** | 539 | 1,26 s | 0,000 | 159 | 88 ms |
| `/` | celular | 32 (pequena) | 1,01 s | 0,000 | 9 | 96 ms |
| `/` | computador | 21 (pequena) | 2,04 s | 0,004 | 2 | 208 ms |
| `/` | **todos** | 53 | 1,15 s | 0,000 | 11 | 96 ms |
| `/loja` | celular | 22 (pequena) | 0,49 s | 0,000 | 6 | 80 ms |
| `/loja` | computador | 2 (pequena) | 1,33 s | 0,000 | 0 | — |
| `/loja` | **todos** | 24 (pequena) | 0,67 s | 0,000 | 6 | 80 ms |
| `/loja/*` | celular | 1 (pequena) | 0,26 s | 0,000 | 2 | 112 ms |
| `/loja/*` | computador | 0 (pequena) | — | — | 0 | — |
| `/loja/*` | **todos** | 1 (pequena) | 0,26 s | 0,000 | 2 | 112 ms |
| `/empresas/*` | celular | 111 | 1,73 s | 0,000 | 25 | 88 ms |
| `/empresas/*` | computador | 84 | 1,18 s | 0,000 | 43 | 56 ms |
| `/empresas/*` | **todos** | 196 | 1,50 s | 0,000 | 68 | 72 ms |
| `/noticias/*` | celular | 70 | 1,34 s | 0,000 | 10 | 64 ms |
| `/noticias/*` | computador | 9 (pequena) | 0,68 s | 0,000 | 1 | 8 ms |
| `/noticias/*` | **todos** | 79 | 1,16 s | 0,000 | 11 | 48 ms |

### Grupos com 50 ou mais medições de LCP (entram no gatilho de 20%)

| Grupo (todos os aparelhos) | Medições | LCP p75 "antes" | Gatilho: "depois" acima de |
|---|---|---|---|
| site inteiro (sem `/guia/`) | 539 | 1,26 s | 1,51 s |
| `/empresas/*` | 196 | 1,50 s | 1,80 s |
| `/noticias/*` | 79 | 1,16 s | 1,39 s |
| `/` | 53 | 1,15 s | 1,38 s |

- `/loja` (24) e `/loja/*` (1) ficam abaixo de 50: decide a medição de laboratório (regra (d) do `fase-7.md`).
- Na 1ª extração (29 a 31/10) só o site inteiro passava de 50. Com 12 dias, `/empresas/*`, `/noticias/*` e `/` também passam.

## Por que `--eventos` (descoberto em 09/11)

O modo antigo do script (`rumWebVitalsEventsAdaptiveGroups`) deixou de servir para este período:

- **Amostragem por tamanho da consulta:** acima de ~7 dias, ou com a quebra por aparelho, o Cloudflare responde com `sampleInterval` = 10. Só 10% dos eventos entram no p75, e o `count` volta multiplicado por 10.
  - No período oficial, o modo antigo mostrava 670 medições no site inteiro, mas o p75 saía de ~67 eventos reais.
- **Retenção:** o Cloudflare guarda os eventos completos por ~8 dias. Em 09/11, 29, 30 e 31/10 só tinham amostra de 10%: 25 eventos ao todo (8, 5 e 12), contra 87 medições de LCP na 1ª extração, feita em 30/10.
  - De 01/11 em diante, tudo completo: 1.088 eventos.

**O modo `--eventos`:**
- busca os eventos um a um, dia a dia (`rumWebVitalsEventsAdaptive`), e calcula o p75 localmente;
- os 25 eventos amostrados de 29 a 31/10 entram com peso 10, como no p75 do próprio Cloudflare;
- **conferido:** em 02 a 09/11 (sem amostragem), o total de cada grupo bate com o p75 e a contagem do Cloudflare;
- grava os eventos brutos no JSON, para juntar semanas sem depender da retenção.

### Referência: só os dias completos (01 a 09/11)

Sem os 25 eventos amostrados de 29 a 31/10. Os grupos pequenos mudam bastante com eles (`/noticias/*`: 1,16 s com, 1,63 s sem), por isso esta tabela fica como comparação.

| Grupo | Aparelho | Amostra (LCP) | LCP p75 | CLS p75 | Amostra (INP) | INP p75 |
|---|---|---|---|---|---|---|
| `site inteiro (sem /guia/)` | **todos** | 527 | 1,22 s | 0,000 | 155 | 96 ms |
| `/` | **todos** | 52 | 1,42 s | 0,000 | 11 | 96 ms |
| `/loja` | **todos** | 23 (pequena) | 0,85 s | 0,000 | 5 | 80 ms |
| `/loja/*` | **todos** | 1 (pequena) | 0,26 s | 0,000 | 1 | 48 ms |
| `/empresas/*` | **todos** | 193 | 1,47 s | 0,000 | 67 | 80 ms |
| `/noticias/*` | **todos** | 75 | 1,63 s | 0,000 | 10 | 64 ms |

## 1ª extração: 29 a 31/10 (feita em 30/10, modo antigo)

Fica no histórico do git (commit `181ad5d`): 87 medições de LCP no site inteiro, LCP p75 de 1,66 s. Foi feita antes da amostragem dos dias antigos, então não dá para refazer.

## Volume e limites

- **Volume:** ~80 a 250 eventos por dia na produção, sem bots.
- **Por grupo:** em 7 dias, a `/loja` soma ~15 a 20 medições, e os produtos (`/loja/*`), quase nenhuma. Nessa escala, um p75 muda bastante com 2 ou 3 visitas, e "piorar mais de 20%" pode acontecer por acaso.
- **Regra do gatilho de reversão** (aprovada pelo Leo em 30/10/2026; o texto completo está em `fase-7.md`, seção 4):
  1. **"Antes":** esta extração, 29/10 a 09/11.
  2. **"Depois":** 7 dias; grupo com menos de 50 medições de LCP estende para 14 dias.
  3. **Gatilho de 20% no LCP p75:** só para grupo com 50 ou mais medições reais.
  4. **`/loja` e `/loja/*`, se não chegarem a 50:** decide a medição de laboratório. A `/loja` pode ficar atrás da produção, desde que fique **abaixo de 2,5 s de LCP no laboratório**. Acima disso, revertemos ou otimizamos antes de seguir.

## Como refazer o "depois"

Rodar **com `--eventos` e dentro de ~7 dias** do primeiro dia do período, antes de o Cloudflare passar a guardar só a amostra:

```
node docs/redesign/cwv.mjs --desde 2026-11-10 --ate 2026-11-17 --eventos --saida docs/redesign/cwv-depois.json
```

Se algum grupo precisar dos 14 dias, extrair a 2ª semana em 24/11 (`--desde 2026-11-17 --ate 2026-11-24`) e juntar os eventos dos dois JSON.

O token fica em `cloudflare-analytics.env`, na pasta `Projetos-locais` (em `Documents` no notebook, direto no perfil do usuário no desktop; o script procura nos dois). Permissão Account > Account Analytics > Read. O script nunca o exibe.
