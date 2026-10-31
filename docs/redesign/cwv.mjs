// Core Web Vitals reais (Cloudflare Web Analytics) por grupo de páginas --
// redesign, fase 7 (docs/redesign/fase-7.md, seção 4). Só leitura.
//
//   node docs/redesign/cwv.mjs --desde 2026-10-29 [--ate 2026-11-09] [--saida docs/redesign/cwv-antes.md]
//
// Token: Documents\Projetos-locais\cloudflare-analytics.env, linha
// CLOUDFLARE_API_TOKEN=... (Account > Account Analytics > Read). Nunca é exibido.
//
// API: GraphQL, viewer.accounts.rumWebVitalsEventsAdaptiveGroups (nomes
// conferidos por introspecção em 30/10/2026). Valores em microssegundos,
// menos o CLS. Filtros fixos:
//   - requestHost = meubairroburitis.com.br (a prévia e a Central ficam de fora);
//   - bot = 0 (as medições automáticas com Chrome headless saem como bot);
//   - cada p75 só sobre os eventos que mediram aquela métrica (LCP > 0, INP > 0);
//     o CLS usa os eventos com LCP medido (CLS 0 é um valor válido).
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CONTA = 'b1a5d83a7cf09f04bd1bad6990911693'
const HOST = 'meubairroburitis.com.br'
const GRUPOS = [
  // site inteiro fora do app (/guia/ é outro projeto), pedido do Leo em 30/10
  { nome: 'site inteiro (sem /guia/)', filtro: { AND: [{ requestPath_notlike: '/guia/%' }, { requestPath_neq: '/guia' }] } },
  { nome: '/', filtro: { requestPath: '/' } },
  { nome: '/loja', filtro: { requestPath: '/loja' } },
  { nome: '/loja/*', filtro: { requestPath_like: '/loja/%' } },
  { nome: '/empresas/*', filtro: { requestPath_like: '/empresas/%' } },
  { nome: '/noticias/*', filtro: { requestPath_like: '/noticias/%' } },
]
const AMOSTRA_MINIMA = 50

const args = process.argv.slice(2)
const arg = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const desde = arg('--desde') || '2026-10-29'
const ate = arg('--ate')
const saida = arg('--saida')

const env = readFileSync(join(homedir(), 'Documents', 'Projetos-locais', 'cloudflare-analytics.env'), 'utf8')
const TOKEN = (env.match(/^\s*CLOUDFLARE_API_TOKEN\s*=\s*(.+)\s*$/m) || [])[1]?.trim().replace(/^["']|["']$/g, '')
if (!TOKEN) throw new Error('CLOUDFLARE_API_TOKEN não encontrado no arquivo de Projetos-locais')

async function consultar(filtro, quantis, porAparelho = true) {
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($c: string!, $f: AccountRumWebVitalsEventsAdaptiveGroupsFilter_InputObject) {
        viewer { accounts(filter: { accountTag: $c }) {
          rumWebVitalsEventsAdaptiveGroups(limit: 10, filter: $f) { count ${porAparelho ? 'dimensions { deviceType }' : ''} quantiles { ${quantis} } }
        } } }`,
      variables: { c: CONTA, f: filtro },
    }),
  })
  const j = await r.json()
  if (j.errors?.length) throw new Error('API: ' + j.errors.map((e) => e.message).join('; '))
  return j.data.viewer.accounts[0].rumWebVitalsEventsAdaptiveGroups
}

const periodo = { datetime_geq: `${desde}T00:00:00Z`, ...(ate ? { datetime_lt: `${ate}T00:00:00Z` } : {}) }
const base = { ...periodo, requestHost: HOST, bot: 0 }
const linhas = []
for (const g of GRUPOS) {
  const lcp = await consultar({ ...base, ...g.filtro, largestContentfulPaint_gt: 0 }, 'largestContentfulPaintP75 cumulativeLayoutShiftP75')
  const inp = await consultar({ ...base, ...g.filtro, interactionToNextPaint_gt: 0 }, 'interactionToNextPaintP75')
  const lcpTodos = await consultar({ ...base, ...g.filtro, largestContentfulPaint_gt: 0 }, 'largestContentfulPaintP75 cumulativeLayoutShiftP75', false)
  const inpTodos = await consultar({ ...base, ...g.filtro, interactionToNextPaint_gt: 0 }, 'interactionToNextPaintP75', false)
  for (const aparelho of ['mobile', 'desktop', 'todos']) {
    const l = aparelho === 'todos' ? lcpTodos[0] : lcp.find((x) => x.dimensions.deviceType === aparelho)
    const i = aparelho === 'todos' ? inpTodos[0] : inp.find((x) => x.dimensions.deviceType === aparelho)
    linhas.push({
      grupo: g.nome, aparelho,
      nLcp: l?.count || 0, lcp: l ? l.quantiles.largestContentfulPaintP75 / 1e6 : null, cls: l ? l.quantiles.cumulativeLayoutShiftP75 : null,
      nInp: i?.count || 0, inp: i ? i.quantiles.interactionToNextPaintP75 / 1e3 : null,
    })
  }
}

const f = (v, casas, un) => (v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + un)
const tabela = [
  '| Grupo | Aparelho | Amostra (LCP) | LCP p75 | CLS p75 | Amostra (INP) | INP p75 |',
  '|---|---|---|---|---|---|---|',
  ...linhas.map((l) => `| \`${l.grupo}\` | ${{ mobile: 'celular', desktop: 'computador', todos: '**todos**' }[l.aparelho]} | ${l.nLcp}${l.nLcp < AMOSTRA_MINIMA ? ' (pequena)' : ''} | ${f(l.lcp, 2, ' s')} | ${f(l.cls, 3, '')} | ${l.nInp} | ${f(l.inp, 0, ' ms')} |`),
].join('\n')
console.log(`Período: ${desde} a ${ate || 'agora'} (UTC), host ${HOST}, sem bots\n`)
console.log(tabela)
if (saida) {
  writeFileSync(saida, JSON.stringify({ desde, ate: ate || null, geradoEm: new Date().toISOString(), linhas }, null, 2) + '\n')
  console.log(`\nDados salvos em ${saida}`)
}
