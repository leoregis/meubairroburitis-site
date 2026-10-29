import type { Config } from 'tailwindcss'

// Tokens da marca (redesign, fase 1) -- os mesmos do design system do Guia
// Buritis, para o site e o app parecerem da mesma casa. Contrastes
// conferidos em docs/redesign/plano.md (seção 1.4).
//
// `marca` é a escala 50-950 que o Nuxt UI exige para o `primary` do
// app.config.ts; no código do site use os nomes semânticos abaixo
// (brand, ink, ground, line...), não a escala.
export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        marca: {
          50: '#FDF4F4',
          100: '#FCECEC',
          200: '#F8D2D2',
          300: '#F1AAAA',
          400: '#E66B6B',
          500: '#D92B2B',
          600: '#C42424',
          700: '#A81E1E',
          800: '#8B1C1C',
          900: '#741D1D',
          950: '#3F0A0A',
        },
        brand: {
          DEFAULT: '#D92B2B', // fundo de botão, linha do cabeçalho (branco por cima: 4,85:1)
          ink: '#C42424', // texto e link vermelho sobre branco (5,79:1)
          deep: '#A81E1E', // hover; texto sobre brand-tint (6,39:1)
          tint: '#FCECEC', // só fundo (poço de ícone)
          soft: '#FF9A9A', // rótulo sobre fundo escuro (8,82:1 sobre ink)
        },
        ink: {
          DEFAULT: '#1D1517', // texto principal, rodapé
          muted: '#6F6367', // texto secundário (5,22:1 sobre ground)
          subtle: '#7A6E72', // SÓ sobre branco (4,43:1 sobre ground não passa)
        },
        ground: '#F7F3F3',
        line: '#EBDFE0',
        chip: '#F3EEEE',
        sponsor: '#8A6A14', // rótulo de publicidade (5,06:1 sobre branco)
        star: '#F5A524', // só a estrela da nota, nunca texto
        success: {
          DEFAULT: '#1F8A4C',
          ink: '#1A6E3E',
          tint: '#E8F6EE',
        },
      },
      fontFamily: {
        // fallback com as métricas da Plus Jakarta Sans (ver assets/css/fonte.css)
        sans: ['"Plus Jakarta Sans"', '"Plus Jakarta Sans Fallback"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        'mbb-sm': '11px',
        'mbb-md': '14px',
        'mbb-lg': '16px',
        'mbb-xl': '22px',
      },
      borderWidth: {
        3: '3px',
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
}
