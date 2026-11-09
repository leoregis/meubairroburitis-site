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

   **Resultado em 09/11 (passos 0 e 1):**
   - **Merge:** `origin/main` entrou na `redesign` sem conflito (`3830f80`, com `c1b6b4f` mov-mp4 e `c9f638e` moderacao_alerta_email). `/ferramentas/mov-mp4.html` está no build, idêntico ao da produção.
   - **Prévia:** publicada (versão do Worker `c51875d0`, do commit com a correção do sitemap), 1.023 páginas, conferências ok.
   - **SEO prévia × produção:** 1.020 URLs. Só as 5 diferenças aprovadas da home e o `h1` de **43** matérias (2 → 1). A 43ª é `buritis-vai-ganhar-nova-praca-com-mirante-e-letreiro`, publicada depois da baseline de 29/10, com o mesmo `h1` duplicado na produção: é a mesma correção aprovada.
   - **URLs novas na produção desde a baseline:** 5, todas na prévia com 200.
   - **`robots.txt`:** igual ao da produção (build local sem `MBB_PREVIA`).
   - **`sitemap.xml`:** as mesmas 1.016 URLs.
     - **Achado e corrigido:** as `<image:loc>` do redesign saíam com `&amp;amp;` (3.563 de 4.674), o que daria endereços de imagem inexistentes no Google. Corrigido em `app/server/plugins/sitemap-imagens.ts`.
     - **Diferença que fica, aprovada pelo Leo em 09/11:** o conjunto de imagens de cada URL muda para as miniaturas WebP pelo IPX das páginas novas, no lugar das JPEG antigas.
     - **Condição conferida em 09/11:** amostra de 115 imagens do sitemap do build de produção, de 102 páginas (5 da home, 30 de empresas, 30 de prestadores, 30 de notícias, 10 de outras páginas e 10 externas do Storage). Todas deram 200 na prévia, com content-type de imagem, e estão no build. O sitemap continua com 1.016 páginas.
       - Na prévia, o Worker responde 307 trocando `&` por `%26` antes do 200; isso não acontece na produção. O Apache serve `/_ipx/f_jpeg&s_3072x2048/hero/capa-buritis.jpg` direto, com 200 e `image/jpeg`.
   - **Redirects:** os 4 da seção 2.1 dão 301 na produção e vivem no `deploy/htaccess-producao`, que não muda no merge.
   - **Links internos:** nenhum 404 novo. O único link quebrado (`/noticias/quanto-custa-e-como-encontrar-uma-boa-diarista-em-bh-um-guia-completo`) já dá 404 na produção hoje; vem do texto de uma matéria.
2. **Core Web Vitals reais "antes"** (seção 4): **feito em 09/11**, com `node docs/redesign/cwv.mjs --desde 2026-10-29 --ate 2026-11-10 --eventos --saida docs/redesign/cwv-antes.json`. Resultado e o porquê do `--eventos` (amostragem de 10% do Cloudflare) em `cwv-antes.md`.
3. **Checagens funcionais** (**feitas em 09/11**, ver o resultado abaixo):
   - **Admin:** teste local sem gravar na produção.
   - **Carrinho:** fluxo no navegador da prévia.
   - **Pagamento:** só se o código do checkout mudar depois de 30/10. Nesse caso, repetir o teste ponta a ponta num branch de dev (Mercado Pago de teste, como no item 1).
   **Resultado em 09/11:**
   - **Carrinho na prévia:** Playwright, celular emulado. Todas as checagens passaram:
     - adicionar 2 produtos na `/loja`;
     - quantidade de 1 para 3, com o total de R$ 748,00 para R$ 1.246,00;
     - remover um item, com o total de R$ 747,00;
     - o carrinho continua igual depois de recarregar;
     - formulário preenchido e "Gerar QR Code PIX": aparece o aviso "Prévia do novo site: compras, códigos e registros estão desativados aqui.".
     - Toda escrita para fora da prévia ficava bloqueada no navegador, e nenhuma aconteceu. Só houve os POST de métrica e de desafio do próprio Cloudflare no domínio da prévia.
   - **Admin local:** build de produção da `redesign` servido na máquina, como o Apache (`/admin/*` no `200.html`), e Playwright com Chrome.
     - **Simulado no navegador:** login (POST `auth/v1/token` respondido com sessão simulada) e `is_admin` (`true`).
     - **Leituras:** foram à produção com a chave anon.
     - **Escritas:** qualquer outra requisição que não fosse GET para fora da máquina era abortada.
     - **Passaram:**
       - sem sessão, o admin redireciona para o login;
       - login;
       - lista de notícias (100) e edição de uma notícia;
       - lista de produtos (6) e edição de um produto.
     - **"Salvar":** nos dois casos, o PATCH em `rest/v1/noticias` e em `rest/v1/produtos` foi disparado e abortado. Conferido na produção, só leitura: a notícia continua com `atualizado_em` de 06/11 e os nomes não mudaram.
   - **Pagamento:** não precisou. O checkout não mudou depois de 30/10.
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
- **Fora do deploy agendado.** O `cron` é 05:30 UTC (02:30 em Brasília), mas o GitHub atrasa. Em 30/10, o agendado vinha começando entre 07:00 e 08:40 (Brasília). **Atualizado em 09/11:** de 02 a 08/11 começou entre 08:51 e 10:44 e terminou entre 09:36 e 11:19 (~36 a 47 min); em 09/11, às 10:35, ainda não tinha começado. Começar às **10:00** (`gh run list --workflow deploy.yml`). **Regra aprovada pelo Leo em 09/11:**
  - **agendado do dia rodando às 10:00:** esperar ele terminar e só então fazer o merge;
  - **agendado do dia ainda não começou:** seguir com o merge. O agendado entra na fila do grupo `deploy-producao` atrás do nosso Deploy e publica depois o mesmo código da `main`. O `proteger-release.yml` roda logo depois da nossa troca (passo 7), **antes de qualquer deploy seguinte** começar a trocar de release;
  - **agendado do dia já concluído:** seguir com o merge.
- **Sem notícia na fila:**
  - `deploy_fila_itens` sem item pendente (`atendido_em is null`);
  - nenhum Deploy em andamento ou na fila;
  - o Leo não publica nada no admin entre o merge e o fim do deploy.

  Cuidado com a fila: ela não espera, e um disparo dela entraria na fila do grupo `deploy-producao` logo atrás do merge. O Guia também dispara deploy quando uma empresa é criada ou ativada: conferir antes, sem como bloquear.
- **Escolhido pelo Leo:** terça 10/11/2026 às 10:00; reserva quarta 11/11 às 10:00. Disponibilidade dele até umas 12:00.

## 3. Passo a passo no dia

| # | Passo | Quem | Tempo |
|---|---|---|---|
| 1 | Conferir a janela: agendado do dia rodando (esperar), não começado ou concluído (seguir); nenhum outro Deploy rodando; fila vazia | eu | 5 min |
| 2 | Fotografia de SEO da produção (o "antes" do dia) | eu | ~10 min |
| 3 | Abrir o PR `redesign` → `main` e mostrar o resumo do diff | eu | 5 min |
| 4 | **"Pode fazer o merge"** | **Leo** | — |
| 5 | Merge (commit de merge, sem squash, para o `git revert -m 1` funcionar) e push na `main`. O push dispara o Deploy completo | eu | 1 min |
| 6 | Acompanhar o Deploy: build (~10 min), envio por FTP para `_release_*` (~35-40 min, com os ~1.480 arquivos a mais das imagens pelo IPX), conferência e swap | eu | **~51 min** |
| 7 | Logo depois do swap: rodar `proteger-release.yml` primeiro em simulação e depois com `simulacao=false`, com a `_old_*` que o swap acabou de criar (a release de antes do redesign; o nome aparece no log do Deploy). Tem de terminar antes de qualquer deploy seguinte (agendado, fila ou Guia) chegar ao swap | eu | 3 min |
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
- **(b) Depois:** `--desde 2026-11-10 --ate 2026-11-17 --eventos` (7 dias), com a variação em %, rodado em 17/11 (o Cloudflare só guarda os eventos completos por ~8 dias). Grupo com menos de 50 medições de LCP estende para 14 dias: 2ª semana extraída em 24/11 e somada à 1ª.
- **(c) Gatilho de reversão:** o LCP p75 real piorar **mais de 20%** em qualquer grupo com **50 ou mais medições**. **Confirmado pelo Leo em 09/11**, com os limites do `cwv-antes.md` (todos os aparelhos):
  - site inteiro (sem `/guia/`): 1,26 s, gatilho acima de 1,51 s;
  - `/empresas/*`: 1,50 s, gatilho acima de 1,80 s;
  - `/noticias/*`: 1,16 s, gatilho acima de 1,39 s;
  - `/` (home): 1,15 s, gatilho acima de 1,38 s;
  - `/loja` e `/loja/*` entram se chegarem a 50 medições no "depois"; senão, vale a regra (d).
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
