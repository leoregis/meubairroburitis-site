create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  descricao_curta text,
  descricao text,
  preco_centavos integer not null,
  imagem_url text,
  ordem integer not null default 0,
  ativo boolean not null default true
);

alter table public.produtos enable row level security;

create policy "produtos_ativos_sao_publicos"
  on public.produtos for select
  to anon, authenticated
  using (ativo = true);

-- Sem policy de insert/update/delete para anon/authenticated: edição do
-- catálogo é feita pelo painel do Supabase (service role) por enquanto.

insert into public.produtos (slug, nome, descricao_curta, descricao, preco_centavos, imagem_url, ordem) values
(
  'mbb-basic',
  'MBB Basic',
  '4 aparições mensais (mix de Stories + Colab) — 1 por semana.',
  'Recomendado para negócios que desejam presença contínua no bairro com investimento acessível. Entrega distribuída em 1 Story por semana e 1 Colab por mês.',
  24900,
  '/produtos/mbb-basic.jpeg',
  1
),
(
  'mbb-premium',
  'MBB Premium',
  '8 aparições mensais (Stories + Colabs) — 2 por semana.',
  'Indicado para negócios que desejam presença forte e competitiva no bairro, mantendo lembrança, preferência e referência local. Entrega distribuída em 2 Stories por semana e 1 Colab a cada 15 dias.',
  54900,
  '/produtos/mbb-premium.jpeg',
  2
),
(
  'producao-de-video-reels',
  'Produção de vídeo Reels',
  'Vídeo comercial de até 1 minuto, produzido pela nossa equipe.',
  'Produção de um vídeo comercial de até 1 minuto por conta da equipe Meu Bairro Buritis. Garante 1 post Reels no Instagram, TikTok, Twitter e grupos do Facebook e Telegram. Inclui apresentadora, captação profissional e edição de alta qualidade. Entrega em até 7 dias úteis após a gravação.',
  54900,
  '/produtos/producao-de-video-reels.jpg',
  3
),
(
  'colab-insta',
  'Colab Insta',
  'Você publica o Reels e marca @meubairroburitis como colaborador.',
  'Você posta o seu Reels no seu perfil e marca o @meubairroburitis como colaborador — o vídeo também é exibido para os nossos seguidores.',
  11900,
  '/produtos/colab-insta.jpg',
  4
),
(
  'stories-no-instagram',
  'Stories no Instagram',
  '1 story divulgando sua empresa no nosso perfil.',
  'Divulgação de um post da sua empresa em um story na nossa conta do Instagram, na data e horário definidos por você.',
  4900,
  '/produtos/stories-no-instagram.png',
  5
);
