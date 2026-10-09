#!/usr/bin/env node
// Build incremental (etapa 3, 09/out): o build parcial não gera o sitemap
// inteiro (só conhece as rotas que regerou). Este script parte do
// sitemap.xml que está no ar e aplica só as mudanças:
//   - tira as <url> das rotas removidas e das páginas /noticias/pagina/N que
//     deixaram de existir;
//   - acrescenta as rotas novas (notícia/produto publicados) e páginas de
//     listagem que passaram a existir, só com <loc> -- imagem e lastmod
//     entram no próximo build completo (diário, 02:30);
//   - corrige o escape duplo &amp;amp; (mesma correção do build completo).
//
// Uso: node scripts/incremental/mesclar-sitemap.mjs <sitemap_no_ar.xml> <rotas.json> <saida.xml>

import { readFileSync, writeFileSync } from 'node:fs'

const [, , arqAtual, arqRotas, arqSaida] = process.argv
// staging (deploy-staging.yml): https://meubairroburitis.com.br/_staging_test
const SITE = process.env.MBB_SITE || 'https://meubairroburitis.com.br'

const xml = readFileSync(arqAtual, 'utf8')
const { remover = [], novas = [], paginasNoticias = 1 } = JSON.parse(readFileSync(arqRotas, 'utf8'))

if (!/<urlset[\s>]/.test(xml) || !xml.includes('</urlset>')) {
  console.error('ERRO: sitemap no ar não parece um <urlset> válido')
  process.exit(1)
}

const normalizar = (p) => (p.length > 1 ? p.replace(/\/$/, '') : p)
const caminhoDe = (loc) => normalizar(loc.replace(SITE, '') || '/')

const blocos = xml.match(/<url>[\s\S]*?<\/url>/g) || []
const comBarra = blocos.filter((b) => /<loc>[^<]*\/<\/loc>/.test(b)).length > blocos.length / 2

const sair = new Set(remover.map(normalizar))
const paginaN = /^\/noticias\/pagina\/(\d+)$/
const presentes = new Set()
let removidas = 0
let saida = xml
for (const b of blocos) {
  const loc = (b.match(/<loc>([^<]*)<\/loc>/) || [])[1]
  if (!loc) continue
  const caminho = caminhoDe(loc)
  const m = caminho.match(paginaN)
  if (sair.has(caminho) || (m && Number(m[1]) > paginasNoticias)) {
    saida = saida.replace(b, '')
    removidas++
  } else {
    presentes.add(caminho)
  }
}

const acrescentar = [...novas.map(normalizar)]
for (let p = 2; p <= paginasNoticias; p++) acrescentar.push(`/noticias/pagina/${p}`)
const novasUrls = acrescentar
  .filter((c) => !presentes.has(c) && !sair.has(c))
  .filter((c, i, a) => a.indexOf(c) === i)
  .map((c) => `<url><loc>${SITE}${c}${comBarra && c !== '/' ? '/' : ''}</loc></url>`)
saida = saida.replace('</urlset>', novasUrls.join('') + '</urlset>')

const escapes = (saida.match(/&amp;amp;/g) || []).length
saida = saida.replaceAll('&amp;amp;', '&amp;')

writeFileSync(arqSaida, saida)
console.log(`sitemap: ${blocos.length} url(s) no ar, ${removidas} removida(s), ${novasUrls.length} acrescentada(s), ${escapes} escape(s) duplo(s) corrigido(s)`)
