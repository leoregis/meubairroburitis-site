import type { Produto } from '~/composables/useProdutos'

/**
 * Espelha o conteúdo inicial da migration `produtos` do Supabase (ver
 * supabase/migrations/). Usado como fallback local enquanto o projeto
 * Supabase separado ainda não está configurado — assim que
 * NUXT_PUBLIC_SUPABASE_URL/ANON_KEY existirem, os dados reais do banco
 * substituem este arquivo automaticamente (ver useProdutos.ts).
 */
export const PRODUTOS_SEED: Produto[] = [
  {
    id: 'seed-mbb-basic',
    slug: 'mbb-basic',
    nome: 'MBB Basic',
    descricao_curta: '4 aparições mensais (mix de Stories + Colab) — 1 por semana.',
    descricao:
      'Recomendado para negócios que desejam presença contínua no bairro com investimento acessível. Entrega distribuída em 1 Story por semana e 1 Colab por mês.',
    preco_centavos: 24900,
    imagem_url: '/produtos/mbb-basic.jpeg',
    ordem: 1,
  },
  {
    id: 'seed-mbb-premium',
    slug: 'mbb-premium',
    nome: 'MBB Premium',
    descricao_curta: '8 aparições mensais (Stories + Colabs) — 2 por semana.',
    descricao:
      'Indicado para negócios que desejam presença forte e competitiva no bairro, mantendo lembrança, preferência e referência local. Entrega distribuída em 2 Stories por semana e 1 Colab a cada 15 dias.',
    preco_centavos: 54900,
    imagem_url: '/produtos/mbb-premium.jpeg',
    ordem: 2,
  },
  {
    id: 'seed-video-reels',
    slug: 'producao-de-video-reels',
    nome: 'Produção de vídeo Reels',
    descricao_curta: 'Vídeo comercial de até 1 minuto, produzido pela nossa equipe.',
    descricao:
      'Produção de um vídeo comercial de até 1 minuto por conta da equipe Meu Bairro Buritis. Garante 1 post Reels no Instagram, TikTok, Twitter e grupos do Facebook e Telegram. Inclui apresentadora, captação profissional e edição de alta qualidade. Entrega em até 7 dias úteis após a gravação.',
    preco_centavos: 54900,
    imagem_url: '/produtos/producao-de-video-reels.jpg',
    ordem: 3,
  },
  {
    id: 'seed-colab-insta',
    slug: 'colab-insta',
    nome: 'Colab Insta',
    descricao_curta: 'Você publica o Reels e marca @meubairroburitis como colaborador.',
    descricao:
      'Você posta o seu Reels no seu perfil e marca o @meubairroburitis como colaborador — o vídeo também é exibido para os nossos seguidores.',
    preco_centavos: 11900,
    imagem_url: '/produtos/colab-insta.jpg',
    ordem: 4,
  },
  {
    id: 'seed-stories',
    slug: 'stories-no-instagram',
    nome: 'Stories no Instagram',
    descricao_curta: '1 story divulgando sua empresa no nosso perfil.',
    descricao:
      'Divulgação de um post da sua empresa em um story na nossa conta do Instagram, na data e horário definidos por você.',
    preco_centavos: 4900,
    imagem_url: '/produtos/stories-no-instagram.png',
    ordem: 5,
  },
]
