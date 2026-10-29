// Capas que vêm do Storage do Supabase (upload pelo admin) são PNG/JPG
// originais de 1-2 MB. O Storage do projeto do site tem transformação de
// imagem: trocando /object/ por /render/image/ e passando a largura, ele
// devolve WebP (pelo Accept do navegador) já redimensionado -- ex.: uma capa
// de 1,4 MB vira ~56 KB em 800px. Cobrança do Supabase é por imagem ORIGINAL
// transformada no mês; por isso, por enquanto, só a home usa (redesign, fase 2).
//
// Imagem que não é do Storage (local em /public, ou outro domínio) volta
// como veio.

const MARCA_OBJETO = '/storage/v1/object/public/'
const MARCA_RENDER = '/storage/v1/render/image/public/'

export function ehImagemDoStorage(url: string | null | undefined): url is string {
  return !!url && url.includes(MARCA_OBJETO)
}

export function imagemStorage(url: string, largura: number, altura?: number) {
  if (!ehImagemDoStorage(url)) return url
  const params = new URLSearchParams({ width: String(largura), quality: '70' })
  if (altura) {
    params.set('height', String(altura))
    params.set('resize', 'cover')
  }
  return `${url.replace(MARCA_OBJETO, MARCA_RENDER)}?${params}`
}

// srcset com as larguras pedidas, na mesma proporção (altura opcional)
export function srcsetStorage(url: string, larguras: number[], proporcao?: number) {
  if (!ehImagemDoStorage(url)) return undefined
  return larguras
    .map((l) => `${imagemStorage(url, l, proporcao ? Math.round(l / proporcao) : undefined)} ${l}w`)
    .join(', ')
}
