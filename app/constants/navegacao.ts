// Navegação do site -- fonte única pro Header, MenuCelular, TopBar e Footer.
//
// Redesign (fase 1, decisões 4 e 5 do docs/redesign/plano.md): o cabeçalho
// mostra as editorias (categorias reais de notícias) e depois Empresas e
// Prestadores, que precisam do link em toda página (são ~800 páginas do
// diretório). Quem Somos, Midiakit e Canais saíram do cabeçalho e ficaram no
// rodapé -- algumas páginas só são descobertas pelo crawler do prerender por
// esses links, então nenhum link pode sumir das duas listas ao mesmo tempo.

export interface ItemMenu {
  label: string
  to: string
}

export const LINK_ULTIMAS: ItemMenu = { label: 'Últimas', to: '/noticias' }

export const EDITORIAS: ItemMenu[] = [
  { label: 'Segurança', to: '/noticias/categoria/seguranca' },
  { label: 'Mobilidade', to: '/noticias/categoria/mobilidade-urbanismo' },
  { label: 'Comércio', to: '/noticias/categoria/comercio-negocios' },
  { label: 'Pessoas', to: '/noticias/categoria/pessoas-comunidade' },
  { label: 'Eventos', to: '/noticias/categoria/esportes-eventos' },
  { label: 'O Bairro', to: '/o-bairro-buritis' },
]

export const LINKS_DIRETORIO: ItemMenu[] = [
  { label: 'Empresas', to: '/empresas' },
  { label: 'Prestadores', to: '/prestadores' },
]

// ordem do cabeçalho: Últimas, editorias, Empresas, Prestadores
export const LINKS_CABECALHO: ItemMenu[] = [LINK_ULTIMAS, ...EDITORIAS, ...LINKS_DIRETORIO]

export const LINK_ANUNCIE: ItemMenu = { label: 'Anuncie', to: '/loja' }

// coluna "Navegação" do rodapé
export const LINKS_RODAPE_NAVEGACAO: ItemMenu[] = [
  { label: 'Início', to: '/' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Guias do bairro', to: '/conteudo' },
  ...LINKS_DIRETORIO,
  LINK_ANUNCIE,
  { label: 'Midiakit', to: '/midiakit' },
]

// Estrutura institucional/editorial -- rodapé, bloco em Quem Somos e a
// navegação entre as próprias páginas institucionais.
export const LINKS_INSTITUCIONAIS: ItemMenu[] = [
  { label: 'Quem Somos', to: '/quem-somos' },
  { label: 'Expediente', to: '/expediente' },
  { label: 'Política Editorial', to: '/politica-editorial' },
  { label: 'Correções e Direito de Resposta', to: '/correcoes-e-direito-de-resposta' },
  { label: 'Publicidade e Conteúdo Patrocinado', to: '/publicidade-e-conteudo-patrocinado' },
]

// área do cliente (login por código no WhatsApp) -- barra superior no
// computador, menu no celular e coluna Navegação do rodapé.
export const LINK_MEUS_PEDIDOS: ItemMenu = { label: 'Meus pedidos', to: '/meus-pedidos' }

// O app é uma aplicação separada (meubairro-app, em /guia) -- <a> comum,
// nunca NuxtLink. Nova aba no computador, mesma aba no celular (decisão 6).
export const LINK_APP_GUIA = { label: 'Guia Buritis', href: '/guia/' }

// Redes oficiais -- barra superior (as três primeiras) e rodapé. O número
// do WhatsApp vem do runtimeConfig.public.whatsappNumero.
export function redesOficiais(whatsappNumero: string) {
  return [
    { label: 'Instagram', href: 'https://www.instagram.com/meubairroburitis/' },
    { label: 'Grupo no Facebook', href: 'https://www.facebook.com/groups/MeuBairroBuritisGrupo' },
    { label: 'WhatsApp', href: `https://wa.me/${whatsappNumero}` },
    { label: 'Página no Facebook', href: 'https://www.facebook.com/MeuBairroBuritis/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@meubairroburitis' },
  ]
}
