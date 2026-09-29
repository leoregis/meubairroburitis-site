// Menu principal do site -- fonte única pro Header e pro Footer (o rodapé
// antes tinha uma lista própria, só com parte dos itens, e ficava
// desatualizado toda vez que o menu mudava).
export const LINKS_MENU_PRINCIPAL = [
  { label: 'Início', to: '/' },
  { label: 'Quem Somos', to: '/quem-somos' },
  { label: 'O Bairro Buritis', to: '/o-bairro-buritis' },
  { label: 'Notícias', to: '/noticias' },
  { label: 'Empresas', to: '/empresas' },
  { label: 'Prestadores', to: '/prestadores' },
  { label: 'Anuncie', to: '/loja' },
  { label: 'Midiakit', to: '/midiakit' },
  { label: 'Canais', to: '/canais' },
]

// 🔥 app é uma aplicação separada (meubairro-app, hospedado em /guia) --
// abre em nova aba, por isso fica fora da lista acima (que alimenta
// NuxtLink, só pra rotas internas).
export const LINK_APP_GUIA = { label: 'Guia Buritis', href: '/guia/' }
