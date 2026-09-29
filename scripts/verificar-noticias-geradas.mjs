// Confere, depois do `npm run generate`, se TODA notícia publicada no banco
// virou página no build (.output/public/noticias/<slug>/index.html).
//
// Por quê: o prerender roda com failOnError:false (nuxt.config.ts), então
// uma página que quebra com 500 durante o build simplesmente não é gerada
// -- sem erro, sem aviso. Em 24/set, 7 matérias publicadas sumiram do site
// assim (link "Leia também" pra um rascunho) e só foram notadas dias depois.
// Este script falha o deploy ANTES do upload, então o site no ar continua
// sendo a release anterior (com as matérias) até alguém corrigir.
//
// Usa a mesma URL/anon key do build -- RLS já só expõe notícia publicada
// pra anon, o filtro por status aqui é só explícito.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const chave = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const pastaBuild = process.argv[2] || '.output/public'

if (!url || !chave) {
  console.error('ERRO: NUXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes -- sem eles o build nem teria gerado as notícias.')
  process.exit(1)
}

const resposta = await fetch(`${url}/rest/v1/noticias?select=slug&status=eq.publicado`, {
  headers: { apikey: chave, Authorization: `Bearer ${chave}` },
})
if (!resposta.ok) {
  console.error(`ERRO: não consegui listar as notícias publicadas (HTTP ${resposta.status}): ${await resposta.text()}`)
  process.exit(1)
}

const publicadas = (await resposta.json()).map((n) => n.slug)
const faltando = publicadas.filter((slug) => !existsSync(join(pastaBuild, 'noticias', slug, 'index.html')))

console.log(`Notícias publicadas no banco: ${publicadas.length} | geradas no build: ${publicadas.length - faltando.length}`)

if (faltando.length) {
  for (const slug of faltando) {
    console.log(`::error title=Notícia publicada não gerada::/noticias/${slug} -- procure por esse caminho no log do "npm run generate" (provável erro 500 no prerender)`)
  }
  console.error(`ERRO: ${faltando.length} notícia(s) publicada(s) ficaram fora do build. Deploy abortado antes do upload -- o site no ar continua com a release anterior.`)
  process.exit(1)
}
