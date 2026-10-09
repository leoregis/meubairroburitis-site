#!/usr/bin/env node
// Build incremental (etapas 3 e 4, 09/out): converte os itens da fila de
// deploy (input "itens" do workflow -- ver deploy_fila_itens no banco do
// site) na lista de rotas a regerar e a apagar.
//
// Uso: node scripts/incremental/rotas-afetadas.mjs <itens.json> <saida.json>
//
// Lê os bancos (site e Guia) com as chaves ANÔNIMAS -- só o que é público --
// e decide pelo estado ATUAL de cada registro, não pela ordem dos itens:
// publicado/ativo agora -> regera a página; senão -> apaga os slugs que ele
// já teve.
//
// Saída: { modo: "incremental" | "completo", motivo, regerar[], remover[],
//          novas[], paginacao: { "<listagem>": total de páginas } }
// "paginacao" lista as listagens regeradas: as páginas /pagina/N que
// passarem do total saem do ar (mesclar-sitemap.mjs as acha no sitemap).
// Qualquer coisa fora do que este script sabe tratar vira modo "completo"
// (o build de sempre) -- nunca um incremental pela metade.

import { readFileSync, writeFileSync } from 'node:fs'

const [, , arqItens, arqSaida] = process.argv
const LIMITE_ROTAS = 300
// iguais aos de nuxt.config.ts e das páginas de listagem
const NOTICIAS_POR_PAGINA = 12
const GUIA_POR_PAGINA = 24

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

const TIPOS = { site: ['noticia', 'produto'], guia: ['empresa', 'prestador'] }
for (const i of itens) {
  const origem = i.o || 'site'
  if (i.t === 'estrutura') completo(`mudança de estrutura (${i.id || 'categorias'})`)
  if (!TIPOS[origem]?.includes(i.t)) completo(`item desconhecido: ${origem}/${i.t}`)
  if (!['nova', 'editada', 'removida'].includes(i.a)) completo(`ação desconhecida: ${i.a}`)
  if (!i.id) completo('item sem id')
}

function cliente(url, chave, nome) {
  if (!url || !chave) completo(`sem acesso ao banco do ${nome}`)
  const cabecalhos = { apikey: chave, Authorization: `Bearer ${chave}` }
  return {
    async ler(caminho) {
      const r = await fetch(`${url}/rest/v1/${caminho}`, { headers: cabecalhos })
      if (!r.ok) throw new Error(`${nome} ${caminho.split('?')[0]}: HTTP ${r.status}`)
      return r.json()
    },
    // total de linhas (Content-Range), como o count exact do build
    async contar(caminho) {
      const r = await fetch(`${url}/rest/v1/${caminho}`, { method: 'HEAD', headers: { ...cabecalhos, Prefer: 'count=exact' } })
      if (!r.ok) throw new Error(`${nome} ${caminho.split('?')[0]}: HTTP ${r.status}`)
      return Number((r.headers.get('content-range') || '').split('/')[1] || 0)
    },
  }
}

const regerar = new Set()
const remover = new Set()
const novas = new Set()
const paginacao = {}
const paginas = (total, porPagina) => Math.max(1, Math.ceil(total / porPagina))
function listagem(base, totalPaginas) {
  paginacao[base] = totalPaginas
  regerar.add(base)
  for (let p = 2; p <= totalPaginas; p++) regerar.add(`${base}/pagina/${p}`)
}

try {
  // -------------------------------------------------------------- site
  const itensSite = itens.filter((i) => (i.o || 'site') === 'site')
  if (itensSite.length) {
    const site = cliente(process.env.NUXT_PUBLIC_SUPABASE_URL, process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY, 'site')

    const itensNoticia = itensSite.filter((i) => i.t === 'noticia')
    if (itensNoticia.length) {
      const [noticias, relacionadas] = await Promise.all([
        site.ler('noticias?select=id,slug,categoria_id&status=eq.publicado'),
        site.ler('noticias_relacionadas?select=noticia_id,relacionada_id'),
      ])
      const slugsPublicados = new Set(noticias.map((n) => n.slug))
      const porId = new Map(noticias.map((n) => [String(n.id), n]))
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
        for (const s of [i.s, i.sa]) if (s && !slugsPublicados.has(s)) remover.add(`/noticias/${s}`)
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
      listagem('/noticias', paginas(noticias.length, NOTICIAS_POR_PAGINA))
      regerar.add('/')
      regerar.add('/o-bairro-buritis')
      regerar.add('/conteudo')
    }

    const itensProduto = itensSite.filter((i) => i.t === 'produto')
    if (itensProduto.length) {
      const produtos = await site.ler('produtos?select=id,slug&ativo=eq.true')
      const ativosPorId = new Map(produtos.map((p) => [String(p.id), p]))
      const slugsAtivos = new Set(produtos.map((p) => p.slug))
      for (const i of itensProduto) {
        const atual = ativosPorId.get(String(i.id))
        if (atual) {
          regerar.add(`/loja/${atual.slug}`)
          if (i.a === 'nova') novas.add(`/loja/${atual.slug}`)
        }
        for (const s of [i.s, i.sa]) if (s && !slugsAtivos.has(s)) remover.add(`/loja/${s}`)
      }
      regerar.add('/')
      regerar.add('/loja')
    }
  }

  // -------------------------------------------------------------- Guia
  // empresa = unidade (empresas_unidades.id); prestador = prestadores.id.
  // Afeta: a página do registro; a listagem e TODAS as categorias do tipo
  // (registro desativado já não diz a categoria que tinha); home e
  // /o-bairro-buritis (destaques). Empresa: também as outras unidades da
  // mesma empresa (a página diz se é filial).
  const itensGuia = itens.filter((i) => i.o === 'guia')
  if (itensGuia.length) {
    const guia = cliente(process.env.NUXT_PUBLIC_MEUBAIRRO_APP_SUPABASE_URL, process.env.NUXT_PUBLIC_MEUBAIRRO_APP_SUPABASE_ANON_KEY, 'Guia')

    const itensEmpresa = itensGuia.filter((i) => i.t === 'empresa')
    if (itensEmpresa.length) {
      const [unidades, categorias, total] = await Promise.all([
        guia.ler('empresas_unidades?select=id,slug,empresas(nome)&ativo=eq.true&slug=not.is.null&limit=5000'),
        guia.ler('empresas_categorias?select=slug_seo'),
        guia.contar('vw_empresas_publico_listagem?select=unidade_id'),
      ])
      const porId = new Map(unidades.map((u) => [String(u.id), u]))
      const slugsAtivos = new Set(unidades.map((u) => u.slug))
      const nomeDe = (u) => (u.empresas?.nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
      const nomesAfetados = new Set()
      for (const i of itensEmpresa) {
        const atual = porId.get(String(i.id))
        if (atual) {
          regerar.add(`/empresas/${atual.slug}`)
          if (i.a === 'nova') novas.add(`/empresas/${atual.slug}`)
          nomesAfetados.add(nomeDe(atual))
        } else if (i.n) {
          nomesAfetados.add(i.n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim())
        }
        for (const s of [i.s, i.sa]) if (s && !slugsAtivos.has(s)) remover.add(`/empresas/${s}`)
      }
      for (const u of unidades) if (nomesAfetados.has(nomeDe(u))) regerar.add(`/empresas/${u.slug}`)

      listagem('/empresas', paginas(total, GUIA_POR_PAGINA))
      for (const c of categorias) {
        if (!c.slug_seo) continue
        const n = await guia.contar(`vw_empresas_publico_listagem?select=unidade_id&categoria_slug=eq.${encodeURIComponent(c.slug_seo)}`)
        listagem(`/empresas/categoria/${c.slug_seo}`, paginas(n, GUIA_POR_PAGINA))
      }
      regerar.add('/')
      regerar.add('/o-bairro-buritis')
    }

    const itensPrestador = itensGuia.filter((i) => i.t === 'prestador')
    if (itensPrestador.length) {
      const [prestadores, categorias, total] = await Promise.all([
        guia.ler('vw_prestadores_publico?select=id,slug&ativo=eq.true&slug=not.is.null&limit=5000'),
        guia.ler('categorias?select=slug_seo&ativo=eq.true'),
        guia.contar('vw_prestadores_publico_listagem?select=id'),
      ])
      const porId = new Map(prestadores.map((p) => [String(p.id), p]))
      const slugsAtivos = new Set(prestadores.map((p) => p.slug))
      for (const i of itensPrestador) {
        const atual = porId.get(String(i.id))
        if (atual) {
          regerar.add(`/prestadores/${atual.slug}`)
          if (i.a === 'nova') novas.add(`/prestadores/${atual.slug}`)
        }
        for (const s of [i.s, i.sa]) if (s && !slugsAtivos.has(s)) remover.add(`/prestadores/${s}`)
      }

      listagem('/prestadores', paginas(total, GUIA_POR_PAGINA))
      for (const c of categorias) {
        if (!c.slug_seo) continue
        const n = await guia.contar(`vw_prestadores_publico_listagem?select=id&categoria_slug=eq.${encodeURIComponent(c.slug_seo)}`)
        listagem(`/prestadores/categoria/${c.slug_seo}`, paginas(n, GUIA_POR_PAGINA))
      }
      regerar.add('/')
      regerar.add('/o-bairro-buritis')
    }
  }
} catch (e) {
  completo(`erro lendo o banco: ${e.message}`)
}

for (const r of remover) regerar.delete(r)
if (regerar.size + remover.size > LIMITE_ROTAS) completo(`${regerar.size + remover.size} rotas (limite ${LIMITE_ROTAS})`)

sair({
  modo: 'incremental',
  regerar: [...regerar].sort(),
  remover: [...remover].sort(),
  novas: [...novas].sort(),
  paginacao,
})
