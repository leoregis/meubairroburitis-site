# Redesign do site público: Fase 0 (investigação e plano)

Data: 29/10/2026. Branch: `redesign` (criada de `main` em `ec3b68d`).
Referência visual: protótipo "versão B" (artboards `Editorial.dc.html` e `MobileEditorial.dc.html` do canvas "Novo site Meu Bairro Buritis", com os tokens do design system Guia Buritis).

Escopo: só a camada de apresentação. Login, loja (regras), checkout, pedidos, Supabase, edge functions e `/guia/` ficam como estão. Nenhuma URL pública muda.

Arquivos desta pasta:

- `plano.md`: este documento.
- `seo-baseline.csv`: fotografia do SEO da produção em 29/10/2026, com 1.015 URLs.
- `seo-snapshot.mjs`: script que gera e compara a fotografia (seção 2.3).

---

## 1. Inventário visual

### 1.1 Como o estilo está organizado hoje

| Item | Situação |
|---|---|
| Framework de UI | `@nuxt/ui` 2.22 instalado, mas **nenhum componente `U*` é usado** no site. Ele só traz o Tailwind (`@nuxtjs/tailwindcss`), o plugin de tipografia (`prose`) e os ícones. |
| `app/app.config.ts` | `primary: 'orange'`, `gray: 'stone'`. Como nada usa `primary-*` nem `color="primary"`, a troca não muda nada sozinha. O laranja está escrito direto nas classes. |
| Tailwind | Sem `tailwind.config` próprio e sem CSS global: o `nuxt.config.ts` explica que o `main.css` foi retirado porque duplicava o Tailwind no `<head>`. |
| Fontes | Nenhuma fonte carregada. Os títulos usam `font-serif` (pilha padrão do Tailwind: Georgia/Times, conforme o sistema), 80 ocorrências. O texto usa a sans do sistema. Plus Jakarta Sans não existe no projeto. |
| Ícones | `@nuxt/icon` com `lucide` e `simple-icons` (já instalados). Lucide atende o protótipo. |
| Cores da marca | O vermelho do cabeçalho é `#dd0202`, escrito em `Header.vue` (branco sobre ele dá 5,1:1). O resto do site é laranja (`orange-*`) sobre cinza quente (`stone-*`). |

**Cores escritas no código (fora do admin):**

- `orange-*`: 308 ocorrências em 75 arquivos. Os que mais têm: `o-bairro-buritis.vue` 17, `meus-pedidos.vue` 11, `empresas/[slug].vue` 9, `pedido/Acompanhamento.vue` 9, `carrinho.vue` 7, `quem-somos.vue` 6, `prestadores/[slug].vue` 6, `layout/Footer.vue` 5. O admin soma 37, que ficam como estão.
- `stone-*`: 616 ocorrências. Viram os tokens `ink`, `ink-muted`, `line` e `ground`.
- Hex/rgb: 26 ocorrências em 8 arquivos.
  - `links.vue`: 14. São cores de redes sociais (`#25D366`, `#1877F2`, `#26A5E4`, `#FF0000`, `#4285F4`) e o dourado/vinho da página de bio (`#D4AF37`, `#7A0C14`, `#4A060C`, `#E8C777`).
  - `noticias/[slug].vue`: 4 (`#C2410C`, `#57534E`, `#D6D3D1`, `#44403C`, no CSS do corpo da matéria).
  - `Header.vue`: `#dd0202`.
  - `WhatsappFloat.vue`, `empresas/[slug].vue`, `prestadores/[slug].vue`: verde do WhatsApp `#25D366` / `#20BD5A`.
  - `quem-somos.vue`: 1.
  - `TiptapEditor.vue` (admin): 3.
- `<style>` dentro de componentes: `noticias/[slug].vue` (corpo da matéria), `empresas/[slug].vue`, `o-bairro-buritis.vue`, `ui/Lightbox.vue` e `admin/TiptapEditor.vue`.

As cores de redes sociais e o verde do WhatsApp **ficam** (são marca de terceiros). O dourado/vinho do `/links` é decisão sua (seção 5).

### 1.2 Páginas, layouts e componentes

Layouts: `default` (Header, Footer, WhatsappFloat, ToastCarrinho), `bio` (sem moldura, só o `/links`), `admin` (fora do escopo). O `error.vue` monta Header e Footer por conta própria.

| Página | Componentes | Fase |
|---|---|---|
| `/` (`index.vue`) | Home: HeroConversao, NumerosDestaque, AppDestaque, PacotesComparativo, InstagramEmbed, UltimasNoticias, GuiaLocalDestaque, Depoimentos, TimeSection, MidiakitResumo | 2 |
| `/noticias`, `/noticias/pagina/[n]` | NoticiasAbasSecao, NoticiasListagem (NoticiaCard) | 3 |
| `/noticias/categoria/[id]` | NoticiasNoticiaCard | 3 |
| `/noticias/[slug]` | AvisoPublicitario, SobreEsteConteudo, LeiaTambem, CtaGuiaBuritis, CSS próprio do corpo | 3 |
| `/conteudo` (Guias) | NoticiasAbasSecao, NoticiaCard | 3 |
| `/empresas`, `/empresas/pagina/[n]`, `/empresas/categoria/[c]` (+ paginação) | EmpresasFiltroCategorias, EmpresasListagem (EmpresasCard) | 4 |
| `/empresas/[slug]` | UiLightbox, UiMapaEmbed, CSS próprio | 4 |
| `/prestadores/...` (as mesmas 4 rotas) | PrestadoresFiltroCategorias, PrestadoresListagem (PrestadoresCard) | 4 |
| `/prestadores/[slug]` | sem componentes (tudo na página) | 4 |
| `/loja` (Anuncie) | LojaProdutoCard | 5 |
| `/loja/[slug]` | sem componentes | 5 |
| `/carrinho` | CheckoutFormularioComprador, CheckoutCardPaymentBrick, CheckoutPixQrCode | 5 (só visual) |
| `/meus-pedidos`, `/pedido/[id]` | PedidoAcompanhamento | 5 (só visual) |
| `/midiakit` + `cases`, `dados`, `duvidas`, `formatos` | MidiakitTabs | 5 |
| `/links` | layout `bio`, sem componentes | 5 |
| `/canais` | sem componentes | 6 |
| `/quem-somos` | sem componentes (272 linhas) | 6 |
| `/o-bairro-buritis` | BairroMapaLimites, EmpresasCard, PrestadoresCard, NoticiaCard (685 linhas, CSS próprio) | 6 |
| `/expediente`, `/politica-editorial`, `/correcoes-e-direito-de-resposta`, `/publicidade-e-conteudo-patrocinado` | InstitucionalPagina | 6 |
| `/termos-e-condicoes` | sem componentes | 6 |
| `/pagina-nao-encontrada`, `error.vue` | Header/Footer | 6 |
| `/admin/**` | fora do escopo | não muda |

### 1.3 O que se reaproveita e o que se refaz

**Refazer:**

- `layout/Header.vue`. Passa a ser barra superior (nova `LayoutTopBar`), cabeçalho branco, editorias, busca, botão Guia Buritis e menu do celular. Precisa manter Meus pedidos e o carrinho (seção 5).
- `layout/Footer.vue`. Rodapé escuro com o logo branco e quatro colunas, como no protótipo.
- A home inteira. Componentes novos: `HomeHero` (foto + painel), `HomeManchetes` (grade de revista), `HomeNewsletter`, `HomeGuia` (chips + mais bem avaliados + bloco vermelho do app; nasce do `GuiaLocalDestaque`), `HomePatrocinado` e `HomeParaEmpresas`.
- Base nova e pequena, sem biblioteca: `Eyebrow` (rótulo em caixa alta), `SectionHeader` (título + "Ver tudo" + linha), `Chip`, botões (primário vermelho, escuro e contorno) e `Nota` (estrela + nota + total).

**Reaproveitar** (lógica intacta, troca de classes):

- Empresas e prestadores: `empresas/*`, `prestadores/*`.
- Notícias: `noticias/*`.
- Páginas institucionais: `institucional/Pagina`.
- Loja e midiakit: `midiakit/Tabs`, `loja/ProdutoCard`.
- Interface comum: `ui/Lightbox`, `ui/MapaEmbed`, `bairro/MapaLimites`, `layout/ToastCarrinho`, `layout/WhatsappFloat`.
- Checkout e pedidos (`checkout/*`, `pedido/Acompanhamento`): **só classes, nenhuma linha de `<script>`**.

**Saem da home** (o arquivo continua no repositório até a fase 5; podem ir para `/loja`, `/midiakit` ou `/quem-somos`):

- HeroConversao, NumerosDestaque, AppDestaque, PacotesComparativo, Depoimentos, InstagramEmbed, TimeSection e MidiakitResumo.
- Decisão na seção 5.

### 1.4 Tokens (proposta técnica)

São os tokens do Guia, em `app/tailwind.config.ts` (novo; dentro de `app/` para entrar no hash `MBB_BUILD_ID` do deploy) como cores nomeadas e em `app.config.ts`. O `primary` passa a ser uma paleta `marca`, de 50 a 950, gerada em torno de `#D92B2B`, para o caso de algum componente do Nuxt UI entrar depois.

| Token | Valor | Uso | Contraste conferido |
|---|---|---|---|
| `brand` | `#D92B2B` | fundo de botão, linha do cabeçalho, bloco do app | branco sobre ele: 4,85:1 |
| `brand-ink` | `#C42424` | texto e link vermelho | 5,79 sobre branco; 5,26 sobre `ground` |
| `brand-deep` | `#A81E1E` | hover e texto sobre `brand-tint` | 6,39 sobre `brand-tint` |
| `brand-tint` | `#FCECEC` | poço de ícone | só fundo |
| `brand-soft` | `#FF9A9A` | rótulo sobre fundo escuro | 8,82 sobre `ink` |
| `ink` | `#1D1517` | texto, rodapé, newsletter | 17,9 com branco |
| `ink-muted` | `#6F6367` | texto secundário | 5,74 sobre branco; 5,22 sobre `ground`; 5,00 sobre `neutral-chip` |
| `ink-subtle` | `#7A6E72` | **só sobre branco** | 4,9 sobre branco; **falha** sobre `ground` (4,43) e `neutral-chip` (4,25) |
| `ground` | `#F7F3F3` | barra superior, fundos suaves | |
| `line` | `#EBDFE0` | divisórias e bordas | |
| `neutral-chip` | `#F3EEEE` | espaço reservado de imagem | |
| `sponsor-ink` | `#8A6A14` | rótulo PATROCINADO | 5,06 sobre branco; 4,59 sobre `ground` |
| `star` | `#F5A524` | só a estrela, nunca texto | |
| `success` / `success-ink` | `#1F8A4C` / `#1A6E3E` | "Aberto", WhatsApp | |

- **Fonte:** Plus Jakarta Sans servida pelo próprio site. Nada de Google Fonts em tempo de execução: é mais rápido e não envia o IP do visitante ao Google (LGPD).
  - Na fase 1, os dois `woff2` variáveis (latin e latin-ext, ~49 KB no total) foram copiados do `@fontsource-variable` 5.3.0 para `app/assets/fontes/`, com a licença OFL. Assim **nenhuma dependência nova** entra no `package.json`.
  - O fallback é uma Arial ajustada às métricas da fonte (`size-adjust` 106,89%, calculado da largura média de texto em português), para o texto não pular quando a fonte chega.
- **Ícones:** Lucide, como já é hoje. Nenhum emoji, inclusive nos comentários do código de navegação.

---

## 2. SEO hoje (somente leitura, produção, 29/10/2026)

### 2.1 Pendências de 25/10

Conferi com `curl -I` sem seguir redirects.

| Pendência | Situação |
|---|---|
| Slugs quebrados em `/empresas` | **Resolvido.** `/empresas/-ortisul-43` dá 301 para `/empresas/hortisul-43`, e `/empresas/-ata-das-orboletas--50` dá 301 para `/empresas/mata-das-borboletas-50`. |
| Barra final | **Resolvido.** `/o-bairro-buritis/` e `/canais/` dão 301 para a URL sem barra. Sem barra, as duas respondem 200. |
| `/empresas/alphaville-pizzaria-578` com noindex | **Não resolvido.** Responde 200 com `index, follow`, canonical para si mesma e está no sitemap. O mesmo negócio existe como `/prestadores/alphaville-pizzaria-432`, também `index` e no sitemap, com outro título. |
| `/guia/` fora do sitemap e do robots.txt | **Resolvido.** O sitemap tem 0 URLs `/guia/`: as 6 ocorrências de "guia" são matérias `/noticias/guia-de-...`. O robots.txt não cita `/guia/` nem o sitemap do Guia. |

Achados a mais, para você decidir (dados do Guia, fora do redesign):

- Há outros cadastros duplicados entre empresa e prestador, ou entre dois prestadores, com títulos iguais ou quase:
  - Raquel Bittencourt Odontologia: `/empresas/...-588` e `/prestadores/...-455`.
  - Confiber Telecom: `/prestadores/confiber-telecom-168` e `-482`.
- `/guia/` (a raiz do app) responde 200 **sem** `X-Robots-Tag`, enquanto `/guia/explorar` sai com `noindex, follow`. Se a raiz também devia ser noindex, isso é no `meubairro-app`.

### 2.2 Fotografia de referência (`seo-baseline.csv`)

- **Cobertura:** as 1.011 URLs do `sitemap.xml`, mais `/pagina-nao-encontrada`, `/carrinho`, `/meus-pedidos` e `/robots.txt`, que ficam fora do sitemap mas o redesign também mexe. Total: 1.015.
- **Colunas:** `url`, `status`, `location` (redirect não seguido), `title`, `meta_description`, `canonical`, `meta_robots`, `x_robots_tag`, `jsonld_types` (tipos em ordem, separados por `|`), `h1_count`, `og_title`, `og_image`.

Resumo do que saiu:

- **Status:** 1.015 com 200 e nenhum redirect.
- **Canonical:** em todas as páginas, menos `/carrinho` e `/meus-pedidos`, e sempre igual à própria URL.
- **Robots:**
  - 1.013 páginas com `index, follow, max-image-preview:large…`.
  - `/pagina-nao-encontrada` com `noindex`.
  - `/carrinho` e `/meus-pedidos` com `X-Robots-Tag: noindex, nofollow`.
- **JSON-LD:**

  | Tipo | Páginas |
  |---|---|
  | `BreadcrumbList` + `LocalBusiness` | 507 empresas |
  | `BreadcrumbList` + `Person` | 288 prestadores |
  | `NewsArticle` | 58 |
  | `Article` | 32 |
  | `OpinionNewsArticle` | 8 |
  | `Product` | 6 |
  | `Organization` | 1 (home) |
  | sem JSON-LD | 110 (listagens, paginação, categorias, midiakit, `/canais`, `/conteudo`, `/loja`, `/quem-somos`, `/termos`, `/links`) |

- **h1:**
  - 970 páginas com um só.
  - **42 matérias com dois**: o corpo vindo do WordPress traz um `<h1>` dentro do texto.
  - 3 sem nenhum: `/carrinho`, `/meus-pedidos` (o h1 só aparece no navegador) e `/robots.txt`.

### 2.3 Como repetir e comparar no fim

```
# fotografia da prévia (mesmos caminhos do sitemap da produção, outra origem)
node docs/redesign/seo-snapshot.mjs --base https://<prévia> --saida previa.csv

# fotografia nova da produção, no MESMO dia
node docs/redesign/seo-snapshot.mjs --saida producao-hoje.csv

# compara; sai com erro se title/description/canonical/robots/JSON-LD/status mudarem
node docs/redesign/seo-snapshot.mjs --comparar producao-hoje.csv previa.csv --ignorar meta_robots,x_robots_tag
```

- A comparação de verdade é **prévia contra produção no mesmo dia**. Notícias novas e cadastros editados entre hoje e o fim apareceriam como diferença contra o `seo-baseline.csv`. Esse arquivo fica como registro histórico e para conferir a quantidade de URLs.
- Na prévia, `meta_robots` e `x_robots_tag` mudam de propósito (noindex), por isso o `--ignorar`.
- `h1_count` e `og_image` só geram aviso, porque o h1 das 42 matérias pode ser corrigido de propósito (seção 5).
- Depois da publicação, repito contra a produção sem `--ignorar`. Tem de dar zero diferença, fora o que você tiver aprovado.
- Redirects do `.htaccess` não passam pela prévia, que não usa Apache. Como o `.htaccess` não muda, confiro de novo os 4 redirects da seção 2.1 depois da publicação.

---

## 3. Prévia segura (staging)

### 3.1 O que já existe e por que não serve

O `deploy-staging.yml` publica em `meubairroburitis.com.br/_staging_test/` por FTP, com os bancos de **dev**. Para o redesign ele não serve:

- os dados de dev são fictícios, e a revisão visual precisa das notícias e empresas reais;
- cada envio por FTP leva cerca de 35 minutos;
- ele fica no mesmo servidor da produção.

### 3.2 Proposta: Cloudflare Workers com arquivos estáticos

É o mesmo modelo da Central MBB: um `wrangler.jsonc` com `assets`, publicado por `wrangler deploy`. O domínio já está no Cloudflare (DNS `wanda`/`major.ns.cloudflare.com`) e o `wrangler` 4.146 está logado neste notebook.

| Item | Proposta |
|---|---|
| Nome | Worker `mbb-site-previa` |
| Endereço | `previa.meubairroburitis.com.br` (domínio próprio pelo `wrangler`, como o `central.`). Alternativa sem DNS: `mbb-site-previa.contato-b1a.workers.dev`. |
| Build | `MBB_PREVIA=1 npm run generate` com as mesmas chaves **anon** de produção do `.env` (site e Guia). O site estático só lê. Cerca de 3 minutos. |
| Publicação | `wrangler deploy` com `assets.directory = .output/public`, `html_handling: drop-trailing-slash` (igual ao 301 de barra final da produção) e `not_found_handling: 404-page`. Cerca de 1 a 2 minutos, porque só sobe arquivo novo. |
| Arquivo de configuração | `deploy/previa/wrangler.jsonc`, `_headers` e `_redirects`, fora do `deploy.yml` da produção. O FTP e o `deploy.yml` não são tocados. |
| noindex | (1) `site.indexable = false` com `MBB_PREVIA=1`: meta robots `noindex, nofollow` em toda página e robots.txt `Disallow: /`. (2) `_headers`: `X-Robots-Tag: noindex, nofollow` em `/*`. O canonical continua apontando para a produção, então nem uma cópia vazada compete com o site. |
| `/guia/` na prévia | `_redirects`: `/guia/*` com 302 para a produção. |
| Sem escrita na produção | Ver 3.3. |
| Acesso | Recomendo **Cloudflare Access** no `previa.` com o seu e-mail, como na Central. Sem ele, qualquer um com o link vê a prévia, mesmo com noindex. |

### 3.3 Travas contra escrita a partir da prévia

As edge functions respondem com `Access-Control-Allow-Origin: *`. Uma página da prévia, aberta no navegador, conseguiria então criar pagamento (`criar_pagamento`), mandar código de WhatsApp (`meus_pedidos_codigo`) e gravar clique do `/links` (`links_cliques`). Isso iria contra a regra de nenhum registro de teste em produção.

Proposta, em duas camadas:

1. **No código, com `MBB_PREVIA=1`** (fora da prévia não faz nada):
   - o botão de finalizar do carrinho fica desativado, com o aviso "Prévia: compras desativadas";
   - `/meus-pedidos` não envia código;
   - `/links` não registra clique;
   - `/admin/**` não é gerado.

   Toca no carrinho e no Meus pedidos com um `if` cada, sem mudar a lógica. **Precisa da sua aprovação** (seção 5).
2. **No `_headers` da prévia:** `Content-Security-Policy: connect-src` liberando só `…supabase.co/rest/v1/` dos dois projetos. Assim `functions/v1` (pagamento, código de WhatsApp, deploy) e `auth/v1` ficam bloqueados pelo próprio navegador, mesmo que a trava 1 falhe.

### 3.4 O que eu faço sozinho e o que depende de você

- **Eu:** criar o Worker e a configuração, publicar do notebook pelo `wrangler`, ligar o domínio `previa.` pelo `wrangler` (se a zona aceitar), conferir noindex, CSP e travas, e rodar a fotografia de SEO na prévia.
- **Você, se quiser Access:** no painel Zero Trust → Access → Applications, acrescentar `previa.meubairroburitis.com.br` à mesma política da Central. São uns 2 minutos; o `wrangler` não cria aplicação do Access.
- **Publicar pelo GitHub Actions a cada push na `redesign`, para não depender de uma máquina:**
  - precisa de um token de API do Cloudflare com permissão "Workers Scripts: Edit", que só se cria no painel, e eu cadastro como secret pelo `gh`;
  - sem o token, eu publico do notebook ou do desktop. Recomendo começar assim.
- **Limite a conferir no primeiro build:** o plano grátis de Workers aceita 20.000 arquivos por versão. A estimativa é de 3.000 a 6.000: cerca de 1.015 páginas × (HTML + `_payload.json`), mais `_ipx` e `_nuxt`.

### 3.5 Tempo de build e o primeiro deploy em produção

Medido nos runs do `deploy.yml` de 21/10 a 29/10:

| Modo | Build | Total |
|---|---|---|
| Completo | 2,8 a 3 min de `nuxt generate` + 35 a 37 min de envio por FTP | 33 a 73 min (mediana ~40) |
| Incremental | — | 7 a 10 min |

- O `MBB_BUILD_ID` é o hash de `app/`, `nuxt.config.ts` e `package*.json`. Qualquer mudança de código, inclusive a primeira do redesign, força o **build completo**: todo o site é reenviado (~40 a 75 min) antes da troca `_current`. Durante o envio o site antigo continua no ar e a troca é atômica.
- Cada push de código na `main` também força o completo. Por isso o redesign entra na `main` **de uma vez só**, no fim (fase 7), e não fase por fase. Ver decisão na seção 5.
- **Atenção à fila** (memória "fila do deploy cancela pendentes"): o merge deve acontecer fora do horário do deploy agendado e sem publicação de notícia pelo admin em andamento. Um deploy que espera é cancelado pelo seguinte.

---

## 4. Plano de fases

Mantive a ordem pedida, com três ajustes:

- A **prévia entra na fase 1**, antes de qualquer tela, junto com as travas da seção 3.3.
- **Analytics**: proposta na seção 5. Se aprovado, entra **na produção atual já na fase 1**, para medir a conversão antes da troca.
- O **corpo das matérias** (fase 3) recebe atenção especial: é o HTML que veio do WordPress.

Regras para todas as fases:

- Trabalho na branch `redesign`. A cada fase, publico a prévia e trago a fotografia de SEO da prévia comparada com a produção (zero diferença em `title`, `description`, `canonical` e `JSON-LD`).
- Faço merge da `main` na `redesign` toda semana, para não acumular conflito.
- Nenhum `<script>` de checkout, pedido ou login muda. Só `<template>` e classes.

### Fase 1: tokens, tema, Header/Footer, layout base e prévia no ar

- **Arquivos:**
  - novos: `app/tailwind.config.ts` (tokens), `assets/css/fonte.css` (só `@font-face`, sem `@tailwind`) e `assets/fontes/*`;
  - alterados: `app.config.ts`, `nuxt.config.ts` (fonte, `configPath` do Tailwind, flag `MBB_PREVIA`), `layouts/default.vue`, `error.vue`, `constants/navegacao.ts`;
  - componentes: `components/layout/Header.vue` e `Footer.vue`, mais os novos `TopBar.vue` e `MenuCelular.vue`, e a base (`Eyebrow`, `SectionHeader`, `Chip`, `Botao`, `Nota`);
  - prévia: `deploy/previa/*`, mais as travas de 3.3 em `carrinho.vue`, `meus-pedidos.vue` e `links.vue`.
- **Detalhes:**
  - A data da barra superior é montada **no navegador** (`onMounted`). O site é estático: renderizada no build, mostraria o dia do último deploy.
  - O menu precisa continuar levando a `/empresas` e `/prestadores` em toda página, porque são 800 páginas que dependem desse link interno (seção 5).
  - Todos os links que hoje estão no menu principal e saírem dele vão para o rodapé: Quem Somos, Midiakit e Canais. Algumas páginas só são descobertas pelo rastreador do `prerender` por esses links.
- **Riscos:**
  - Uma página deixar de ser gerada por perda de link. Controle: contar as rotas do build da prévia contra o sitemap.
  - CLS da fonte. Controle: `font-display: swap` com fallback ajustado.
  - O cabeçalho muda em todas as páginas antigas antes de elas serem refeitas. Na prévia é aceitável, porque nada vai à produção antes da fase 7.
- **Aceite:**
  - prévia no ar com noindex (meta, header e robots) e travas conferidas (o navegador bloqueia `functions/v1`);
  - comparação de SEO sem diferença;
  - Header/Footer em 360, 390, 768, 1280 e 1440 sem rolagem horizontal;
  - contraste ≥ 4,5:1;
  - foco visível no teclado;
  - menu do celular fecha com Esc;
  - "Anuncie" visível no celular (ver 4.2).
- **Como você revisa:** abre `previa.meubairroburitis.com.br` no computador e no celular, navega por 5 ou 6 páginas quaisquer e confere cabeçalho, rodapé, menu do celular, "Anuncie" e "Meus pedidos".

### Fase 2: home

- **Arquivos:** `pages/index.vue` e os novos `components/home/*` (Hero, Manchetes, Newsletter, Guia, Patrocinado, ParaEmpresas). `useEmpresasPrestadoresListagem.ts` só ganha a contagem total, se ainda não existir.
- **Conteúdo real:**
  - manchete e lista de matérias saem de `useNoticias` (a mais recente com capa vira manchete);
  - os mais bem avaliados saem de `useEmpresasDestaqueHome`/`usePrestadoresDestaqueHome`, que já ordenam por avaliações e nota;
  - as contagens de empresas e prestadores são calculadas no build;
  - foto do hero: `hero/capa-buritis.jpg` com o crédito "Foto: Léo Orrico", em `NuxtPicture` com `fetchpriority=high` (LCP).
- **Riscos:**
  - **conversão do anunciante** (seção 5): hoje o funil está no topo;
  - os blocos de newsletter, busca e banner dependem das suas decisões; sem elas, entram na versão recomendada.
- **Aceite:**
  - `title`, `description`, `og:*` e JSON-LD da home iguais ao baseline, **salvo o que você aprovar**;
  - LCP da prévia no celular ≤ o da produção atual;
  - um único bloco vermelho na página;
  - "PATROCINADO" (ou "Espaço publicitário") em `sponsor-ink`.
- **Revisão:** home lado a lado com o protótipo, no computador e no celular.

### Fase 3: notícias

- **Arquivos:**
  - páginas: `pages/noticias/index.vue`, `pagina/[numero].vue`, `categoria/[id].vue`, `[slug].vue` e `pages/conteudo/index.vue`;
  - componentes: `components/noticias/*`;
  - o CSS do corpo da matéria em `[slug].vue`.
- **Detalhes:**
  - listagem em grade de revista (destaque + lista com linhas);
  - na matéria, coluna de leitura de 680 a 720 px, tipografia `prose` com os tokens, legenda e crédito de foto, data, categoria, "Leia também" e aviso publicitário mantido.
- **Riscos:**
  - O HTML que veio do WordPress tem `h1`, imagens com largura fixa, tabelas e embeds. Conferir as 99 matérias por amostragem; a lista das 42 com `h1` duplo está no CSV.
  - O JSON-LD `NewsArticle`/`Article`/`OpinionNewsArticle` não pode mudar.
- **Aceite:**
  - comparação de SEO sem diferença nas 125 URLs de `/noticias`;
  - nenhuma matéria com rolagem horizontal em 360 px;
  - imagens com `alt`.
- **Revisão:** 1 matéria de cada tipo (notícia, guia, opinião, com galeria e com embed), 1 categoria e a página 2.

### Fase 4: empresas e prestadores (atenção redobrada ao SEO)

- **Arquivos:** `pages/empresas/**`, `pages/prestadores/**`, `components/empresas/*`, `components/prestadores/*` e `utils/seoDiretorio.ts` (**só leitura, não muda**).
- **Riscos:**
  - São 797 páginas de detalhe e 74 de listagem, com `LocalBusiness`/`Person` + `BreadcrumbList`. Qualquer troca de componente que mexa em `useHead`/`useJsonLd` muda o SEO de centenas de páginas.
  - O `scripts/checar-registros-teste.mjs` continua barrando "teste" nos títulos.
- **Aceite:**
  - comparação de SEO **sem nenhuma diferença** nas 871 URLs;
  - o breadcrumb visível bate com o `BreadcrumbList`;
  - o botão do WhatsApp continua com o verde oficial;
  - a nota e o total de avaliações aparecem como hoje.
- **Revisão:** 3 empresas (com e sem foto, com mapa), 3 prestadores, 1 categoria de cada, a página 2 de cada listagem e o celular.

### Fase 5: Anuncie (`/loja`), produto, carrinho/checkout (só visual), midiakit e `/links`

- **Plano Imobiliário** (decidido pelo Leo em 29/10/2026). Entra na página Anuncie como **cartão sem checkout**, com botão de WhatsApp.
  - Preço: **R$ 500/mês**.
  - Contrato cobrado pelo Asaas, fora do carrinho do site.
  - Inclui anúncios de imóveis pré-aprovados no grupo do Facebook para os corretores indicados, sem limite de corretores nem de publicações.
  - **Não inclui** outros canais.
  - O texto do cartão deixa claro o que entra e o que não entra.
  - Não é produto da tabela `produtos`: nada muda no banco nem no checkout.

- **Arquivos:**
  - `pages/loja/*`, `components/loja/ProdutoCard.vue`;
  - `pages/carrinho.vue`, `components/checkout/*`, `pages/meus-pedidos.vue`, `pages/pedido/[id].vue`, `components/pedido/Acompanhamento.vue` (**só template**);
  - `pages/midiakit/*`, `components/midiakit/Tabs.vue`, `pages/links.vue`.
- **Detalhes:** o protótipo já tem a página `Anuncie.dc.html`, que serve de guia para a `/loja`. Números, depoimentos e comparativo de pacotes que saírem da home vêm para cá.
- **Riscos:**
  - Quebrar o checkout. Controle: diff limitado a `<template>`/classes, conferido por mim (nenhuma linha em `<script>`).
  - Teste de compra de ponta a ponta só no staging de dev (`deploy-staging.yml`, bancos de dev), **nunca** em produção.
  - O Card Payment Brick do Mercado Pago tem estilo próprio, que só se ajusta pela API de customização dele.
- **Aceite:**
  - compra completa (Pix e cartão de teste) no staging de dev;
  - `/meus-pedidos` e `/pedido/[id]` renderizam no dev;
  - SEO sem diferença em `/loja`, `/loja/*` e `/midiakit/*`.
- **Revisão:** `/loja` e um produto na prévia; o fluxo de compra no staging de dev (link que eu mando).

### Fase 6: institucionais

- **Arquivos:**
  - `pages/quem-somos.vue`, `o-bairro-buritis.vue`, `expediente.vue`, `politica-editorial.vue`, `correcoes-e-direito-de-resposta.vue`, `publicidade-e-conteudo-patrocinado.vue`, `termos-e-condicoes.vue`, `canais.vue`, `pagina-nao-encontrada.vue` e `error.vue`;
  - componentes: `components/institucional/Pagina.vue` e `bairro/MapaLimites.vue`.
- **Riscos:**
  - O `/o-bairro-buritis` é a maior página (685 linhas) e tem mapa próprio.
  - O 404 real vem do `ErrorDocument` do `.htaccess`, que não muda: só o visual.
- **Aceite:** SEO sem diferença; o 404 com o novo visual e ainda com `noindex`.

### Fase 7: QA final e publicação

1. Fotografia da produção e da prévia no mesmo dia, comparadas: zero diferença fora o que você aprovou.
2. Lighthouse (performance, acessibilidade, boas práticas, SEO), no celular e no computador, em 6 páginas: home, uma matéria, `/noticias`, uma empresa, `/empresas`, `/loja`. Comparar com as mesmas 6 medidas na produção atual, que **tiro na fase 1** para ter o "antes".
3. Larguras de 360, 390, 768, 1280 e 1440 nas mesmas páginas, com captura de tela para você.
4. Navegação só por teclado e leitor de tela básico (rótulos, ordem de foco e `alt`).
5. Merge `redesign` → `main` (sua aprovação explícita), em horário sem deploy agendado. Build completo de ~40 a 75 min.
6. Depois da troca, conferir:
   - `_build.txt`;
   - a fotografia da produção contra a da véspera;
   - os 4 redirects de 2.1;
   - robots.txt;
   - sitemap com o mesmo número de URLs;
   - uma compra real **não** é feita: o checkout não muda de lógica.
7. Desligar a prévia (ou mantê-la para os próximos trabalhos, você decide) e apagar o domínio `previa.` se não for ficar.

**Janela de publicação** (decisão 17):

- **Fora da semana de 01/12**, abertura da votação dos Melhores do Ano. Nem de 30/11 a 06/12.
- Fora do horário do deploy agendado do `deploy.yml` (conferir o `cron` no dia) e sem publicação de notícia em andamento.
- Dia útil de manhã, com o Leo disponível para olhar o site logo depois da troca.

**Rollback:**

- O swap guarda a release anterior como `_old_<timestamp>`.
- O `restaurar-emergencial.yml`, com o nome dessa pasta, devolve o site antigo em minutos, sem rebuild.
- Notícias publicadas depois da troca somem até um build completo. Esse build precisa sair da `main` revertida, para não recolocar o código novo.

---

## 5. Decisões que dependem de você

| # | Decisão | Minha recomendação |
|---|---|---|
| 1 | **Title e description da home.** Hoje: "Meu Bairro Buritis — Anuncie no Buritis e Estoril" e "…Anuncie sua empresa com quem realmente vive o bairro." | Trocar, porque a home passa a ser editorial e a intenção "anunciar" já tem a `/loja` ("Anuncie no Meu Bairro Buritis — Pacotes de anúncio"). Proposta de title: **"Meu Bairro Buritis — Notícias e guia do Buritis e Estoril"** (57 caracteres). Description: **"Notícias, empresas e serviços do Buritis e do Estoril, em BH, desde 2012. A maior comunidade do bairro: 150 mil+ no Facebook e 55 mil+ no Instagram."** O `og:title` acompanha. Risco: a home pode perder posição em buscas como "anunciar no Buritis" por algumas semanas. A `/loja` deve absorver. |
| 2 | **JSON-LD da home** | Manter o `Organization` e acrescentar `WebSite` (sem `SearchAction` enquanto não houver busca). Mudança aditiva. |
| 3 | **h1 duplicado nas 42 matérias** | Corrigir na renderização: o `h1` dentro do corpo vira `h2`. Muda o HTML, mas não title/meta/JSON-LD. |
| 4 | **Menu: editorias × categorias que existem** | O protótipo tem Segurança, Trânsito, Comércio, Pessoas e Eventos. As categorias reais são `seguranca`, `mobilidade-urbanismo`, `comercio-negocios`, `pessoas-comunidade` e `esportes-eventos`. Recomendo os rótulos curtos levando a essas URLs, com **"Mobilidade" no lugar de "Trânsito"** (a categoria cobre urbanismo também). "Últimas" leva a `/noticias` e "O Bairro" a `/o-bairro-buritis`. |
| 5 | **Empresas e Prestadores no cabeçalho** | O protótipo não tem link para `/empresas` e `/prestadores`. São 800 páginas que hoje recebem link de toda página pelo menu. Recomendo manter **"Empresas" e "Prestadores"** no menu, depois das editorias. Sem isso, o diretório perde força no Google. |
| 6 | **Destino do botão vermelho "Guia Buritis"** | Levar ao app (`/guia/`), como hoje, na mesma aba no celular e em nova aba no computador. O diretório público fica coberto pela decisão 5. |
| 7 | **Carrinho e "Meus pedidos" no cabeçalho** | O protótipo tem "Meus pedidos" só na barra superior e não tem carrinho. Recomendo: "Meus pedidos" na barra superior (computador) e no menu do celular; ícone do carrinho no cabeçalho **só quando houver item**. |
| 8 | **"Anuncie" no celular** | No protótipo do celular não há barra superior, então "Anuncie" só aparece no bloco "Para empresas", lá embaixo. Recomendo um link "Anuncie" visível no cabeçalho do celular, ao lado da busca, ou como primeiro item do menu, em vermelho. |
| 9 | **Busca** (hero e botão do cabeçalho) | Hoje não existe busca. Recomendo uma busca **no navegador, sobre um índice gerado no build**: títulos e resumos das ~100 matérias e nomes/categorias de empresas e prestadores, poucos KB. Fica numa página nova `/busca` com `noindex`. **É URL nova** (nenhuma muda), precisa do seu ok. Sem ela, o hero sai sem o campo e o botão de busca some. |
| 10 | **Newsletter** | Ainda não existe, e não há onde guardar e-mails nem como enviar. Para existir é preciso: tabela no Supabase do site com consentimento (texto aceito, data, IP), confirmação por e-mail (duplo opt-in), descadastro em um clique e uma ferramenta de envio com domínio autenticado (SPF/DKIM): Brevo (grátis até 300 e-mails/dia) ou Resend. Recomendo **não lançar com o redesign**: o bloco escuro vira **"Receba as notícias no WhatsApp e no Instagram"**, levando a `/canais`, e a newsletter vira um projeto à parte. |
| 11 | **Banner patrocinado** | Não há sistema de banners. Recomendo o espaço com a peça da casa: "Seu anúncio aqui", levando à `/loja`, com o rótulo **"ESPAÇO PUBLICITÁRIO"** (não "PATROCINADO", que seria falso). Quando houver venda, vira "PATROCINADO" com a peça do cliente, por arquivo no build. |
| 12 | **Instagram embed e depoimentos na home** | Tirar os dois da home. Os **depoimentos** e o **comparativo de pacotes** vão para a `/loja` (onde o anunciante decide). O **Instagram** fica no `/canais`. **Números** (150 mil+ / 55 mil+) ficam no bloco "Para empresas" da home, como no protótipo. **Time** fica em `/quem-somos`. |
| 13 | **WhatsApp flutuante** | Manter em todas as páginas (é canal de venda), com o visual novo e sem cobrir conteúdo no celular. O protótipo não mostra, mas tirar reduz contato. |
| 14 | **Medir a conversão** | O site **não tem nenhum analytics**. Sem número, não dá para saber se a nova home vende menos. Recomendo **Cloudflare Web Analytics**: grátis, sem cookie, sem banner de LGPD e ativado no próprio Cloudflare. Ligar **já na produção atual**, na fase 1, para ter 3 ou 4 semanas de "antes". Mede visitas à `/loja`, a `/loja/*` e ao `/carrinho`. Cliques no WhatsApp não aparecem; para eles, um contador próprio seria outro projeto. |
| 15 | **Travas da prévia no carrinho, Meus pedidos e `/links`** (3.3) | Aprovar. É um `if` com `MBB_PREVIA` em cada página, sem efeito na produção. |
| 16 | **Cloudflare Access na prévia** | Sim (2 minutos no painel, por você). Sem Access, a prévia fica pública com noindex. |
| 17 | **Publicar de uma vez ou por partes** | De uma vez, no fim (fase 7). Cada push de código força o build completo de 40 a 75 min, e um cabeçalho novo com páginas internas antigas fica incoerente. |
| 18 | **Melhores do Ano** | Preciso do destino do atalho (página no Guia?) e se o texto "Indicações abertas · votação a partir de 1º/12" está certo. |
| 19 | **Página `/links` (bio)** | Hoje é dourado/vinho, um visual à parte. Recomendo passar para a marca (fundo `ink`, botões vermelho/branco) e manter só as cores de cada rede nos ícones. |
| 20 | **Cadastros duplicados** (alphaville, Raquel Bittencourt, Confiber) | Fora do redesign. Recomendo resolver no Guia: desativar o cadastro duplicado, com o 301 que o fluxo atual já gera. Não por noindex no site. |

### Respostas do Leo (29/10/2026)

As 20 recomendações foram aprovadas, com estes ajustes:

- **6:** `/guia/` na mesma aba no celular e em nova aba no computador. No código, o botão do cabeçalho do computador abre em nova aba e o item do menu do celular abre na mesma.
- **8:** "Anuncie" em vermelho no cabeçalho do celular. Cabe em 360 px ao lado do botão do menu e do carrinho, conferido na prévia. Também aparece no menu do celular e no bloco "Para empresas".
- **9:** `/busca` entra na fase 2 com a home. Se atrasar a home, a home sai sem o campo e a busca entra depois. **Na fase 1 o cabeçalho ainda não tem o botão de busca**, porque a página não existe.
- **10:** Newsletter fora do redesign. É o **próximo projeto depois do redesign** (seção 7).
- **14:** Cloudflare Web Analytics na produção atual já na fase 1. O login do `wrangler` não tem a permissão de Web Analytics (a API respondeu "Authentication error"), então a ativação é um clique do Leo no painel.
- **16:** Sem Cloudflare Access. A prévia fica aberta, com noindex, canonical para a produção, CSP e travas.
- **17:** Publicação de uma vez, com a janela e o rollback descritos na fase 7.
- **18, Melhores do Ano:**
  - destino `/guia/melhores-do-ano`;
  - o texto muda pela data, calculada **no navegador** a partir de uma constante com as datas, em `app/constants/melhores-do-ano.ts` (nasce na fase 2, com a home):
    - antes de 01/12: "Indicações abertas · votação dos finalistas a partir de 1º/12";
    - de 01/12 até o fim da votação: "Votação aberta";
    - depois do fim: o atalho some.
  - O HTML do build sai sem o atalho e ele aparece depois de montar a página, para não mostrar texto vencido no HTML estático.
  - **Falta a data de fim da votação.** Enquanto ela não estiver na constante, depois de 01/12 o atalho mostra "Votação aberta" sem prazo.
- **20:** Cadastros duplicados como **pendência do Guia** (seção 7).

### Pontos em que o redesign pode reduzir a conversão

1. **O funil sai do topo da home.** Quem chega à home para anunciar vê notícias primeiro. Mitigação: "Anuncie" fixo na barra superior, o bloco "Para empresas" com números e preço e o espaço publicitário levando à `/loja`. Medida: decisão 14.
2. **"Anuncie" some do celular** no protótipo. A maior parte do acesso é pelo celular. Mitigação: decisão 8.
3. **O comparativo de pacotes e os depoimentos saem da home.** Mitigação: vão para a `/loja`, e o bloco "Para empresas" leva direto a ela.
4. **O botão de WhatsApp do hero atual** ("fale com a gente") some. Mitigação: o WhatsApp flutuante continua (decisão 13).
5. **A mudança no title da home** pode reduzir tráfego de busca para "anunciar" por algumas semanas (decisão 1).

---

## 7. Depois do redesign e pendências fora dele

- **Próximo projeto: newsletter** (decisão 10). Precisa de:
  - tabela de inscrições no Supabase do site, com o consentimento registrado (texto aceito, data, origem);
  - duplo opt-in e descadastro em um clique;
  - ferramenta de envio com domínio autenticado (SPF/DKIM): Brevo ou Resend;
  - política de privacidade atualizada, no `meubairro-app`.

  Quando existir, o bloco escuro da home volta a ser o da newsletter.
- **Projeto depois do redesign: cobrança recorrente automática dos planos MBB Basic e MBB Premium** (pedido do Leo em 30/10/2026). Hoje os dois são vendidos no carrinho como compra avulsa: cada mês é um pedido novo, pago com Pix ou cartão. Avaliar:
  - **Mercado Pago Preapproval** (assinaturas), já usado no Guia: mesmo provedor do checkout do site, cartão salvo pelo próprio Mercado Pago e cobrança mensal automática;
  - **Asaas**, já usado nos contratos das imobiliárias (Plano Imobiliário): boleto, Pix e cartão recorrentes, nota fiscal e régua de cobrança.
  - A decidir: provedor, o que acontece quando a cobrança falha (pausa das publicações, aviso), cancelamento pelo cliente, e como a assinatura aparece na Central e em Meus pedidos.
  - Até lá, a página Anuncie não fala em "cobrança automática" (texto do protótipo retirado na fase 5).
- **Permissões (GRANT) do site: resolvido em 30/10/2026** (migration `20261030200000_permissoes_documentadas`, aprovada pelo Leo).
  - **Causa:** projetos e branches novos do Supabase vêm com permissões padrão mais restritas. Tabela nova criada por `postgres` dá a `anon`/`authenticated`/`service_role` só `Dxtm` (sem SELECT/INSERT/UPDATE/DELETE); sequência e função novas, nada. A produção, mais antiga, ainda tem o padrão antigo (tudo), e as migrations contavam com ele.
  - **O que a migration faz:** declara o estado exato das ACLs dos 69 objetos do `public` (tabelas, sequências e funções) para `anon`, `authenticated`, `service_role` e PUBLIC. É idempotente e pula objeto ausente.
  - **Conferido:** na produção, as ACLs ficaram idênticas antes e depois (teste com ROLLBACK e de novo na aplicação; fotografia no arquivo de volta). Num branch criado só das migrations (`dev-permissoes`, apagado), as 69 ACLs ficaram iguais às da produção, e a chave anon lê `noticias` e `produtos` sem cópia manual.
  - **Regra para a frente:** tabela, sequência ou função nova precisa dos próprios GRANTs na migration que a cria. O padrão do projeto não cobre mais um branch novo.
- **Guia (`xtmwatregednbuupfdbl`): mesma divergência, maior** (diagnóstico de 30/10/2026, nada criado). Fica para uma sessão no `meubairro-app`, se o Leo quiser.
  - **Esquema:** a produção tem 228 tabelas, 119 views e 3 views materializadas no `public`, mas as migrations só criam ~49 tabelas. Boa parte do esquema não está em migration.
  - **Permissões:** `anon` lê 329 relações e executa 650 funções. As migrations têm GRANT explícito para ~10 tabelas e `grant execute` para 89 funções; o resto depende do padrão antigo de permissões.
  - **Histórico:** 18 das 279 migrations estão sem o SQL salvo (`statements` vazio).
  - **Consequência:** um branch do Guia criado das migrations não reproduziria nem o esquema nem as permissões. A Central já usa um projeto de dev próprio por isso.
- **Pendência do Guia: cadastros duplicados** (decisão 20). Resolver no `meubairro-app`, desativando o duplicado (o fluxo atual já gera o 301), e não com noindex no site:
  - Alphaville Pizzaria: `/empresas/alphaville-pizzaria-578` e `/prestadores/alphaville-pizzaria-432`;
  - Raquel Bittencourt Odontologia: `/empresas/...-588` e `/prestadores/...-455`;
  - Confiber Telecom: `/prestadores/confiber-telecom-168` e `-482`.
- **DECISÃO DE PRODUTO DO GUIA (`meubairro-app`): moderação de avaliações de empresas** (registrada em 29/10/2026, revista pelo Leo em 29/10).
  - **Não é vazamento de moderação:** a tabela `empresas_avaliacoes` **nunca teve** moderação. Os prestadores têm (`avaliacoes.aprovado`).
  - A decisão a tomar é **criar moderação para as avaliações de empresas**. Fica para uma sessão separada no Guia, fora do redesign.
  - O levantamento abaixo mostra onde a nota é calculada hoje e o que mudaria.
  - **Evidência:**
    - A tabela `empresas_avaliacoes` (projeto do Guia, `xtmwatregednbuupfdbl`) **não tem coluna de moderação**. As colunas são `id`, `empresa_unidade_id`, `cliente_id`, `prestador_id`, `nota`, `comentario`, `criado_em`.
    - Já a `avaliacoes`, dos prestadores, tem `aprovado`: 132 de 136 aprovadas.
    - Em 29/10 havia **19 avaliações de empresa**, de 10/06 a 24/09/2026, 13 com comentário, valendo para **14 empresas ativas**. Todas entram na nota pública.
  - **Onde a nota é calculada sem filtro:**
    - **Listagem (`/empresas`, categorias, paginação, home):** view `public.vw_empresas_publico_listagem`. As colunas `nota_media` (`avg(ea.nota)::numeric(10,2)`) e `total_avaliacoes` (`count(*)`) vêm de uma subconsulta em `empresas_avaliacoes` agrupada por `empresa_id`, sem filtro. A view dos prestadores (`vw_prestadores_publico_listagem`) filtra `a.aprovado = true`.
    - **Detalhe (`/empresas/[slug]`):** RPC `public.buscar_empresa_publica_seo(p_slug)`. A CTE `avaliacoes_resumo` faz `avg(ea.nota)` e `count(*)` em `empresas_avaliacoes`, também sem filtro, e devolve `nota_media` e `total_avaliacoes`. A RPC dos prestadores (`buscar_prestador_publico_seo`) filtra `a.aprovado = true`.
    - **JSON-LD (`aggregateRating`):** sim, o mesmo valor. Em `app/pages/empresas/[slug].vue` (linhas 92-93), `aggregateRating: { ratingValue: empresa.nota_media, reviewCount: empresa.total_avaliacoes }` usa o retorno da RPC. A nota sem moderação vai para o Google.
    - **Meta description:** `utils/seoDiretorio.ts` (linha 153) acrescenta "avaliações" à description quando `total_avaliacoes > 0`.
  - **No site, o que depende disso:** o card de empresa (`EmpresasCard`), a página de detalhe e o JSON-LD. A home nova (fase 2) mostra só prestadores em "Mais bem avaliados" por causa disso.
- **Pendência do Guia: `/guia/` sem noindex.** A raiz do app responde sem `X-Robots-Tag`, enquanto `/guia/explorar` sai com `noindex, follow`. Conferir no `meubairro-app` se é proposital.
- **CSP do `/guia/`:** com o Web Analytics ligado, o beacon envia para `cloudflareinsights.com`, que não está no `connect-src` da CSP *report-only* do app. Nada é bloqueado (é só relatório), mas o endpoint `csp_report` vai receber esses avisos. Acrescentar `https://cloudflareinsights.com` no `connect-src` do `meubairro-app`.

---

## 8. Andamento

| Fase | Situação |
|---|---|
| 0: investigação e plano | Feita em 29/10/2026 (`2c8cd4c`) |
| 1: tokens, layout base, prévia, analytics | Feita em 29/10/2026. Prévia em `https://previa.meubairroburitis.com.br`, publicada por `node deploy/previa/publicar.mjs`. Web Analytics ligado pelo Leo em 29/10. O beacon aparece no site e no `/guia/` (injetado só em pedidos de HTML) e não gera aviso na CSP do Guia. |
| 2: home + busca | Feita em 29/10/2026 (notas abaixo) |
| 3: notícias | Feita em 29/10/2026 (notas abaixo) |
| 4: empresas e prestadores (+ remoção do @nuxt/ui, CSS externo, crédito de foto) | Feita em 30/10/2026 (notas abaixo) |
| 5: Anuncie, produto, carrinho/checkout (visual), midiakit e `/links` | Feita em 30/10/2026 (notas abaixo). Item 1 (clientes do Supabase sob demanda) feito em 30/10, testado ponta a ponta; 3 páginas ainda acima da produção no LCP simulado (ver `lighthouse-antes.md`) |
| 6: institucionais | Não iniciada: espera a decisão do Leo sobre o critério de LCP |

Notas da fase 1:

- **Cabeçalho:** a versão de computador (barra superior, botão Guia Buritis, editorias numa linha) entra a partir de **1024 px** (`lg`). Abaixo disso fica o cabeçalho do celular, com as editorias rolando na horizontal. Em 768 px as 9 editorias quebravam em duas linhas.
- **Ícones:** `icon.clientBundle.scan` põe no JS os ícones usados nos componentes. Antes, um ícone que só aparece no navegador (o X do menu) vinha da API do Iconify em tempo de execução e chegava tarde.
- **Build da prévia no Windows:** os `og:image` 1200×630 das matérias com capa no Storage dão `ENOENT` no log (o IPX tenta criar uma pasta `https:`). Não afeta nada: o `og:image` aponta para a produção, e o build da produção roda no Linux.
- **Barra final na prévia:** `/canais/` responde 307 (padrão do Cloudflare). Na produção continua 301 pelo `.htaccess`, que não mudou.
- **Lighthouse "antes":** em `lighthouse-antes.md`.

Notas da fase 2 (home + busca), 29/10/2026:

- **Home:** `pages/index.vue` + `components/home/{Hero,Ultimas,AtalhoMelhoresDoAno,Canais,Guia,EspacoPublicitario,ParaEmpresas}.vue`. Title, description, og e JSON-LD (`Organization` + `WebSite` num `@graph`) conforme as decisões 1 e 2.
- **Hero:** `srcset` montado com `useImage()` (480 a 1200 px; o original tem 1200×800), `fetchpriority="high"`, preload com `imagesrcset` e dimensões declaradas. O `sizes` do `<NuxtImg>` não aceita "150vw" e ampliava a foto até 2400 px.
- **Fonte:** preload só do woff2 latin, que é variável (todos os pesos num arquivo de ~27 KB).
- **Capas de notícia na home:** saem pela transformação de imagem do Storage do Supabase (`utils/imagemStorage.ts`). Uma capa de 1,4 MB vira ~56 KB.
  - **Decisão pendente:** o Supabase cobra por imagem *original* transformada no mês. Estender isso às listagens e matérias (fase 3) cobre ~100 capas e entra na cota do plano. É decisão do Leo antes da fase 3.
- **Busca:** página `/busca` (`pages/busca.vue`, `utils/busca.ts`, `composables/useIndiceBusca.ts`).
  - O índice vai no `_payload.json` da página, montado no build: 81 KB, ~35 KB comprimido.
  - A busca roda no navegador, sem chamar o Supabase, e normaliza acentos e maiúsculas.
  - `robots: false` no `routeRules`: tem `noindex` e fica fora do sitemap (conferido num build de produção local: 1.012 URLs, nenhuma `/busca`).
  - No build incremental, `rotas-afetadas.mjs` regera a `/busca` sempre que regera a home.
- **Melhores do Ano:** `app/constants/melhores-do-ano.ts` (datas com -03:00, avaliadas no navegador). O espaço do atalho fica reservado no build até o fim da votação, sem salto de layout.
- **Conteúdo que saiu da home:**
  - comparativo de pacotes e depoimentos foram para a `/loja`;
  - o Instagram foi para `/canais`;
  - o time foi para `/quem-somos`.

  Todos ainda com o visual antigo, até as fases 5 e 6.
- **Texto do protótipo corrigido:** o bloco "Para empresas" não fala em "plano para imobiliárias", porque esse produto não existe na loja.

Notas da fase 3 (notícias), 29/10/2026:

- **Capas pelo IPX no build** (pedido do Leo: nada da transformação paga do Supabase).
  - `image.alias.capas` no `nuxt.config.ts` aponta para o Storage do site. O IPX gera 480, 800 e 1200 px em WebP, na proporção 1200×630, como arquivos estáticos em `_ipx/.../capas/...` (`composables/useCapaNoticia.ts`). Com o apelido, o caminho não tem `https:` e funciona também no Windows.
  - O `og:image` continua com a URL de sempre (conferido: zero diferença).
  - A home também passou a usar o IPX, e `utils/imagemStorage.ts` saiu.
  - **Custo no build:** +279 arquivos (93 capas do Storage × 3) e +8,7 MB. A prévia tem 3.265 arquivos, de um limite de 20.000.
  - **Estimativa no FTP da produção:** o envio completo leva ~35 min para ~3.200 arquivos (~0,65 s por arquivo); os +279 arquivos somam **~3 min** a cada build completo. No incremental, cada notícia nova acrescenta 3 imagens (~60 a 100 KB).
- **Listagens:**
  - `/noticias` abre com a matéria em destaque (`NoticiasDestaque`, LCP com preload) e segue com a grade (`NoticiaCard`, que vira linha com miniatura no celular).
  - Chips de editoria (`NoticiasEditorias`) e paginação com os botões da marca.
  - As listagens, as categorias e o "Leia também" buscam só o resumo, sem o texto inteiro das matérias.
- **Matéria:**
  - Coluna de leitura de 640 px, corpo de 17 px no celular e 18 px no computador, 71 a 74 caracteres por linha.
  - `h1` do corpo vira `h2` (decisão 3).
  - Linha "Notícias › editoria", selo "Opinião", autor ("Da redação" quando é o veículo), data e "atualizado em".
  - Compartilhar (WhatsApp, Facebook, copiar link) no topo e no fim.
  - Aviso publicitário mantido; o card na listagem também mostra "Conteúdo publicitário".
  - "Leia também" e o bloco dos canais no fim.
- **Corpo do WordPress** (levantamento em 98 matérias):
  - O que existe: `h2` (60 matérias), `strong` (56), links (42), `h1` (42), listas (13), `h3` (12), `br` (8), `blockquote` (3) e `img` (1).
  - O que não existe: tabela, `iframe`, `figure`, embed e `style` inline.
  - O CSS cobre todos esses elementos, inclusive os que ainda não aparecem.
- **Hidratação adiada** (`hydrate-on-visible` / `hydrate-never`): rodapé, WhatsApp flutuante, "Leia também" e o bloco dos canais na matéria. O preload da fonte passou a ser só no servidor, porque a hidratação o duplicava.
- **Crédito de foto:** resolvido na fase 4 (abaixo).
- **Marcador na matéria do Chalezinho:** resolvido na fase 4 (abaixo).

Notas da fase 4 (empresas e prestadores) e dos itens anteriores, 29-30/10/2026:

- **`@nuxt/ui` removido.**
  - O site não usava nenhum componente nem composable dele: nenhum `U*`, nenhum `dark:`, nem `form-*`, color-mode, `useToast` ou `useModal`. O admin também não.
  - Ele fornecia o registro do `@nuxtjs/tailwindcss` (agora direto em `modules`) e o plugin de tipografia (`prose`, agora `@tailwindcss/typography` como dependência própria, no `app/tailwind.config.ts`).
  - Trazia também, sem uso: color-mode, Headless UI, os plugins forms (estratégia `class`, sem efeito), aspect-ratio e container-queries, e a escala `primary`/`gray`. Saíram junto o `app.config.ts` e a escala `marca`.
  - **Peso por página:**

    | Medida | Antes | Depois |
    |---|---|---|
    | CSS embutido | ~132 KB (20,7 KB comprimido) | ~66 KB (12,1 KB) |
    | JS inicial | ~536-551 KB | ~511-526 KB (-25 KB, color-mode e Headless UI) |

  - **Admin testado localmente** sem gravar nada: o build foi servido na máquina, o login foi simulado e as leituras usaram a chave anon. Login, lista de notícias (98), edição, nova notícia (com o editor), lista de produtos (6) e edição passaram. As duas tentativas de salvar foram abortadas no navegador antes de sair.
- **CSS externo em vez de embutido** (`features.inlineStyles: false`). A medição está em `lighthouse-antes.md`. O LCP melhorou em todas as situações medidas, e o HTML da home caiu de 114 para 50 KB.
- **Crédito de foto:**
  - Migration `20261029200000_noticias_credito_foto`: coluna opcional `imagem_destaque_credito`. O rollback em `manutencao/` é `DROP COLUMN`; perguntar antes de rodar.
  - O campo entrou no admin (criar e editar). A matéria mostra "Foto: …" só quando o campo está preenchido. Nenhum valor foi preenchido.
- **Chalezinho:**
  - Migration `20261029201000_noticia_chalezinho_marcador_imagem`, com backup em `noticias_bkp_20261029` e rollback em `manutencao/`.
  - Só o `<img src="URL-DA-IMAGEM" …>` saiu: o texto caiu de 6.123 para 6.009 caracteres (os 114 da tag).
  - O hash das outras colunas é o mesmo de antes.
  - A matéria entrou na fila de deploy ('editada') pelo gatilho normal.
- **Listagens de empresas e prestadores:**
  - `DiretorioCabecalho` (o h1 é o mesmo de antes), chips de categoria `DiretorioCategorias` (os mesmos links) e busca da página como antes.
  - Lista limpa com linhas (`DiretorioLinha`): logo ou monograma, nome, selo de verificado, categoria, a linha de apoio de antes (endereço da empresa ou descrição curta do prestador) e nota com o total, ou "Sem avaliações ainda".
  - Paginação da marca (`DiretorioPaginacao`). Os `FiltroCategorias` antigos saíram.
- **Detalhe de empresa e de prestador:**
  - O script de SEO não mudou: title, description, og, JSON-LD e breadcrumb são os de sempre.
  - Identidade: logo ou monograma, categoria, nome (com "Unidade X" em filial), nota, "Aberto 24 horas" quando for o caso, e Verificado e Destaque no prestador.
  - Contatos só quando há o dado:
    - na empresa: WhatsApp em destaque, Ligar, Rota, Instagram, Site e iFood;
    - no prestador: WhatsApp só com `exibir_whatsapp` e Ligar só com `exibir_telefone`, como antes.
  - Descrição, fotos e horário. O dia de hoje e "Aberto/Fechado agora" são calculados no navegador, no fuso de BH, com a mesma regra da RPC e espaço reservado.
  - Endereço com "Ver no mapa": o iframe do Google só carrega no clique.
  - Bloco vermelho do app (`DiretorioAppGuia`), levando ao perfil no Guia (`/guia/empresa|prestador/<slug>`).
  - Rodapé "É dono deste cadastro?" (`DiretorioDono`). A reivindicação existe só para empresa, no perfil do Guia, e exige login; o prestador atualiza o próprio perfil pelo app.
  - O "aberto agora" calculado no build (RPC `aberto_agora`) não aparece mais, porque ficava vencido no HTML estático.
- **Fotos do diretório pelo IPX no build:**
  - Apelido `/guia-fotos` → Storage do Guia (`useFotoGuia`). Saem:
    - a foto de destaque da empresa (a 1ª da galeria), 960×540: 486 arquivos;
    - logos de empresa e fotos de prestador, num tamanho único de 192×192 que serve à listagem, ao detalhe e à home: 714 arquivos.
  - **Total: 1.200 arquivos (~22,9 MB).** Somam **~13 min** a cada envio completo por FTP (~0,65 s por arquivo).
  - Somando as capas das notícias (fase 3), o IPX acrescenta **~1.480 arquivos, cerca de 16 min** a cada deploy completo, que hoje leva ~35 min.
  - **Por que valeu:** os logos originais somavam ~3,8 MB numa página de listagem; o LCP de `/empresas` no celular caiu de 5,8 para 4,2 s.
  - A galeria continua direto do Storage, com carregamento sob demanda e logo abaixo do horário e do endereço. Passá-la pelo IPX daria +1.105 arquivos (+12 min) para pouco ganho no LCP, que foi medido.
- **Ainda carregados em toda página** (próximo passo de desempenho, precisa de aprovação porque mexe no caminho de login, checkout e Meus pedidos): os **dois clientes completos do Supabase** (site e Guia, com Auth e Realtime), criados na abertura por `plugins/supabase.ts` e `plugins/supabase-meubairro-app.ts`. É o principal peso do LCP que sobra (ver `lighthouse-antes.md`, fase 4). O plugin do Mercado Pago só carrega o SDK na hora do pagamento: custo fixo pequeno.
  - **Feito em 30/10/2026** (item 1 da fase 5, notas abaixo).

Notas da fase 5 (Anuncie, produto, carrinho/checkout, midiakit e `/links`), 30/10/2026:

- **Página Anuncie (`/loja`)**, com a estrutura da prancheta "Anuncie · computador" do protótipo, no cabeçalho branco:
  - topo com o mesmo `h1` de antes ("Pacotes de anúncio") e a frase do protótipo como linha de apoio;
  - números de alcance: os mesmos que estavam na home;
  - planos mensais: MBB Basic e MBB Premium, com o "Inclui, por mês" lido da descrição do produto (linhas com "- "), e o Plano Imobiliário;
  - formatos avulsos com o selo "Nossa equipe produz" ou "Conteúdo enviado pronto";
  - aviso de como funciona, comparativo de pacotes, cases (vieram da home) e "Prefere conversar?" com o WhatsApp.
- **Nada de preço escrito à mão.** Preço, nome, descrição e o que inclui vêm da tabela `produtos`, como antes. Em `app/constants/anuncie.ts` ficam só:
  - o grupo de cada produto pelo slug (produto novo sem grupo aparece nos avulsos, sem selo);
  - o **Plano Imobiliário** (R$ 500/mês, cartão sem checkout, com botão de WhatsApp), que não é produto da loja;
  - os números de alcance e os cases, que estavam na home.
- **Produto (`/loja/[slug]`):** breadcrumb, selo do grupo, imagem, descrição e caixa de compra (preço, quantidade, "Adicionar ao carrinho"). O script de SEO e o JSON-LD `Product`/`Offer` são os mesmos.
- **Carrinho, checkout, `/pedido` e Meus pedidos: só template e classes.** O `<script>` de `carrinho.vue`, `pedido/[id].vue`, `meus-pedidos.vue` e `pedido/Acompanhamento.vue` é idêntico ao de antes (conferido no diff). Os textos dos botões não mudaram. O Card Payment Brick do Mercado Pago mantém o estilo próprio, que só muda pela API de customização dele, ou seja, no script.
- **Midiakit:** as mesmas informações, com cabeçalho e abas novos (`MidiakitCabecalho`, `MidiakitTabs` em chips).
- **`/links`:** fundo `ink`, botão principal vermelho e os outros brancos; só os ícones das redes mantêm as cores de cada uma.
- **Saíram** os componentes da home sem uso: HeroConversao, NumerosDestaque, AppDestaque, PacotesComparativo, Depoimentos e MidiakitResumo.

Item 1 da fase 5 (clientes do Supabase sob demanda), 30/10/2026:

- **O que mudou:** saíram `plugins/supabase.ts` e `plugins/supabase-meubairro-app.ts`. Agora `composables/useSupabase.ts` cria os clientes do site e do Guia na primeira vez que uma tela precisa deles. O `supabase-js` vira um arquivo à parte, baixado só nessa hora (no HTML fica só um `prefetch` de prioridade mínima).
  - Os composables de dados pedem o cliente dentro do `useAsyncData`, que no navegador usa o payload do build e não busca nada.
  - O admin, Meus pedidos, `/pedido`, o acompanhamento, `/links` (no clique) e a busca pedem o cliente quando usam.
  - O checkout (Pix e cartão) já chamava as funções por `$fetch` e não mudou.
- **Teste ponta a ponta, antes e depois, fora da produção:**
  - **Ambiente:** branch de dev do site (`dev-clientes`, criado e apagado no mesmo dia), site servido localmente apontando para ele, Mercado Pago com o token de teste só nos segredos do branch, e dev da Central (`gpoaicfsigsqefbncwpa`) ligado pelo `central-mbb/scripts/acompanhamento/configurar.mjs`.
  - **Mesmo resultado nas duas versões:**
    - carrinho: adicionar, quantidade, remover;
    - Pix até o QR code do Mercado Pago de teste, com aprovação simulada no banco do branch: tela de pago e link de acompanhamento;
    - cartão APRO aprovado de verdade pelo Mercado Pago de teste;
    - os dois pedidos chegam ao dev da Central;
    - /meus-pedidos com o código guardado por uma função temporária do branch (ninguém recebeu WhatsApp) e o link de token;
    - /pedido/[id];
    - admin: login real no branch, lista e edição de notícia e de produto.
  - Nenhuma requisição saiu para a API do site de produção.
  - **Achado:** o branch nasce sem os GRANTs de tabelas e funções que a produção tem (ver seção 7). Copiei os da produção para o branch, só lendo a produção.
