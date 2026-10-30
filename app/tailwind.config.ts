import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

// Tokens da marca (redesign, fase 1) -- os mesmos do design system do Guia
// Buritis, para o site e o app parecerem da mesma casa. Contrastes
// conferidos em docs/redesign/plano.md (seção 1.4). No código do site, use
// os nomes semânticos (brand, ink, ground, line...).
//
// Plugin de tipografia (classes `prose`): antes vinha do @nuxt/ui, removido
// na fase 4 do redesign.
export default <Partial<Config>>{
  plugins: [typography],
  theme: {
    extend: {
      colors: {
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
