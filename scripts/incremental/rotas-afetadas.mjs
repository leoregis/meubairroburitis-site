#!/usr/bin/env node
// Build incremental (etapa 3, 09/out): converte os itens da fila de deploy
// (input "itens" do workflow -- ver deploy_fila_itens no banco do site) na
// lista de rotas a regerar e a apagar.
//
// Uso: node scripts/incremental/rotas-afetadas.mjs <itens.json> <saida.json>
//
// Lê o banco do site com a chave ANÔNIMA (só o que é público) e decide pelo
// estado ATUAL de cada notícia/produto, não pela ordem dos itens: publicada
// agora -> regera a página; não publicada -> apaga os slugs que ela já teve.
//
// Saída: { modo: "incremental" | "completo", motivo, regerar[], remover[],
//          novas[], paginasNoticias }
// Qualquer coisa fora do que este script sabe tratar vira modo "completo"
// (o build de sempre) -- nunca um incremental pela metade.

import { readFileSync, writeFileSync } from 'node:fs'

const [, , arqItens, arqSaida] = process.argv
const LIMITE_ROTAS = 300
const NOTICIAS_POR_PAGINA = 12 // igual a nuxt.config.ts e useNoticiasPagina

function sair(resultado) {
  writeFileSync(arqSaida, JSON.stringify(resultado, null, 2))
  const { modo, motivo, regerar = [], remover = [] } = resultado
  console.log(`modo: ${modo}${motivo ? ` (${motivo})` : ''} | regerar: ${regerar.length} | remover: ${remover.length}`)
  for (const r of regerar) console.log('  + ' + r)
  for (const r of remover) console.log('  - ' + r)
  process.exit(0)
}
const completo = (motivo) => sair({ modo: 'completo', motivo })

let itens
try {
  itens = JSON.parse(readFileSync(arqItens, 'utf8').trim() || '[]')
} catch {
  completo('itens em formato inesperado')
}
if (!Array.isArray(itens) || itens.length === 0) completo('sem itens')

for (const i of itens) {
  if ((i.o || 'site') !== 'site') completo(`item de origem ${i.o} (Guia ainda gera build completo)`)
  if (i.t === 'estrutura') completo(`mudança de estrutura (${i.id || 'categorias'})`)
  if (!['noticia', 'produto'].includes(i.t)) completo(`tipo de item desconhecido: ${i.t}`)
  if (!['nova', 'editada', 'removida'].includes(i.a)) completo(`ação desconhecida: ${i.a}`)
  if (!i.id) completo('item sem id')
}

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const chave = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !chave) completo('sem acesso ao banco (NUXT_PUBLIC_SUPABASE_URL/ANON_KEY)')

async function ler(caminho) {
  const r = await fetch(`${url}/rest/v1/${caminho}`, { headers: { apikey: chave, Authorization: `Bearer ${chave}` } })
  if (!r.ok) throw new Error(`${caminho}: HTTP ${r.status}`)
  return r.json()
}

let noticias, relacionadas, produtos
try {
  ;[noticias, relacionadas, produtos] = await Promise.all([
    ler('noticias?select=id,slug,categoria_id&status=eq.publicado'),
    ler('noticias_relacionadas?select=noticia_id,relacionada_id'),
    ler('produtos?select=id,slug&ativo=eq.true'),
  ])
} catch (e) {
  completo(`erro lendo o banco: ${e.message}`)
}

const regerar = new Set()
const remover = new Set()
const novas = new Set()
const slugsPublicados = new Set(noticias.map((n) => n.slug))
const porId = new Map(noticias.map((n) => [String(n.id), n]))

// ---------------------------------------------------------------- notícias
const itensNoticia = itens.filter((i) => i.t === 'noticia')
if (itensNoticia.length) {
  const idsAfetados = new Set()
  const categorias = new Set()

  for (const i of itensNoticia) {
    idsAfetados.add(String(i.id))
    if (i.c) categorias.add(i.c)
    if (i.ca) categorias.add(i.ca)
    const atual = porId.get(String(i.id))
    if (atual) {
      regerar.add(`/noticias/${atual.slug}`)
      if (atual.categoria_id) categorias.add(atual.categoria_id)
      if (i.a === 'nova') novas.add(`/noticias/${atual.slug}`)
    }
    // slugs que essa notícia teve e que não estão mais no ar: a pasta sai
    for (const s of [i.s, i.sa]) {
      if (s && !slugsPublicados.has(s)) remover.add(`/noticias/${s}`)
    }
  }

  // "Leia também": as relacionadas escolhidas que apontam pras afetadas ...
  for (const r of relacionadas) {
    if (idsAfetados.has(String(r.relacionada_id))) {
      const origem = porId.get(String(r.noticia_id))
      if (origem) regerar.add(`/noticias/${origem.slug}`)
    }
  }
  // ... e, nas notícias sem relacionadas escolhidas, as 3 mais recentes da
  // categoria (fallback) -- regera todas as da categoria que caem nele.
  const comCuradoria = new Set(relacionadas.map((r) => String(r.noticia_id)))
  for (const n of noticias) {
    if (categorias.has(n.categoria_id) && !comCuradoria.has(String(n.id))) regerar.add(`/noticias/${n.slug}`)
  }

  for (const c of categorias) regerar.add(`/noticias/categoria/${c}`)

  const paginas = Math.max(1, Math.ceil(noticias.length / NOTICIAS_POR_PAGINA))
  regerar.add('/')
  regerar.add('/noticias')
  for (let p = 2; p <= paginas; p++) regerar.add(`/noticias/pagina/${p}`)
  regerar.add('/o-bairro-buritis')
  regerar.add('/conteudo')
}

// ---------------------------------------------------------------- produtos
const itensProduto = itens.filter((i) => i.t === 'produto')
if (itensProduto.length) {
  const ativosPorId = new Map(produtos.map((p) => [String(p.id), p]))
  const slugsAtivos = new Set(produtos.map((p) => p.slug))
  for (const i of itensProduto) {
    const atual = ativosPorId.get(String(i.id))
    if (atual) {
      regerar.add(`/loja/${atual.slug}`)
      if (i.a === 'nova') novas.add(`/loja/${atual.slug}`)
    }
    for (const s of [i.s, i.sa]) {
      if (s && !slugsAtivos.has(s)) remover.add(`/loja/${s}`)
    }
  }
  regerar.add('/')
  regerar.add('/loja')
}

for (const r of remover) regerar.delete(r)
if (regerar.size + remover.size > LIMITE_ROTAS) completo(`${regerar.size + remover.size} rotas (limite ${LIMITE_ROTAS})`)

sair({
  modo: 'incremental',
  regerar: [...regerar].sort(),
  remover: [...remover].sort(),
  novas: [...novas].sort(),
  paginasNoticias: Math.max(1, Math.ceil(noticias.length / NOTICIAS_POR_PAGINA)),
})
