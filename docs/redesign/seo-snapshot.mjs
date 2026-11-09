// Fotografia do SEO do site (redesign, Fase 0). Somente leitura: só faz GET.
//
// Tirar a fotografia (todas as URLs do sitemap.xml da produção):
//   node docs/redesign/seo-snapshot.mjs --saida docs/redesign/seo-baseline.csv
//
// Mesmas URLs contra outra origem (prévia), mantendo os caminhos do sitemap
// da produção -- o canonical esperado continua sendo o da produção:
//   node docs/redesign/seo-snapshot.mjs --base https://<previa>.pages.dev --saida depois.csv
//
// Comparar duas fotografias (sai com código 1 se houver diferença):
//   node docs/redesign/seo-snapshot.mjs --comparar docs/redesign/seo-baseline.csv depois.csv
// Na prévia o noindex é proposital: --ignorar meta_robots,x_robots_tag
//
// Redirects não são seguidos: um 301 aparece como 301 com o destino em "location".

const PRODUCAO = 'https://meubairroburitis.com.br'
const CAMPOS = ['url', 'status', 'location', 'title', 'meta_description', 'canonical', 'meta_robots', 'x_robots_tag', 'jsonld_types', 'h1_count', 'og_title', 'og_description', 'og_image']
// h1_count muda de propósito (h1 do corpo das matérias vira h2, decisão 3):
// sai num bloco separado de "avisos". og_image e og_description contam como
// diferença (o og:image da prévia aponta para a produção, igual ao do site).
const CAMPOS_AVISO = new Set(['h1_count'])

const args = process.argv.slice(2)
const arg = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : undefined }

function csvLinha(valores) {
  return valores.map((v) => {
    const s = String(v ?? '')
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }).join(',')
}

function csvLer(texto) {
  const linhas = []
  let campo = '', linha = [], aspas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') aspas = false
      else campo += c
    } else if (c === '"') aspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n') { linha.push(campo.replace(/\r$/, '')); linhas.push(linha); linha = []; campo = '' }
    else campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  const [cab, ...resto] = linhas
  return resto.filter((l) => l.length > 1).map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i] ?? ''])))
}

const decodificar = (s) => s
  .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&')

function atributo(tag, nome) {
  const m = tag.match(new RegExp(`\\s${nome}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? decodificar(m[2] ?? m[3] ?? '') : ''
}

function meta(html, chave, valor) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (atributo(tag, chave).toLowerCase() === valor) return atributo(tag, 'content')
  }
  return ''
}

function tiposJsonLd(html) {
  const tipos = []
  const coletar = (no) => {
    if (Array.isArray(no)) return no.forEach(coletar)
    if (!no || typeof no !== 'object') return
    if (no['@type']) tipos.push([].concat(no['@type']).join('+'))
    if (no['@graph']) coletar(no['@graph'])
  }
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { coletar(JSON.parse(m[1])) } catch { tipos.push('JSON_INVALIDO') }
  }
  return tipos.sort().join('|')
}

async function fotografar(urlPublica, base) {
  const alvo = base ? urlPublica.replace(PRODUCAO, base) : urlPublica
  for (let tentativa = 1; ; tentativa++) {
    try {
      const r = await fetch(alvo, { redirect: 'manual', headers: { 'user-agent': 'mbb-seo-snapshot/1.0 (+redesign)' } })
      // a prévia (Worker) devolve um 500 momentâneo de vez em quando sob
      // carga; repete até 2x -- um erro de verdade continua aparecendo
      if (r.status >= 500 && tentativa < 3) {
        await new Promise((ok) => setTimeout(ok, 1500 * tentativa))
        continue
      }
      const html = (r.headers.get('content-type') || '').includes('html') ? await r.text() : ''
      const titulo = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const canonical = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [''])[0]
      return {
        url: urlPublica,
        status: r.status,
        location: r.headers.get('location') || '',
        title: titulo ? decodificar(titulo[1].trim()) : '',
        meta_description: meta(html, 'name', 'description'),
        canonical: canonical ? atributo(canonical, 'href') : '',
        meta_robots: meta(html, 'name', 'robots'),
        x_robots_tag: r.headers.get('x-robots-tag') || '',
        jsonld_types: tiposJsonLd(html),
        h1_count: (html.match(/<h1\b/gi) || []).length,
        og_title: meta(html, 'property', 'og:title'),
        og_description: meta(html, 'property', 'og:description'),
        og_image: meta(html, 'property', 'og:image'),
      }
    } catch (erro) {
      if (tentativa >= 3) return { url: urlPublica, status: `ERRO ${erro.cause?.code || erro.message}` }
      await new Promise((ok) => setTimeout(ok, 1500 * tentativa))
    }
  }
}

async function tirarFotografia() {
  const base = arg('--base')?.replace(/\/$/, '')
  const saida = arg('--saida') || 'seo-snapshot.csv'
  const xml = await (await fetch(`${PRODUCAO}/sitemap.xml`)).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodificar(m[1].trim()))
  // a home e as páginas fora do sitemap que o redesign também mexe
  for (const extra of ['/pagina-nao-encontrada', '/carrinho', '/meus-pedidos', '/robots.txt']) {
    if (!urls.includes(PRODUCAO + extra)) urls.push(PRODUCAO + extra)
  }
  const resultado = new Array(urls.length)
  let proxima = 0, feitas = 0
  const CONCORRENCIA = 6
  await Promise.all(Array.from({ length: CONCORRENCIA }, async () => {
    while (proxima < urls.length) {
      const i = proxima++
      resultado[i] = await fotografar(urls[i], base)
      if (++feitas % 100 === 0) console.error(`${feitas}/${urls.length}`)
    }
  }))
  const { writeFileSync } = await import('node:fs')
  writeFileSync(saida, [csvLinha(CAMPOS), ...resultado.map((r) => csvLinha(CAMPOS.map((c) => r[c])))].join('\n') + '\n')
  const porStatus = Object.entries(resultado.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {}))
  console.error(`${urls.length} URLs em ${saida}; status: ${porStatus.map(([s, n]) => `${s}=${n}`).join(' ')}`)
}

async function comparar(arqAntes, arqDepois) {
  const { readFileSync } = await import('node:fs')
  const antes = new Map(csvLer(readFileSync(arqAntes, 'utf8')).map((r) => [r.url, r]))
  const depois = new Map(csvLer(readFileSync(arqDepois, 'utf8')).map((r) => [r.url, r]))
  const ignorar = new Set((arg('--ignorar') || '').split(',').filter(Boolean))
  const erros = [], avisos = []
  for (const [url, a] of antes) {
    const d = depois.get(url)
    if (!d) { erros.push(`${url}: sumiu da fotografia nova`); continue }
    for (const c of CAMPOS.slice(1).filter((c) => !ignorar.has(c))) {
      // fotografia antiga, sem a coluna: não compara (seo-baseline.csv de 29/10)
      if (!(c in a) || !(c in d)) continue
      if ((a[c] ?? '') !== (d[c] ?? '')) (CAMPOS_AVISO.has(c) ? avisos : erros).push(`${url} [${c}]\n  antes:  ${a[c]}\n  depois: ${d[c]}`)
    }
  }
  for (const url of depois.keys()) if (!antes.has(url)) avisos.push(`${url}: URL nova (não estava na fotografia anterior)`)
  console.log(`${antes.size} URLs comparadas: ${erros.length} diferença(s), ${avisos.length} aviso(s)`)
  if (erros.length) console.log('\nDIFERENÇAS\n' + erros.join('\n'))
  if (avisos.length) console.log('\nAVISOS\n' + avisos.join('\n'))
  process.exit(erros.length ? 1 : 0)
}

if (args.includes('--comparar')) {
  const i = args.indexOf('--comparar')
  await comparar(args[i + 1], args[i + 2])
} else {
  await tirarFotografia()
}
