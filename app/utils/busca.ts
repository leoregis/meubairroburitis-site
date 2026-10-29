// Busca do site (redesign, fase 2) -- roda no navegador, sobre o índice que
// a página /busca traz pronto do build (useIndiceBusca). Nenhuma chamada ao
// Supabase na hora da busca.

// Índice compacto: listas de tuplas em vez de objetos, para o payload ficar
// pequeno (é o maior pedaço do HTML da /busca).
export interface IndiceBusca {
  // [titulo, subtitulo, slug, categoria, data AAAA-MM-DD]
  n: [string, string, string, string, string][]
  // [nome, slug, categoria, subcategoria]
  e: [string, string, string, string][]
  p: [string, string, string, string][]
}

export interface ResultadoBusca {
  tipo: 'noticia' | 'empresa' | 'prestador'
  titulo: string
  detalhe: string
  to: string
  data?: string
  ordem?: string // data AAAA-MM-DD, para o desempate
  pontos: number
}

// "Açaí" -> "acai", "PADARIA" -> "padaria"; pontuação vira espaço
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Todas as palavras da busca precisam aparecer (no começo de alguma
// palavra do texto). Pontua mais quando aparecem no título/nome.
function pontuar(palavras: string[], titulo: string, resto: string) {
  const t = ` ${titulo} `
  const r = ` ${resto} `
  let pontos = 0
  for (const p of palavras) {
    if (t.includes(` ${p} `)) pontos += 6
    else if (t.includes(` ${p}`)) pontos += 4
    else if (r.includes(` ${p}`)) pontos += 1
    else return 0
  }
  if (titulo.startsWith(palavras.join(' '))) pontos += 3
  return pontos
}

export function buscar(indice: IndiceBusca, termo: string) {
  const palavras = normalizar(termo).split(' ').filter((p) => p.length >= 2)
  const vazio = { noticias: [] as ResultadoBusca[], empresas: [] as ResultadoBusca[], prestadores: [] as ResultadoBusca[] }
  if (!palavras.length) return vazio

  const noticias: ResultadoBusca[] = []
  for (const [titulo, subtitulo, slug, categoria, data] of indice.n) {
    const pontos = pontuar(palavras, normalizar(titulo), normalizar(`${subtitulo} ${categoria}`))
    if (pontos) noticias.push({ tipo: 'noticia', titulo, detalhe: subtitulo, to: `/noticias/${slug}`, data: `${categoria}${categoria && data ? ' · ' : ''}${data ? data.split('-').reverse().join('/') : ''}`, ordem: data, pontos })
  }
  const diretorio = (linhas: IndiceBusca['e'], tipo: 'empresa' | 'prestador', base: string) => {
    const saida: ResultadoBusca[] = []
    for (const [nome, slug, categoria, subcategoria] of linhas) {
      const pontos = pontuar(palavras, normalizar(nome), normalizar(`${categoria} ${subcategoria}`))
      if (pontos) saida.push({ tipo, titulo: nome, detalhe: [categoria, subcategoria].filter(Boolean).join(' · '), to: `${base}/${slug}`, pontos })
    }
    return saida.sort((a, b) => b.pontos - a.pontos || a.titulo.localeCompare(b.titulo, 'pt-BR'))
  }

  return {
    // notícias: mais relevantes primeiro; empate, a mais recente
    noticias: noticias.sort((a, b) => b.pontos - a.pontos || (b.ordem || '').localeCompare(a.ordem || '')),
    empresas: diretorio(indice.e, 'empresa', '/empresas'),
    prestadores: diretorio(indice.p, 'prestador', '/prestadores'),
  }
}
