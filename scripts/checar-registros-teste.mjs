#!/usr/bin/env node
// 🧪 Checagem pós-build (07/out/2026): interrompe o deploy se o sitemap ou os
// <title> das páginas geradas tiverem cara de registro de teste ("teste",
// "apagar", "lorem", "dummy"). Motivo: registros de teste criados em
// produção (unidade 707 "TESTE FASE 6b -- apagar", empresa 716 "TESTE FASE6
// ACEITACAO — apagar depois", prestadores "Teste automatizado") ficaram
// semanas publicados, no sitemap e no Google.
//
// Exceções (nome legítimo que contém um dos termos, ex.: "teste de
// estanqueidade" da Gasmec) ficam versionadas em
// scripts/checar-registros-teste.excecoes.json -- cada entrada é um trecho de
// URL (caminho) ou de título que libera aquele item, com o motivo.
//
// Uso: node scripts/checar-registros-teste.mjs [pasta-do-build]
//      (padrão: .output/public). Sai com código 1 se achar algo.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raizProjeto = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pasta = resolve(process.argv[2] || join(raizProjeto, '.output/public'))
const excecoes = JSON.parse(readFileSync(join(raizProjeto, 'scripts/checar-registros-teste.excecoes.json'), 'utf8')).excecoes

// palavra inteira, sem diferenciar maiúsculas (e "testes"/"teste" em slug com hífen)
const TERMOS = /(^|[^a-z0-9à-ú])(testes?|apagar|lorem|dummy)([^a-z0-9à-ú]|$)/i

const liberado = (texto) => excecoes.find((e) => texto.toLowerCase().includes(e.trecho.toLowerCase()))

function listarHtml(dir, saida = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    const st = statSync(caminho)
    if (st.isDirectory()) {
      // assets e imagens geradas não têm <title> de página
      if (['_nuxt', '_ipx', '__sitemap__', 'guia'].includes(nome)) continue
      listarHtml(caminho, saida)
    } else if (nome === 'index.html') {
      saida.push(caminho)
    }
  }
  return saida
}

if (!existsSync(pasta)) {
  console.error(`❌ pasta do build não encontrada: ${pasta}`)
  process.exit(2)
}

const achados = []
const liberados = []

// 1) URLs do sitemap
const sitemap = join(pasta, 'sitemap.xml')
if (existsSync(sitemap)) {
  for (const [, url] of readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const caminho = decodeURIComponent(url.replace(/^https?:\/\/[^/]+/, ''))
    if (!TERMOS.test(caminho.replace(/[-_/]/g, ' '))) continue
    const exc = liberado(caminho)
    ;(exc ? liberados : achados).push({ onde: 'sitemap', valor: caminho, motivo: exc?.motivo })
  }
}

// 2) <title> de cada página gerada
for (const arquivo of listarHtml(pasta)) {
  const html = readFileSync(arquivo, 'utf8')
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim()
  if (!titulo || !TERMOS.test(titulo)) continue
  const rota = '/' + arquivo.slice(pasta.length + 1).replace(/\\/g, '/').replace(/\/?index\.html$/, '')
  const exc = liberado(rota) || liberado(titulo)
  ;(exc ? liberados : achados).push({ onde: 'title', valor: `${rota} — "${titulo}"`, motivo: exc?.motivo })
}

for (const l of liberados) console.log(`  (exceção) ${l.onde}: ${l.valor} -- ${l.motivo}`)

if (achados.length) {
  console.error(`\n❌ ${achados.length} item(ns) com cara de registro de teste no build:`)
  for (const a of achados) console.error(`   - ${a.onde}: ${a.valor}`)
  console.error('\nDesative o registro no banco (padrão: ativo = false + backup) ou, se o nome for legítimo,')
  console.error('adicione uma exceção com motivo em scripts/checar-registros-teste.excecoes.json.')
  process.exit(1)
}

console.log(`✅ checagem de registros de teste: nada encontrado (${liberados.length} exceção(ões) aplicada(s)).`)
