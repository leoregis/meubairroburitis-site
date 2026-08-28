import DOMPurify from 'dompurify'

// mesmo padrão do sanitizeHtml.ts do meubairro-app (DOMPurify com
// allowlist) -- aqui a lista cobre tudo que o AdminTiptapEditor realmente
// suporta (StarterKit + Link + Image), pra sanitizar HTML colado bruto
// (função "Colar HTML") antes de virar conteúdo real do editor. Defesa em
// profundidade: mesmo sendo admin-only, um paste de uma fonte externa não
// deve poder injetar <script>, atributos de evento (onerror etc) ou
// javascript: nos links.
const TAGS_PERMITIDAS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 's', 'strike', 'code',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'ul', 'ol', 'li', 'a', 'img',
]

const ATRIBUTOS_PERMITIDOS = ['href', 'target', 'rel', 'src', 'alt']

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS: TAGS_PERMITIDAS,
    ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
  })
}
