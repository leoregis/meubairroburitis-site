import type { EmpresaPublica, PrestadorPublico } from '~/composables/useEmpresasPrestadores'

// Title/description e endereço estruturado das páginas /empresas/[slug] e
// /prestadores/[slug] (Fase C do SEO, 07/out/2026). Funções puras -- só
// montam texto a partir do que a RPC devolve, sem buscar nada.
//
// Limites: ~60 caracteres no title e ~155 na description. Quando passa, a
// escada de redução tira primeiro o "(BH)", depois encurta/tira o trecho
// após os dois-pontos (title) ou a frase do endereço (description). Title
// nunca termina em "…": no último degrau o nome é cortado na última palavra
// inteira.

const LIMITE_TITULO = 60
const LIMITE_DESCRICAO = 155

export interface EnderecoAnalisado {
  rua: string // "Av. Professor Mário Werneck, 2680"
  bairro: string | null // "Buritis"
  cidade: string | null // "Belo Horizonte"
  uf: string | null // "MG"
  cep: string | null // "30575-180"
}

// Os endereços vêm do autocomplete do Google, no formato
// "Av. Professor Mário Werneck, 2680 - Buritis, Belo Horizonte - MG, 30575-180, Brasil"
// (485 das 507 empresas ativas em 07/out). Fora desse formato, cai no que der
// pra aproveitar sem inventar dado.
export function analisarEndereco(endereco?: string | null): EnderecoAnalisado | null {
  const texto = endereco?.replace(/\s+/g, ' ').trim()
  if (!texto) return null

  const rua = texto.split(' - ')[0].replace(/,\s*Brasil$/i, '').trim()
  const bairro = texto.match(/ - ([^,]+), Belo Horizonte/i)?.[1]?.trim() || null
  const cidade = /Belo Horizonte/i.test(texto) ? 'Belo Horizonte' : null
  const uf = texto.match(/ - ([A-Z]{2})(?=,|\s|$)/)?.[1] || null
  const cepMatch = texto.match(/\b(\d{5})-?(\d{3})\b/)
  const cep = cepMatch ? `${cepMatch[1]}-${cepMatch[2]}` : null

  return { rua, bairro, cidade, uf, cep }
}

// Bairro na ordem de confiança: o do endereço do Google; senão o escolhido
// no cadastro (bairro_id -- obrigatório e sem valor padrão no formulário do
// app); senão null, e o texto diz "em BH" em vez de presumir Buritis.
export function bairroDaEmpresa(empresa: EmpresaPublica, bairroCadastro?: string | null) {
  return analisarEndereco(empresa.endereco)?.bairro || bairroCadastro?.trim() || null
}

// "no Buritis" / "em BH" -- trecho de localização do title
function ondeCurto(bairro: string | null) {
  return bairro ? `no ${bairro}` : 'em BH'
}

// "Avenida Professor Mário Werneck, 2654" -> "Av. Prof. Mário Werneck, 2654"
// (só pro title, onde cada caractere conta)
export function abreviarRua(rua: string) {
  return rua
    .replace(/\bAvenida\b/g, 'Av.')
    .replace(/\bProfessora?\b/g, 'Prof.')
    .replace(/\bDoutora?\b/g, 'Dr.')
    .replace(/\bRua\b/g, 'R.')
}

export function juntarLista(itens: string[]) {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}

// nome sem trechos entre parênteses: "Diogo Luiz Gonçalves (pinturas em
// geral, ...)" -> "Diogo Luiz Gonçalves" (só pro title)
export function nomeLimpo(nome: string) {
  return nome.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').replace(/[\s\-–—,:]+$/, '').trim()
}

// trechos entre parênteses do nome, sem os parênteses
function trechosEntreParenteses(nome: string) {
  return [...nome.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].trim()).filter(Boolean)
}

// corta em fim de palavra e marca com reticências (description)
export function cortarTexto(texto: string, max: number) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= max) return limpo
  const corte = limpo.slice(0, max - 1)
  const ultimoEspaco = corte.lastIndexOf(' ')
  return `${(ultimoEspaco > max * 0.5 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,.;:–-]+$/, '')}…`
}

// corta na última palavra inteira, SEM reticências (title)
export function cortarNaPalavra(texto: string, max: number) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= max) return limpo
  const corte = limpo.slice(0, max + 1)
  const ultimoEspaco = corte.lastIndexOf(' ')
  return (ultimoEspaco > 0 ? corte.slice(0, ultimoEspaco) : limpo.slice(0, max)).replace(/[\s,.;:–\-]+$/, '')
}

function primeiroQueCabe(candidatos: string[], limite: number) {
  return candidatos.find((c) => c.length <= limite) ?? candidatos[candidatos.length - 1]
}

// ----- Empresas -----

// unidade = rua e número, só quando há mais de uma unidade ativa com o mesmo
// nome (filial) -- senão o title/H1 diz qual das lojas é a página
export function unidadeDaEmpresa(empresa: EmpresaPublica, ehFilial: boolean) {
  if (!ehFilial) return null
  return analisarEndereco(empresa.endereco)?.rua || null
}

export function tituloEmpresa(empresa: EmpresaPublica, ehFilial = false, bairroCadastro?: string | null) {
  const nome = nomeLimpo(empresa.nome)
  const endereco = analisarEndereco(empresa.endereco)
  const bairro = bairroDaEmpresa(empresa, bairroCadastro)
  const ultimo = cortarNaPalavra(nome, LIMITE_TITULO)

  if (ehFilial && endereco?.rua) {
    const base = `${nome} – ${abreviarRua(endereco.rua)}`
    return primeiroQueCabe([bairro ? `${base} (${bairro})` : base, base, ultimo], LIMITE_TITULO)
  }

  const campos: string[] = []
  if (empresa.endereco) campos.push('endereço')
  if (empresa.telefone || empresa.whatsapp) campos.push('telefone')
  if (empresa.horarios?.length) campos.push('horário')
  const sufixo = (n: number) => (n > 0 ? `: ${juntarLista(campos.slice(0, n))}` : '')
  const onde = ondeCurto(bairro)

  // escada: tira o "(BH)" (só existe quando há bairro); depois encurta a
  // lista do fim pro começo (horário, telefone...) antes de tirar o trecho
  // todo; por último o nome sozinho, cortado na palavra se precisar
  const candidatos: string[] = []
  if (bairro) candidatos.push(`${nome} ${onde} (BH)${sufixo(campos.length)}`)
  for (let n = campos.length; n >= 0; n--) candidatos.push(`${nome} ${onde}${sufixo(n)}`)
  candidatos.push(ultimo)
  return primeiroQueCabe(candidatos, LIMITE_TITULO)
}

export function descricaoEmpresa(empresa: EmpresaPublica, bairroCadastro?: string | null) {
  const endereco = analisarEndereco(empresa.endereco)
  const bairro = bairroDaEmpresa(empresa, bairroCadastro)
  const categoria = (empresa.subcategoria_nome || empresa.categoria_nome || 'Empresa').trim()

  const local = bairro ? `${categoria} no ${bairro}, em Belo Horizonte.` : `${categoria} em Belo Horizonte.`
  // só o pedaço "rua, número" -- endereço sem rua reconhecível ("Buritis")
  // não vira frase
  const rua = endereco?.rua && /\d|^(Av|R|Rua|Avenida|Al|Alameda|Pç|Praça|Rod)\b/i.test(endereco.rua) ? `${endereco.rua}.` : ''

  const veja: string[] = []
  if (empresa.telefone) veja.push('telefone')
  if (empresa.whatsapp) veja.push('WhatsApp')
  if (empresa.horarios?.length) veja.push('horários')
  if (empresa.total_avaliacoes > 0) veja.push('avaliações')
  const chamada = veja.length ? `Veja ${juntarLista(veja)}.` : ''

  const montar = (...partes: string[]) => partes.filter(Boolean).join(' ')
  const candidatos = [montar(local, rua, chamada), montar(local, chamada), local]
  return cortarTexto(primeiroQueCabe(candidatos, LIMITE_DESCRICAO), LIMITE_DESCRICAO)
}

// PostalAddress do LocalBusiness com os campos separados. addressLocality é
// a cidade (o bairro não tem campo próprio no schema.org).
export function enderecoSchemaEmpresa(empresa: EmpresaPublica) {
  const endereco = analisarEndereco(empresa.endereco)
  if (!endereco) return undefined
  return {
    '@type': 'PostalAddress',
    streetAddress: endereco.rua,
    addressLocality: endereco.cidade || 'Belo Horizonte',
    addressRegion: endereco.uf || 'MG',
    postalCode: endereco.cep || undefined,
    addressCountry: 'BR',
  }
}

// ----- Prestadores -----

// Prestador não tem endereço fixo: atende o bairro e a região. Sem
// bairro_nome, o padrão aprovado é Buritis (o "em BH" vale só pras
// empresas, que têm endereço).
function bairroDoPrestador(prestador: PrestadorPublico) {
  return prestador.bairro_nome?.trim() || 'Buritis'
}

export function tituloPrestador(prestador: PrestadorPublico) {
  const nome = nomeLimpo(prestador.nome)
  const bairro = bairroDoPrestador(prestador)
  const categoria = (prestador.subcategoria_nome || prestador.categoria_nome || 'Prestador de serviço').trim()

  return primeiroQueCabe([
    `${nome}: ${categoria} no ${bairro} (BH)`,
    `${nome}: ${categoria} no ${bairro}`,
    cortarNaPalavra(nome, LIMITE_TITULO),
  ], LIMITE_TITULO)
}

export function descricaoPrestador(prestador: PrestadorPublico) {
  const bairro = bairroDoPrestador(prestador)
  const categoria = (prestador.subcategoria_nome || prestador.categoria_nome || 'Prestador de serviço').trim()
  const atende = `Atende o ${bairro} e região.`

  const temContato = prestador.exibir_telefone || prestador.exibir_whatsapp
  const temAvaliacao = prestador.total_avaliacoes > 0
  const chamada = temContato && temAvaliacao
    ? 'Veja contato e avaliações.'
    : temContato ? 'Veja o contato.' : temAvaliacao ? 'Veja as avaliações.' : ''

  const fixo = [atende, chamada].filter(Boolean).join(' ')
  const espaco = LIMITE_DESCRICAO - fixo.length - 1

  // texto livre do cadastro: tira HTML e espaço antes de pontuação ("a , b"),
  // e não começa repetindo o trecho entre parênteses do nome (ex.: Diogo
  // Luiz Gonçalves, cuja descrição é o próprio "(pinturas em geral, ...)")
  let resumo = prestador.descricao_curta?.replace(/<[^>]+>/g, ' ').replace(/\s+([,.;:!?])/g, '$1').replace(/\s+/g, ' ').trim() || ''
  for (const trecho of trechosEntreParenteses(prestador.nome)) {
    const t = trecho.toLowerCase()
    const r = resumo.replace(/^\(/, '').toLowerCase()
    if (r.startsWith(t)) resumo = resumo.replace(/^\(/, '').slice(trecho.length).replace(/^[)\s.,;:–-]+/, '').trim()
  }

  // sem texto próprio (ou só o trecho do nome), abre com a categoria
  if (!resumo) return cortarTexto(`${categoria}. ${fixo}`, LIMITE_DESCRICAO)
  if (espaco < 40) return cortarTexto(fixo, LIMITE_DESCRICAO)

  let inicio = cortarTexto(resumo.charAt(0).toUpperCase() + resumo.slice(1), espaco)
  if (!/[.!?…]$/.test(inicio)) inicio += '.'
  return cortarTexto(`${inicio} ${fixo}`, LIMITE_DESCRICAO)
}
