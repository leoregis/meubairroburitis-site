#!/usr/bin/env node
// Build incremental (etapa 3, 09/out): monta os roteiros de FTP (lftp) do
// envio parcial pra dentro de public_html/_current, a partir da lista de
// rotas (rotas-afetadas.mjs) e do build parcial em .output/public.
//
// Uso: node scripts/incremental/preparar-envio.mjs <rotas.json> <.output/public> <saida/> [nuxt_remoto.txt] [sobras.txt] [ipx_remoto.txt]
//   nuxt_remoto.txt     -- nomes dos arquivos que já existem em _current/_nuxt (cls -1)
//   sobras.txt          -- páginas de listagem que passaram do total (mesclar-sitemap.mjs)
//   ipx_remoto.txt      -- _current/_ipx-lista.txt (imagens já no ar, gravada pelo
//                          build completo); sem ela, todas as imagens do build sobem
//
// Gera em <saida/>:
//   backup.lftp     baixa os arquivos que vão ser sobrescritos (pra desfazer)
//   envio.lftp      sobe na ordem: _nuxt que falta -> imagens _ipx -> páginas
//                   de detalhe -> listagens/home -> sitemap.xml -> _build.txt
//   remocao.lftp    apaga as pastas das rotas que saíram do ar (por último)
//   restaurar.lftp  devolve os arquivos do backup (usado só se algo falhar)
//   urls.txt        URLs pra purga do Cloudflare
//   resumo.json     contagens, pro log
// Cada arquivo sobe com nome temporário e é renomeado no fim
// (xfer:use-temp-file): o visitante nunca recebe um arquivo pela metade.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, posix } from 'node:path'

const [, , arqRotas, dirOutput, dirSaida, arqNuxtRemoto, arqSobras, arqIpxRemoto] = process.argv
// produção: _current; staging (deploy-staging.yml): public_html/_staging_test
const SITE = process.env.MBB_SITE || 'https://meubairroburitis.com.br'
const REMOTO = process.env.MBB_REMOTO || 'public_html/_current'

const { regerar, remover } = JSON.parse(readFileSync(arqRotas, 'utf8'))
mkdirSync(dirSaida, { recursive: true })

const lerLista = (arq) => (arq && existsSync(arq) ? readFileSync(arq, 'utf8').split(/\r?\n/).map((l) => l.trim().replace(/\/$/, '')).filter(Boolean) : [])
const pastaDaRota = (r) => (r === '/' ? '' : r.replace(/^\//, '').replace(/\/$/, ''))
const q = (s) => `"${s.replace(/"/g, '\\"')}"`

function arquivosEm(dir, base = '') {
  if (!existsSync(dir)) return []
  const saida = []
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    const rel = base ? `${base}/${nome}` : nome
    if (statSync(caminho).isDirectory()) saida.push(...arquivosEm(caminho, rel))
    else saida.push(rel)
  }
  return saida
}

// --------------------------------------------------- arquivos de cada rota
const faltando = []
const paginasDetalhe = []
const paginasLista = []
for (const r of regerar) {
  const pasta = pastaDaRota(r)
  const arquivos = ['index.html', '_payload.json']
    .map((f) => (pasta ? `${pasta}/${f}` : f))
    .filter((f) => existsSync(join(dirOutput, f)))
  if (!arquivos.includes(pasta ? `${pasta}/index.html` : 'index.html')) faltando.push(r)
  // detalhe = notícia ou produto; o resto (home, listagens, categorias,
  // páginas institucionais) sobe depois, pra nunca listar o que ainda não existe
  const detalhe = /^\/(noticias|loja)\/[^/]+$/.test(r) && !/^\/noticias\/(pagina|categoria)$/.test(r)
  ;(detalhe ? paginasDetalhe : paginasLista).push({ rota: r, pasta, arquivos })
}
if (faltando.length) {
  console.error('ERRO: rotas pedidas que o build não gerou:\n  ' + faltando.join('\n  '))
  process.exit(1)
}

// --------------------------------------------------- _nuxt e imagens _ipx
const nuxtRemoto = new Set(lerLista(arqNuxtRemoto))
const nuxtLocal = arquivosEm(join(dirOutput, '_nuxt'))
// _nuxt é plano (sem subpastas) neste build; subpasta, se aparecer, sobe inteira
const nuxtNovos = nuxtLocal.filter((f) => f.includes('/') || !nuxtRemoto.has(f)).map((f) => `_nuxt/${f}`)
// imagens: o build parcial regera todas as variantes das páginas tocadas, mas
// quase todas já estão no ar (mesmo arquivo, mesmo nome) -- sobe só as que
// faltam e grava a lista atualizada (sobe depois das imagens, nunca antes)
const ipxRemoto = lerLista(arqIpxRemoto)
const ipxNoAr = new Set(ipxRemoto)
const ipxLocal = arquivosEm(join(dirOutput, '_ipx')).map((f) => `_ipx/${f}`)
const ipx = ipxRemoto.length ? ipxLocal.filter((f) => !ipxNoAr.has(f)) : ipxLocal
const listaIpx = [...new Set([...ipxRemoto, ...ipxLocal])].sort()
writeFileSync(join(dirOutput, '_ipx-lista.txt'), listaIpx.join('\n') + '\n')

// --------------------------------------------------- páginas que sobram
const removerPastas = [...new Set([...remover, ...lerLista(arqSobras)].map(pastaDaRota))]

// --------------------------------------------------- roteiros
const cabecalho = (failExit) => [
  'set ftp:ssl-force true',
  'set ftp:ssl-protect-data true',
  'set ssl:verify-certificate no',
  'set net:timeout 15',
  'set net:max-retries 6',
  'set net:reconnect-interval-base 10',
  'set net:reconnect-interval-multiplier 2',
  'set net:reconnect-interval-max 60',
  `set cmd:fail-exit ${failExit}`,
]

function blocoPut(arquivos) {
  const linhas = []
  const pastas = [...new Set(arquivos.map((f) => posix.dirname(f)).filter((d) => d !== '.'))].sort()
  // "mkdir -p" do lftp falha em pasta que já existe: tolera só ele
  if (pastas.length) {
    linhas.push('set cmd:fail-exit no')
    for (const d of pastas) linhas.push(`mkdir -p ${q(`${REMOTO}/${d}`)}`)
    linhas.push('set cmd:fail-exit yes')
  }
  for (const f of arquivos) linhas.push(`put ${q(join(dirOutput, f).replace(/\\/g, '/'))} -o ${q(`${REMOTO}/${f}`)}`)
  return linhas
}

const todosArquivosDeRota = [...paginasDetalhe, ...paginasLista].flatMap((p) => p.arquivos)

// cópia local em <saida>/backup/ (as pastas são criadas aqui: o get do lftp
// não cria pasta local)
const dirBackup = join(dirSaida, 'backup').replace(/\\/g, '/')
const backup = [...cabecalho('no')]
for (const f of [...todosArquivosDeRota, 'sitemap.xml', '_ipx-lista.txt', '_build.txt']) {
  mkdirSync(posix.dirname(`${dirBackup}/${f}`), { recursive: true })
  backup.push(`get ${q(`${REMOTO}/${f}`)} -o ${q(`${dirBackup}/${f}`)}`)
}

const envio = [
  ...cabecalho('yes'),
  'set xfer:use-temp-file yes',
  'set xfer:temp-file-name .mbb-envio-*',
  'set net:connection-limit 2',
  ...blocoPut(nuxtNovos),
  ...blocoPut(ipx),
  ...blocoPut(['_ipx-lista.txt']),
  ...blocoPut(paginasDetalhe.flatMap((p) => p.arquivos)),
  ...blocoPut(paginasLista.flatMap((p) => p.arquivos)),
  ...blocoPut(['sitemap.xml']),
  ...blocoPut(['_build.txt']),
]

const remocao = [...cabecalho('no')]
for (const d of removerPastas) remocao.push(`rm -r ${q(`${REMOTO}/${d}`)}`)

// restauração: só os arquivos que existiam (o backup baixa o que havia)
const restaurar = [...cabecalho('no'), 'set xfer:use-temp-file yes']
for (const f of [...todosArquivosDeRota, 'sitemap.xml', '_ipx-lista.txt', '_build.txt']) {
  restaurar.push(`put ${q(`${dirBackup}/${f}`)} -o ${q(`${REMOTO}/${f}`)}`)
}

// conferência depois do envio: toda página regerada existe no servidor
// (fail-exit: um "cls" que não acha o arquivo derruba o passo) ...
const conferencia = [...cabecalho('yes')]
for (const p of [...paginasDetalhe, ...paginasLista]) {
  conferencia.push(`cls -1 ${q(`${REMOTO}/${p.pasta ? `${p.pasta}/` : ''}index.html`)}`)
}
// ... e as removidas sumiram (o workflow confere que a saída veio vazia)
const conferenciaRemocao = [...cabecalho('no')]
for (const d of removerPastas) conferenciaRemocao.push(`cls -1 ${q(`${REMOTO}/${d}/index.html`)}`)

const urls = new Set([`${SITE}/sitemap.xml`])
for (const r of [...regerar, ...remover, ...removerPastas.map((d) => `/${d}`)]) {
  const base = r === '/' ? SITE : `${SITE}${r}`
  urls.add(r === '/' ? `${SITE}/` : base)
  urls.add(`${base}/`)
  urls.add(`${base}/_payload.json`)
}

writeFileSync(join(dirSaida, 'backup.lftp'), backup.join('\n') + '\nbye\n')
writeFileSync(join(dirSaida, 'envio.lftp'), envio.join('\n') + '\nbye\n')
writeFileSync(join(dirSaida, 'remocao.lftp'), remocao.join('\n') + '\nbye\n')
writeFileSync(join(dirSaida, 'restaurar.lftp'), restaurar.join('\n') + '\nbye\n')
writeFileSync(join(dirSaida, 'conferencia.lftp'), conferencia.join('\n') + '\nbye\n')
writeFileSync(join(dirSaida, 'conferencia-remocao.lftp'), conferenciaRemocao.join('\n') + '\nbye\n')
writeFileSync(join(dirSaida, 'urls.txt'), [...urls].join('\n') + '\n')
const resumo = {
  rotasDetalhe: paginasDetalhe.length,
  rotasListagem: paginasLista.length,
  arquivosDePagina: todosArquivosDeRota.length,
  nuxtNovos: nuxtNovos.length,
  imagensIpx: ipx.length,
  imagensIpxJaNoAr: ipxLocal.length - ipx.length,
  pastasRemovidas: removerPastas,
  urlsPurga: urls.size,
}
writeFileSync(join(dirSaida, 'resumo.json'), JSON.stringify(resumo, null, 2))
console.log(JSON.stringify(resumo))
