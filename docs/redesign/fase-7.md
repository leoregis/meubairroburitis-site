# Fase 7: plano de publicação do redesign

Preparado em 30/10/2026 e atualizado com as decisões do Leo da mesma data. **Data: terça, 10/11/2026, às 10:00** (reserva: quarta, 11/11, às 10:00). **Nada da publicação foi executado.** Cada passo marcado "Leo" precisa de você; o resto eu faço na sessão da publicação.

## 1. Antes do dia (até a véspera)

0. **Segunda, 09/11: trazer a `main` para a `redesign`** (`git merge origin/main` na `redesign`, sem tocar na `main`), resolver conflito se houver, publicar a prévia e repetir a comparação de SEO. Pega notícias e cadastros novos e qualquer commit que tenha entrado na `main` desde a criação da `redesign`.
1. **Conferência final de SEO**, no dia anterior, depois do passo 0:
   - **Comparação prévia × produção:** fotografia das duas com `docs/redesign/seo-snapshot.mjs`, todos os campos e as ~1.016 URLs do sitemap. Pode haver só as diferenças aprovadas:
     - home: title, description, `og:title`, `og:description` e o JSON-LD `WebSite`;
     - `h1` das 42 matérias, que viram 1 por página.
   - **Arquivos e links da prévia:**
     - `robots.txt` e `sitemap.xml` do build da prévia sem diferença em relação à produção, fora o noindex da prévia;
     - os 4 redirects da seção 2.1;
     - links internos sem 404 novo.
2. **Core Web Vitals reais "antes"** (seção 4), em 09/11: `node docs/redesign/cwv.mjs --desde 2026-10-29 --ate 2026-11-10 --saida docs/redesign/cwv-antes.json`, e atualizar `cwv-antes.md` (a 1ª extração, de 29 a 31/10, já está lá).
3. **Checagens funcionais:**
   - **Admin:** teste local sem gravar na produção.
   - **Carrinho:** fluxo no navegador da prévia.
   - **Pagamento:** só se o código do checkout mudar depois de 30/10. Nesse caso, repetir o teste ponta a ponta num branch de dev (Mercado Pago de teste, como no item 1).
4. **Proteção da release anterior: feito e testado em 30/10.** Dois workflows manuais estão na `redesign` e entram no merge, sem efeito até serem disparados. Os dois têm simulação ligada por padrão e só aceitam a raiz `public_html` ou o sandbox `public_html/_staging_test/<pasta>`.
   - **`proteger-release.yml`:** renomeia uma `_old_<timestamp>` para `_preredesign_<timestamp>`.
     - **Por que é preciso:** a limpeza automática (`limpeza-releases.yml`) mantém só as 3 `_old_*` completas mais recentes. Com 2 a 4 deploys por dia, a release de antes do redesign seria apagada em cerca de 1 dia, antes dos 7 de observação.
     - **Fica fora da limpeza:** o nome novo não casa com `^_old_[0-9]+$`, então a limpeza não o apaga.
     - **Fica fora do limite do deploy:** também não conta no limite de 10 pastas antigas que trava o deploy.
   - **`voltar-release.yml`:** troca em dois passos, como o swap do deploy: `_current` vira `_old_<agora>` e a pasta indicada vira `_current`. O `restaurar-emergencial.yml` atual só serve quando o `_current` sumiu, porque não renomeia por cima de um `_current` existente.
5. **Teste dos workflows** (`testar-release-manual.yml`, run 41148376560, 30/10):
   - **Sandbox no staging, renomeações reais:**
     - `proteger-release` levou `_old_2000` para `_preredesign_2000`;
     - `voltar-release` guardou o `_current` como `_old_<agora>`, pôs `_preredesign_2000` no ar e conferiu o `_build.txt`;
     - as outras pastas ficaram intactas, e o sandbox foi apagado no fim.
   - **Produção, só simulação:** os dois listaram o que fariam com a `_old_*` mais recente real, sem alterar nada.
   - **O que só dá para testar de verdade na produção:**
     - o `mv` real dentro de `public_html`, porque a conta é a mesma e muda só a pasta;
     - a purga do Cloudflare do `voltar-release`, que roda só na produção (é o mesmo código e o mesmo segredo do `deploy.yml`, que purga a cada deploy).
6. **Leo:** dar o "pode publicar" por escrito na sessão.

## 2. Janela de publicação

- **Fora de 30/11 a 06/12** (abertura da votação dos Melhores do Ano).
- **Fora do deploy agendado.** O `cron` é 05:30 UTC (02:30 em Brasília), mas o GitHub atrasa. Nos últimos 7 dias, o agendado começou entre 07:00 e 08:40 (Brasília) e levou ~40 a 44 min. Começar depois das **10:00**, só com o agendado do dia concluído (`gh run list --workflow deploy.yml`).
- **Sem notícia na fila:**
  - `deploy_fila_itens` sem item pendente (`atendido_em is null`);
  - nenhum Deploy em andamento ou na fila;
  - o Leo não publica nada no admin entre o merge e o fim do deploy.

  Cuidado com a fila: ela não espera, e um disparo dela entraria na fila do grupo `deploy-producao` logo atrás do merge. O Guia também dispara deploy quando uma empresa é criada ou ativada: conferir antes, sem como bloquear.
- **Escolhido pelo Leo:** terça 10/11/2026 às 10:00; reserva quarta 11/11 às 10:00. Disponibilidade dele até umas 12:00.

## 3. Passo a passo no dia

| # | Passo | Quem | Tempo |
|---|---|---|---|
| 1 | Conferir a janela: agendado do dia concluído, nenhum Deploy rodando, fila vazia | eu | 5 min |
| 2 | Fotografia de SEO da produção (o "antes" do dia) | eu | ~10 min |
| 3 | Abrir o PR `redesign` → `main` e mostrar o resumo do diff | eu | 5 min |
| 4 | **"Pode fazer o merge"** | **Leo** | — |
| 5 | Merge (commit de merge, sem squash, para o `git revert -m 1` funcionar) e push na `main`. O push dispara o Deploy completo | eu | 1 min |
| 6 | Acompanhar o Deploy: build (~10 min), envio por FTP para `_release_*` (~35-40 min, com os ~1.480 arquivos a mais das imagens pelo IPX), conferência e swap | eu | **~51 min** |
| 7 | Logo depois do swap: rodar `proteger-release.yml` primeiro em simulação e depois com `simulacao=false`, com a `_old_*` que o swap acabou de criar (a release de antes do redesign; o nome aparece no log do Deploy) | eu | 3 min |
| 8 | Checagens da seção 5 | eu | ~20 min |
| 9 | Você abre o site no celular e no computador | **Leo** | 10 min |

**Observações:**
- **Migrations:** as três migrations da `redesign` (crédito de foto, Chalezinho e permissões) já estão aplicadas na produção. O deploy ignora `supabase/**`, e nada muda no banco no dia.
- **Prévia:** as travas de `MBB_PREVIA` não têm efeito na produção. A pasta `deploy/previa/` não é usada pelo deploy.
- **Duração:** a estimativa de ~51 min é a sua. Nos últimos deploys completos, o tempo foi de 38 a 44 min sem as imagens novas.

## 4. Core Web Vitals reais (item 1 do Leo)

**Confirmado em 30/10 com o token:**
- **Token:** Account > Account Analytics > Read, em `Documents\Projetos-locais\cloudflare-analytics.env`. A permissão basta.
- **API:** GraphQL, `viewer.accounts(filter: { accountTag }).rumWebVitalsEventsAdaptiveGroups`.
- **Percentis (`quantiles`):** `largestContentfulPaintP75`, `interactionToNextPaintP75` e `cumulativeLayoutShiftP75`, em microssegundos (o CLS não tem unidade).
- **Recortes (`dimensions`):** `requestPath`, `requestHost`, `deviceType`, `bot` e `date`.
- **Filtros:** aceita `requestPath_like` (prefixo) e filtros por métrica (`largestContentfulPaint_gt`).
- **Script:** `node docs/redesign/cwv.mjs --desde AAAA-MM-DD [--ate AAAA-MM-DD] [--saida arquivo.json]`.
  - **Filtros fixos:** `meubairroburitis.com.br` (sem a prévia e sem a Central) e sem bots (as medições automáticas com Chrome headless saem como bot).
  - **Cálculo:** cada p75 só sobre os eventos que mediram aquela métrica.

**Amostra pequena (ver `cwv-antes.md`):**
- **Volume:** o Web Analytics registra ~170 visualizações de página por dia na produção, sem bots.
- **Na 1ª extração (29 a 31/10):** `/loja` teve 4 medições, `/loja/*` nenhuma, `/empresas/*` 28 e `/noticias/*` 20.
- **Consequência:** com tão poucas medições, "piorar mais de 20%" pode acontecer por acaso.

**Procedimento:**
**Regra aprovada pelo Leo em 30/10/2026:**
- **(a) Antes da publicação, em 09/11:** `--desde 2026-10-29 --ate 2026-11-10` (12 dias), com o p75 de LCP, INP e CLS no celular, no computador e no total, para:
  - o **site inteiro**: todas as páginas de `meubairroburitis.com.br` fora `/guia/`, sem bots;
  - `/` e `/loja` (página exata);
  - `/loja/*`, `/empresas/*` e `/noticias/*` (prefixo do caminho).

  Resultado em `cwv-antes.md` e `cwv-antes.json`.
- **(b) Depois:** `--desde 2026-11-10 --ate 2026-11-17` (7 dias), com a variação em %. Grupo com menos de 50 medições de LCP estende para 14 dias (`--ate 2026-11-24`).
- **(c) Gatilho de reversão:** o LCP p75 real piorar **mais de 20%** em qualquer grupo com **50 ou mais medições**. Isso inclui o site inteiro, a `/loja` e os produtos (`/loja/*`), se chegarem a 50.
- **(d) `/loja` e `/loja/*` com menos de 50 medições:** decide a medição de laboratório com o critério novo (mesmo servidor local, navegador real com celular emulado; ver `lighthouse-antes.md`, "Fase 6: critério novo de LCP").
  - A `/loja` pode ficar atrás da produção, desde que o LCP de laboratório fique **abaixo de 2,5 s**.
  - Acima de 2,5 s, revertemos ou otimizamos antes de seguir.
  - Medida de referência em 30/10 (`font-display: optional`): 1,10 s na rodada de 7, com a produção a 0,66 s.

**Se o gatilho (c) disparar, ou a `/loja` passar de 2,5 s em (d):**
  1. volto o site com `voltar-release.yml` (simulacao=false) e a pasta `_preredesign_*` (minutos, sem rebuild);
  2. faço `git revert -m 1 <merge>` na `main`; o push dispara um Deploy completo do código antigo com o conteúdo atual (~51 min);
  3. otimizo e preparo uma nova publicação.

## 5. Checagens logo após a troca

- **Build no ar:** `https://meubairroburitis.com.br/_build.txt` com o hash do merge (o deploy também confere por FTP).
- **SEO:**
  - fotografia da produção logo depois, comparada com a da manhã: só as diferenças aprovadas;
  - `robots.txt` igual;
  - `sitemap.xml` com o mesmo número de URLs;
  - os 4 redirects da seção 2.1;
  - `/guia/` continua sendo o app;
  - 404 com a página de "não encontrada".
- **Páginas principais (200, com o visual novo):** home, uma matéria, `/noticias`, `/empresas`, uma empresa, um prestador, `/loja`, um produto, `/midiakit`, `/links` e `/busca`.
- **Fluxos, sem compra real:**
  - adicionar ao carrinho, abrir o carrinho e o formulário de checkout;
  - abrir `/meus-pedidos` sem pedir código;
  - abrir um `/pedido/<token>` antigo (o seu, se tiver).
- **Admin:** login, lista de notícias e de produtos, sem salvar.
- **Cache do Cloudflare:** o deploy já faz o purge no fim. Conferir uma página com `cf-cache-status`.
- **Monitoramento nas 24 h seguintes:**
  - painel do Web Analytics: queda brusca de visitas indica página quebrada;
  - Search Console: erros de rastreamento;
  - próximo deploy agendado (dia seguinte) concluído sem erro.

## 6. Rollback

- **Imediato, em minutos:** `voltar-release.yml` com `_preredesign_<timestamp>`. O site antigo volta sem rebuild.
  - **Ressalva:** notícias, produtos e empresas publicados depois do merge não aparecem até o build completo do passo seguinte.
- **Logo depois:** `git revert -m 1 <commit do merge>` na `main` e push. O Deploy completo (~51 min) recoloca o código antigo com o conteúdo atual.
- **Não usar o Deploy manual "modo=completo" sem o revert.** Ele publicaria de novo o código do redesign, que ainda estaria na `main`.
- **Depois de 7 dias sem gatilho:** a `_preredesign_*` pode ser apagada à mão, com a sua confirmação.

## 7. O que eu preciso de você

1. **Estar disponível na terça 10/11, das 10:00 às 12:00** (ou na quarta 11/11, se a terça não der).
2. **Confirmar a proposta da amostra mínima** do gatilho de reversão (seção 4).
3. **Dizer "pode fazer o merge"** na sessão, depois de ver o resumo do PR.
4. **Não publicar nada no admin** durante os ~51 min do deploy.
5. **Olhar o site** no celular e no computador logo depois da troca.
6. **Decidir sobre a prévia:** manter `previa.meubairroburitis.com.br` para os próximos trabalhos ou desligá-la.
