// Imagens do sitemap.xml com o "&" escapado duas vezes (redesign, 09/11/2026).
//
// O @nuxtjs/sitemap (7.6) acha as imagens no HTML das páginas e copia o `src`
// cru, ainda com a entidade: `/_ipx/f_webp&amp;q_70&amp;s_800x533/...`. Na
// hora de escrever o XML ele escapa de novo, e o sitemap sai com `&amp;amp;`.
// Lido pelo Google, o endereço vira `.../f_webp&amp;q_70...`, que não existe
// (404). Na produção antiga as imagens vinham de <picture> e não passavam
// por isso; no redesign, com <img>, eram 3.563 de 4.674 imagens quebradas.
//
// Aqui o `&amp;` volta a ser `&` antes do módulo escapar. Não muda as URLs
// das páginas, só o <image:loc>.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:resolved', (ctx) => {
    for (const url of ctx.urls) {
      if (!Array.isArray(url.images)) continue
      for (const img of url.images) {
        if (typeof img.loc === 'string' && img.loc.includes('&amp;')) img.loc = img.loc.replace(/&amp;/g, '&')
      }
    }
  })
})
