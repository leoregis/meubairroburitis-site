// Core Web Vitals reais (Cloudflare Web Analytics) por grupo de páginas --
// redesign, fase 7 (docs/redesign/fase-7.md, seção 4). Só leitura.
//
//   node docs/redesign/cwv.mjs --desde 2026-10-29 [--ate 2026-11-10] [--eventos] [--saida docs/redesign/cwv-antes.json]
//   (--ate é exclusivo; --eventos: p75 sobre todos os eventos, sem a amostragem de 10% do Cloudflare)
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
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CONTA = 'b1a5d83a7cf09f04bd1bad6990911693'
const HOST = 'meubairroburitis.com.br'
const GRUPOS = [
  // site inteiro fora do app (/guia/ é outro projeto), pedido do Leo em 30/10
  // `casa` repete o filtro em JS para o modo --eventos (mesmo recorte)
  { nome: 'site inteiro (sem /guia/)', filtro: { AND: [{ requestPath_notlike: '/guia/%' }, { requestPath_neq: '/guia' }] }, casa: (p) => !p.startsWith('/guia/') && p !== '/guia' },
  { nome: '/', filtro: { requestPath: '/' }, casa: (p) => p === '/' },
  { nome: '/loja', filtro: { requestPath: '/loja' }, casa: (p) => p === '/loja' },
  { nome: '/loja/*', filtro: { requestPath_like: '/loja/%' }, casa: (p) => p.startsWith('/loja/') },
  { nome: '/empresas/*', filtro: { requestPath_like: '/empresas/%' }, casa: (p) => p.startsWith('/empresas/') },
  { nome: '/noticias/*', filtro: { requestPath_like: '/noticias/%' }, casa: (p) => p.startsWith('/noticias/') },
]
const AMOSTRA_MINIMA = 50

const args = process.argv.slice(2)
const arg = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const desde = arg('--desde') || '2026-10-29'
const ate = arg('--ate')
const saida = arg('--saida')

// notebook: Documents\Projetos-locais; desktop: Projetos-locais direto no perfil
const arquivoToken = [join(homedir(), 'Documents', 'Projetos-locais', 'cloudflare-analytics.env'), join(homedir(), 'Projetos-locais', 'cloudflare-analytics.env')].find((a) => existsSync(a))
if (!arquivoToken) throw new Error('cloudflare-analytics.env não encontrado em Documents\Projetos-locais nem em Projetos-locais')
const env = readFileSync(arquivoToken, 'utf8')
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
const modoEventos = args.includes('--eventos')

// --eventos (09/11/2026): o rumWebVitalsEventsAdaptiveGroups passa a amostrar
// 10% (sampleInterval = 10) em janelas acima de ~7 dias, e o `count` volta
// estimado (×10). Em 29/10 a 10/11 isso deixava o p75 do site inteiro sobre
// ~67 medições reais, não 670. Este modo busca os eventos um a um, dia a dia
// (janela de 1 dia vem com sampleInterval = 1), e calcula o p75 sobre todos.
async function eventosDoDia(dia) {
  const fim = new Date(Date.parse(dia + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10)
  const todos = []
  let depois = `${dia}T00:00:00Z`
  for (;;) {
    const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($c: string!, $f: AccountRumWebVitalsEventsAdaptiveFilter_InputObject) {
          viewer { accounts(filter: { accountTag: $c }) {
            rumWebVitalsEventsAdaptive(limit: 5000, filter: $f, orderBy: [datetime_ASC]) {
              datetime sampleInterval deviceType requestPath largestContentfulPaint interactionToNextPaint cumulativeLayoutShift
            } } } }`,
        variables: { c: CONTA, f: { datetime_geq: depois, datetime_lt: `${fim}T00:00:00Z`, requestHost: HOST, bot: 0 } },
      }),
    })
    const j = await r.json()
    if (j.errors?.length) throw new Error('API: ' + j.errors.map((e) => e.message).join('; '))
    const lote = j.data.viewer.accounts[0].rumWebVitalsEventsAdaptive
    todos.push(...lote)
    if (lote.length < 5000) break
    throw new Error(`mais de 5000 eventos em ${dia}: dividir a janela`)
  }
  // O Cloudflare guarda os eventos completos por ~8 dias; depois só fica uma
  // amostra de 10% (em 09/11, 29 a 31/10 tinham só 25 eventos, intervalo 10).
  // Esses entram com peso = sampleInterval, como no p75 do próprio Cloudflare.
  const amostrados = todos.filter((e) => e.sampleInterval !== 1).length
  if (amostrados) console.error(`aviso: ${dia} só tem amostra (${amostrados} eventos, intervalo ${[...new Set(todos.map((e) => e.sampleInterval))].join('/')}); entram com peso`)
  return todos
}
// p75 ponderado por posição (nearest-rank); com peso 1 em tudo é o p75 comum,
// conferido contra o p75 do Cloudflare numa janela sem amostragem (02 a 09/11)
const p75 = (pares) => {
  if (!pares.length) return null
  const s = [...pares].sort((a, b) => a[0] - b[0])
  const alvo = 0.75 * s.reduce((t, [, p]) => t + p, 0)
  let acc = 0
  for (const [v, p] of s) { acc += p; if (acc >= alvo - 1e-9) return v }
  return s.at(-1)[0]
}

// eventos brutos vão no JSON: o Cloudflare só guarda tudo por ~8 dias
let eventos = null
if (modoEventos) {
  const fimTotal = ate || new Date(Date.now() + 864e5).toISOString().slice(0, 10)
  eventos = []
  for (let d = desde; d < fimTotal; d = new Date(Date.parse(d + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10)) eventos.push(...(await eventosDoDia(d)))
  for (const g of GRUPOS) {
    for (const aparelho of ['mobile', 'desktop', 'todos']) {
      const ev = eventos.filter((e) => g.casa(e.requestPath) && (aparelho === 'todos' || e.deviceType === aparelho))
      const comLcp = ev.filter((e) => e.largestContentfulPaint > 0)
      const comInp = ev.filter((e) => e.interactionToNextPaint > 0)
      const lcp = p75(comLcp.map((e) => [e.largestContentfulPaint, e.sampleInterval]))
      const inp = p75(comInp.map((e) => [e.interactionToNextPaint, e.sampleInterval]))
      linhas.push({
        grupo: g.nome, aparelho,
        // nLcp/nInp = medições reais (eventos recebidos); estimado = soma dos pesos
        nLcp: comLcp.length, nLcpEstimado: comLcp.reduce((t, e) => t + e.sampleInterval, 0),
        lcp: lcp == null ? null : lcp / 1e6, cls: p75(comLcp.map((e) => [e.cumulativeLayoutShift, e.sampleInterval])),
        nInp: comInp.length, inp: inp == null ? null : inp / 1e3,
      })
    }
  }
}

for (const g of modoEventos ? [] : GRUPOS) {
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
console.log(`Período: ${desde} a ${ate || 'agora'} (UTC), host ${HOST}, sem bots, ${modoEventos ? 'eventos um a um' : 'agrupado (count estimado)'}\n`)
console.log(tabela)
if (saida) {
  writeFileSync(saida, JSON.stringify({ desde, ate: ate || null, metodo: modoEventos ? 'eventos um a um; amostrados (sampleInterval > 1) com peso' : 'agrupado (count estimado pelo Cloudflare)', geradoEm: new Date().toISOString(), linhas, ...(eventos ? { eventos } : {}) }, null, 1) + '\n')
  console.log(`\nDados salvos em ${saida}`)
}
