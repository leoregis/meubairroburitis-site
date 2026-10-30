// Página Anuncie (/loja) -- redesign, fase 5.
//
// Preço, nome, descrição e o que cada pacote inclui vêm da tabela `produtos`
// (useProdutos), como antes. Aqui fica só o que NÃO está no banco:
//  - em que grupo cada produto aparece (plano mensal ou formato avulso, e
//    quem produz o conteúdo), pelo slug -- produto novo sem grupo aparece nos
//    avulsos, sem selo;
//  - o Plano Imobiliário, que não é vendido pelo carrinho (abaixo);
//  - números de alcance e cases, os mesmos textos que estavam na home.

export type GrupoProduto = 'plano' | 'equipe' | 'pronto'

export const GRUPO_POR_SLUG: Record<string, GrupoProduto> = {
  'mbb-basic': 'plano',
  'mbb-premium': 'plano',
  'producao-de-video-reels': 'equipe',
  'conteudo-publicitario-especial': 'equipe',
  'colab-insta': 'pronto',
  'stories-no-instagram': 'pronto',
}

export const ROTULO_GRUPO: Record<Exclude<GrupoProduto, 'plano'>, string> = {
  equipe: 'Nossa equipe produz',
  pronto: 'Conteúdo enviado pronto',
}

export const ICONE_POR_SLUG: Record<string, string> = {
  'producao-de-video-reels': 'lucide:video',
  'conteudo-publicitario-especial': 'lucide:newspaper',
  'colab-insta': 'lucide:users',
  'stories-no-instagram': 'lucide:smartphone',
}

// Plano Imobiliário (decisão do Leo, 29/10/2026). Contrato mensal cobrado pelo
// Asaas, fora do carrinho do site: não é produto da tabela `produtos`, por
// isso o preço fica aqui. Mudou o preço ou o que inclui? Mude só esta constante.
export const PLANO_IMOBILIARIO = {
  nome: 'Plano Imobiliário',
  publico: 'Para imobiliárias e corretores',
  precoMensal: 'R$ 500',
  inclui: [
    'Anúncios de imóveis pré-aprovados no grupo do Facebook',
    'Corretores indicados sem limite',
    'Publicações sem limite',
  ],
  naoInclui: 'Vale só para o grupo do Facebook. Não inclui Instagram nem outros canais.',
  mensagemWhatsapp: 'Olá! Quero saber mais sobre o Plano Imobiliário (R$ 500/mês) para a minha imobiliária.',
}

// os mesmos números que a home mostrava (antigo HomeNumerosDestaque, removido na fase 5)
export const NUMEROS_ALCANCE = [
  { valor: '150 mil+', legenda: 'membros no maior grupo de bairro de BH, no Facebook' },
  { valor: '55 mil+', legenda: 'seguidores no Instagram' },
  { valor: 'desde 2012', legenda: 'site e comunidade no ar, sem interrupção' },
  { valor: '5', legenda: 'redes sociais ativas: Instagram, Facebook, TikTok, Telegram, YouTube' },
]

// os mesmos cases que a home mostrava (antigo HomeDepoimentos, removido na fase 5)
export const CASES_ANUNCIE = [
  {
    empresa: 'Romeo Pizza Bar',
    citacao: 'Muito, muito bom! Até me desculpem por não ter agradecido antes. Foi muito legal! Estou patrocinando até hoje e muita gente entra em contato.',
    autor: 'Fabrício, proprietário',
    numeros: [{ valor: '174 mil', rotulo: 'visualizações' }, { valor: '99 mil', rotulo: 'contas alcançadas' }, { valor: '159', rotulo: 'novos seguidores' }],
    logo: '/anunciantes/romeo1-1.png',
  },
  {
    empresa: 'Shopping Paragem',
    citacao: 'Vídeo sobre as atrações infantis do shopping teve excelente desempenho já nas primeiras 24 horas, com alto número de compartilhamentos.',
    autor: 'Case — atrações infantis',
    numeros: [{ valor: '70 mil', rotulo: 'visualizações' }, { valor: '48 mil', rotulo: 'contas alcançadas' }],
    logo: '/anunciantes/paragem1-2.png',
  },
  {
    empresa: 'Bendito Japa',
    citacao: 'O vídeo gerou grande interesse entre os seguidores em menos de dois dias no ar, se posicionando como referência local em alta gastronomia japonesa.',
    autor: 'Case — rodízio japonês premium',
    numeros: [{ valor: '142 mil', rotulo: 'visualizações' }, { valor: '54 mil', rotulo: 'contas alcançadas' }],
    logo: '/anunciantes/benditojapa1-2.png',
  },
]

// "R$ 249" em vez de "R$ 249,00" quando não há centavos
export function precoCurto(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: centavos % 100 === 0 ? 0 : 2,
  })
}

// itens "- ..." da descrição do produto (o "Inclui, por mês:" dos planos)
export function itensDaDescricao(descricao: string | null | undefined) {
  return (descricao ?? '')
    .split('\n')
    .map((linha) => linha.trim())
    .filter((linha) => linha.startsWith('- '))
    .map((linha) => linha.slice(2).trim())
}
