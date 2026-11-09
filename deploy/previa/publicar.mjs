// Publica a prévia do redesign em https://previa.meubairroburitis.com.br
// (Worker mbb-site-previa, só arquivos estáticos). Não toca na produção:
// o site da produção sai por FTP pelo deploy.yml, que não usa nada daqui.
//
//   node deploy/previa/publicar.mjs            build + conferências + publica
//   node deploy/previa/publicar.mjs --so-build build + conferências, sem publicar
//   node deploy/previa/publicar.mjs --sem-build conferências + publica o .output atual
//
// Build no Windows: o IPX não grava as imagens remotas (pasta "https:" não
// pode ter dois-pontos), então os og:image 1200x630 das notícias com capa
// no Storage dão ENOENT no log. Não afeta a prévia: o og:image aponta para
// a produção (site.url), e as capas na página carregam direto do Storage.
//
// Precisa: .env com as chaves anon da produção (o mesmo do build local) e o
// wrangler logado na conta do Cloudflare (`npx wrangler login`).
//
// O build usa o banco de PRODUÇÃO só para ler (é o que mostra os dados
// reais). Nada pode gravar: MBB_PREVIA=1 liga as travas do código
// (usePrevia) e o _headers bloqueia functions/v1 e auth/v1 por CSP. A
// chave pública do Mercado Pago vai vazia, então o cartão nem carrega.

import { execSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const saida = join(raiz, '.output', 'public')
const aqui = join(raiz, 'deploy', 'previa')
const soBuild = process.argv.includes('--so-build')
const falhas = []

function rodar(cmd, env = {}) {
  execSync(cmd, { cwd: raiz, stdio: 'inherit', env: { ...process.env, ...env } })
}

// 1. build completo, como o da produção, com as flags da prévia
if (!process.argv.includes('--sem-build')) {
  console.log('\n== build (MBB_PREVIA=1)')
  rodar('npx nuxt generate', { MBB_PREVIA: '1', NUXT_PUBLIC_MP_PUBLIC_KEY: '' })
}
// trava contra publicar um .output que não seja da prévia (ex.: build local comum)
if (!readFileSync(join(saida, 'index.html'), 'utf8').includes('noindex')) {
  console.error('ERRO: o .output/public não é um build da prévia (falta noindex). Rode sem --sem-build.')
  process.exit(1)
}

// 2. arquivos só da prévia
console.log('\n== arquivos da prévia')
cpSync(join(aqui, '_headers'), join(saida, '_headers'))
cpSync(join(aqui, '_redirects'), join(saida, '_redirects'))
// Na produção o .htaccess serve o 200.html (casca client-only) em
// /carrinho e /meus-pedidos; aqui a casca vira o index.html das duas rotas.
for (const rota of ['carrinho', 'meus-pedidos']) {
  cpSync(join(saida, '200.html'), join(saida, rota, 'index.html'))
}

// 3. conferências
console.log('\n== conferências')
const robots = readFileSync(join(saida, 'robots.txt'), 'utf8')
if (!/^Disallow:\s*\/\s*$/m.test(robots)) falhas.push('robots.txt sem "Disallow: /"')

function listar(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome)
    return statSync(p).isDirectory() ? listar(p) : [p]
  })
}
const arquivos = listar(saida)
const htmls = arquivos.filter((a) => a.endsWith('.html'))
const semNoindex = htmls.filter((a) => {
  const html = readFileSync(a, 'utf8')
  return !/<meta name="robots" content="[^"]*noindex/.test(html)
})
// 200.html/404.html e as cascas client-only não têm meta: valem o header
// X-Robots-Tag do _headers e o robots.txt.
const cascas = ['200.html', '404.html', join('carrinho', 'index.html'), join('meus-pedidos', 'index.html')]
const semNoindexReal = semNoindex.filter((a) => !cascas.some((c) => a.endsWith(join(saida, c)) || a === join(saida, c)))
if (semNoindexReal.length) falhas.push(`${semNoindexReal.length} página(s) sem meta noindex, ex.: ${semNoindexReal.slice(0, 3).join(', ')}`)

// rotas do build x sitemap da produção: toda URL do sitemap tem de existir aqui
const sitemapProducao = await (await fetch('https://meubairroburitis.com.br/sitemap.xml')).text()
const urls = [...sitemapProducao.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const faltando = urls.filter((u) => {
  const caminho = new URL(u).pathname.replace(/\/$/, '')
  return !existsSync(join(saida, caminho, 'index.html')) && !existsSync(join(saida, `${caminho || '/index'}.html`))
})
const sitemapPrevia = readFileSync(join(saida, 'sitemap.xml'), 'utf8')
const totalPrevia = (sitemapPrevia.match(/<loc>/g) || []).length
console.log(`arquivos: ${arquivos.length} (limite do Worker: 20.000)`)
console.log(`páginas HTML: ${htmls.length}`)
// o sitemap da prévia sai vazio de propósito (site.indexable = false)
console.log(`sitemap da produção: ${urls.length} URLs; URLs da produção sem página no build: ${faltando.length}; sitemap da prévia: ${totalPrevia} (vazio por ser noindex)`)
if (faltando.length) falhas.push(`URLs do sitemap sem página no build: ${faltando.slice(0, 10).join(', ')}`)
if (arquivos.length > 20000) falhas.push('mais de 20.000 arquivos')

if (falhas.length) {
  console.error('\nFALHOU:\n- ' + falhas.join('\n- '))
  process.exit(1)
}
console.log('conferências ok')

// 404 como na produção: lá o Apache responde endereço inexistente com a página
// real de "não encontrada" (ErrorDocument 404 em deploy/htaccess-producao), não
// com a casca 404.html do Nuxt (sem título). O Worker usa o 404.html
// (not_found_handling), então ele recebe o conteúdo dessa página.
cpSync(join(saida, 'pagina-nao-encontrada', 'index.html'), join(saida, '404.html'))

// 4. publica
if (!soBuild) {
  console.log('\n== publicando')
  rodar('npx --yes wrangler@4.146.0 deploy --config deploy/previa/wrangler.jsonc')
  console.log('\nPrévia: https://previa.meubairroburitis.com.br')
}
