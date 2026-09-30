// Gera app/components/bairro/mapaBuritisDados.ts a partir da base OFICIAL
// da PBH "População e Domicílio por Bairro 2022" (IDE-BHGEO/PRODABEL),
// coluna GEOMETRIA (polígonos dos bairros populares, em coordenadas
// projetadas em metros). Nenhum limite é desenhado à mão: o polígono do
// Buritis (NUM_BAIRRO 623) e os vizinhos saem do próprio arquivo, e os
// vizinhos são escolhidos pela geometria (bairros que encostam no Buritis).
//
// Uso (CSV baixado do dataset ativo, ver URL em mapaBuritisDados.ts):
//   node scripts/gerar-mapa-buritis.mjs caminho/20250801_populacao_domicilio_bairro_2022.csv
import { readFileSync, writeFileSync } from 'node:fs'

const [csvPath] = process.argv.slice(2)
if (!csvPath) {
  console.error('uso: node scripts/gerar-mapa-buritis.mjs <csv da PBH>')
  process.exit(1)
}

const NUM_BURITIS = '623'
const DIST_VIZINHO_M = 25 // vértice a menos de 25 m do Buritis = bairro vizinho
const MARGEM = 0.12 // folga em volta do Buritis no enquadramento
const TOL_M = 4 // simplificação Douglas-Peucker (~1px na largura exibida)

function parseMultiPolygon(wkt) {
  const corpo = wkt.replace(/^MULTIPOLYGON\s*\(\(\(/, '').replace(/\)\)\)\s*$/, '')
  return corpo.split(/\)\)\s*,\s*\(\(/).map((poly) =>
    poly.split(/\)\s*,\s*\(/).map((anel) =>
      anel.split(',').map((p) => p.trim().split(/\s+/).map(Number)),
    ),
  )
}

const linhas = readFileSync(csvPath, 'utf8').split(/\r?\n/).slice(1).filter(Boolean)
const bairros = linhas.map((l) => {
  const c = l.split(';')
  return { num: c[1], nome: c[2], polys: parseMultiPolygon(c[6]) }
})

const buritis = bairros.find((b) => b.num === NUM_BURITIS)
if (!buritis) throw new Error('Buritis (623) não encontrado no CSV')

const verticesBuritis = buritis.polys.flat(2)
const xs = verticesBuritis.map((p) => p[0])
const ys = verticesBuritis.map((p) => p[1])
const [minX0, maxX0, minY0, maxY0] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
const padX = (maxX0 - minX0) * MARGEM
const padY = (maxY0 - minY0) * MARGEM
const janela = { minX: minX0 - padX, maxX: maxX0 + padX, minY: minY0 - padY, maxY: maxY0 + padY }

// vizinhos: algum vértice a menos de DIST_VIZINHO_M de algum vértice do Buritis
const d2max = DIST_VIZINHO_M ** 2
const vizinhos = bairros.filter((b) => b !== buritis && b.polys.flat(2).some(([x, y]) =>
  x > janela.minX && x < janela.maxX && y > janela.minY && y < janela.maxY
  && verticesBuritis.some(([bx, by]) => (x - bx) ** 2 + (y - by) ** 2 < d2max)))

// recorte Sutherland-Hodgman pela janela retangular
function recortar(anel) {
  let saida = anel
  const bordas = [
    [(p) => p[0] >= janela.minX, (a, b) => inter(a, b, 0, janela.minX)],
    [(p) => p[0] <= janela.maxX, (a, b) => inter(a, b, 0, janela.maxX)],
    [(p) => p[1] >= janela.minY, (a, b) => inter(a, b, 1, janela.minY)],
    [(p) => p[1] <= janela.maxY, (a, b) => inter(a, b, 1, janela.maxY)],
  ]
  for (const [dentro, cruza] of bordas) {
    const entrada = saida
    saida = []
    for (let i = 0; i < entrada.length; i++) {
      const a = entrada[i]
      const b = entrada[(i + 1) % entrada.length]
      if (dentro(b)) {
        if (!dentro(a)) saida.push(cruza(a, b))
        saida.push(b)
      } else if (dentro(a)) {
        saida.push(cruza(a, b))
      }
    }
    if (!saida.length) return []
  }
  return saida
}
function inter(a, b, eixo, v) {
  const t = (v - a[eixo]) / (b[eixo] - a[eixo])
  return eixo === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v]
}

function simplificar(pts, tol) {
  if (pts.length < 4) return pts
  const distSeg = (p, a, b) => {
    const dx = b[0] - a[0]; const dy = b[1] - a[1]
    const L = dx * dx + dy * dy
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
  }
  const dp = (ini, fim, out) => {
    let maxD = 0; let idx = -1
    for (let i = ini + 1; i < fim; i++) {
      const d = distSeg(pts[i], pts[ini], pts[fim])
      if (d > maxD) { maxD = d; idx = i }
    }
    if (maxD > tol) { dp(ini, idx, out); dp(idx, fim, out) } else { out.push(pts[fim]) }
  }
  const out = [pts[0]]
  dp(0, pts.length - 1, out)
  return out
}

const W = Math.round(janela.maxX - janela.minX)
const H = Math.round(janela.maxY - janela.minY)
const svgPt = ([x, y]) => [Math.round(x - janela.minX), Math.round(janela.maxY - y)]

function areaCentroide(anel) {
  let a = 0; let cx = 0; let cy = 0
  for (let i = 0; i < anel.length; i++) {
    const [x1, y1] = anel[i]; const [x2, y2] = anel[(i + 1) % anel.length]
    const f = x1 * y2 - x2 * y1
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f
  }
  a /= 2
  return a ? { area: Math.abs(a), cx: cx / (6 * a), cy: cy / (6 * a) } : { area: 0, cx: 0, cy: 0 }
}

function paraPath(b) {
  let d = ''
  let melhor = { area: 0, cx: 0, cy: 0 }
  for (const poly of b.polys) {
    for (const anel of poly) {
      const rec = recortar(anel)
      if (rec.length < 3) continue
      const simplificado = simplificar(rec, TOL_M)
      const simp = (simplificado.length >= 3 ? simplificado : rec).map(svgPt)
      d += 'M' + simp.map((p) => p.join(' ')).join('L') + 'Z'
      const ac = areaCentroide(simp)
      if (ac.area > melhor.area) melhor = ac
    }
  }
  return { d, rotulo: [Math.round(melhor.cx), Math.round(melhor.cy)], areaVisivel: melhor.area }
}

const pBuritis = paraPath(buritis)
const pVizinhos = vizinhos
  .map((b) => ({ nome: b.nome, ...paraPath(b) }))
  .filter((v) => v.d)
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

// só rotula vizinho com área visível suficiente pra caber o nome
const AREA_MIN_ROTULO = W * H * 0.02

const ts = `// GERADO por scripts/gerar-mapa-buritis.mjs -- não editar à mão.
// Fonte: Prefeitura de Belo Horizonte, "População e Domicílio por Bairro 2022"
// (IDE-BHGEO/PRODABEL), arquivo 20250801_populacao_domicilio_bairro_2022.csv,
// coluna GEOMETRIA (bairros populares). Coordenadas projetadas em metros,
// recortadas no entorno do Buritis e simplificadas (tolerância ${TOL_M} m).
export const MAPA_BURITIS = {
  largura: ${W},
  altura: ${H},
  buritis: { d: ${JSON.stringify(pBuritis.d)}, rotulo: ${JSON.stringify(pBuritis.rotulo)} },
  vizinhos: ${JSON.stringify(pVizinhos.map((v) => ({ nome: v.nome, d: v.d, rotulo: v.areaVisivel >= AREA_MIN_ROTULO ? v.rotulo : null })), null, 2)},
} as const
`
writeFileSync('app/components/bairro/mapaBuritisDados.ts', ts)
console.log(`ok: janela ${W}x${H} m | Buritis ${pBuritis.d.length} chars | vizinhos: ${pVizinhos.map((v) => v.nome).join(', ')}`)
