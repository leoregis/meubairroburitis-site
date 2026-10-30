# Fase 7: plano de publicação do redesign

Preparado em 30/10/2026. **Nada aqui foi executado.** Cada passo marcado "Leo" precisa de você; o resto eu faço na sessão da publicação.

## 1. Antes do dia (até a véspera)

1. **Conferência final de SEO**, no dia anterior:
   - **Comparação prévia × produção:** fotografia das duas com `docs/redesign/seo-snapshot.mjs`, todos os campos e as ~1.016 URLs do sitemap. Pode haver só as diferenças aprovadas:
     - home: title, description, `og:title`, `og:description` e o JSON-LD `WebSite`;
     - `h1` das 42 matérias, que viram 1 por página.
   - **Arquivos e links da prévia:**
     - `robots.txt` e `sitemap.xml` do build da prévia sem diferença em relação à produção, fora o noindex da prévia;
     - os 4 redirects da seção 2.1;
     - links internos sem 404 novo.
2. **Core Web Vitals reais "antes"** (seção 4): exportar o p75 de LCP, INP e CLS das páginas da lista. É o "antes" oficial, junto com o que o Web Analytics já coleta desde 29/10.
3. **Checagens funcionais:**
   - **Admin:** teste local sem gravar na produção.
   - **Carrinho:** fluxo no navegador da prévia.
   - **Pagamento:** só se o código do checkout mudar depois de 30/10. Nesse caso, repetir o teste ponta a ponta num branch de dev (Mercado Pago de teste, como no item 1).
4. **Proteção da release anterior:** preparar na `redesign` dois workflows manuais. Eles entram no merge, sem efeito até serem disparados.
   - **`proteger-release.yml`:** renomeia uma `_old_<timestamp>` para `_preredesign_<timestamp>`.
     - **Por que é preciso:** a limpeza automática (`limpeza-releases.yml`) mantém só as 3 `_old_*` completas mais recentes. Com 2 a 4 deploys por dia, a release de antes do redesign seria apagada em cerca de 1 dia, antes dos 7 de observação.
     - **Fica fora da limpeza:** o nome novo não casa com `^_old_[0-9]+$`, então a limpeza não o apaga.
     - **Fica fora do limite do deploy:** também não conta no limite de 10 pastas antigas que trava o deploy.
   - **`voltar-release.yml`:** troca em dois passos, como o swap do deploy: `_current` vira `_old_<agora>` e a pasta indicada vira `_current`. O `restaurar-emergencial.yml` atual só serve quando o `_current` sumiu, porque não renomeia por cima de um `_current` existente.
5. **Leo:** escolher o dia (seção 2) e dar o "pode publicar" por escrito na sessão.

## 2. Janela de publicação

- **Fora de 30/11 a 06/12** (abertura da votação dos Melhores do Ano).
- **Fora do deploy agendado.** O `cron` é 05:30 UTC (02:30 em Brasília), mas o GitHub atrasa. Nos últimos 7 dias, o agendado começou entre 07:00 e 08:40 (Brasília) e levou ~40 a 44 min. Começar depois das **10:00**, só com o agendado do dia concluído (`gh run list --workflow deploy.yml`).
- **Sem notícia na fila:**
  - `deploy_fila_itens` sem item pendente (`atendido_em is null`);
  - nenhum Deploy em andamento ou na fila;
  - o Leo não publica nada no admin entre o merge e o fim do deploy.

  Cuidado com a fila: ela não espera, e um disparo dela entraria na fila do grupo `deploy-producao` logo atrás do merge. O Guia também dispara deploy quando uma empresa é criada ou ativada: conferir antes, sem como bloquear.
- **Sugestão:** terça 10/11 ou quarta 11/11/2026, às 10:00, num dia útil com você disponível até umas 12:00.

## 3. Passo a passo no dia

| # | Passo | Quem | Tempo |
|---|---|---|---|
| 1 | Conferir a janela: agendado do dia concluído, nenhum Deploy rodando, fila vazia | eu | 5 min |
| 2 | Fotografia de SEO da produção (o "antes" do dia) | eu | ~10 min |
| 3 | Abrir o PR `redesign` → `main` e mostrar o resumo do diff | eu | 5 min |
| 4 | **"Pode fazer o merge"** | **Leo** | — |
| 5 | Merge (commit de merge, sem squash, para o `git revert -m 1` funcionar) e push na `main`. O push dispara o Deploy completo | eu | 1 min |
| 6 | Acompanhar o Deploy: build (~10 min), envio por FTP para `_release_*` (~35-40 min, com os ~1.480 arquivos a mais das imagens pelo IPX), conferência e swap | eu | **~51 min** |
| 7 | Logo depois do swap: rodar `proteger-release.yml` com a `_old_*` que o swap acabou de criar (a release de antes do redesign) | eu | 2 min |
| 8 | Checagens da seção 5 | eu | ~20 min |
| 9 | Você abre o site no celular e no computador | **Leo** | 10 min |

**Observações:**
- **Migrations:** as três migrations da `redesign` (crédito de foto, Chalezinho e permissões) já estão aplicadas na produção. O deploy ignora `supabase/**`, e nada muda no banco no dia.
- **Prévia:** as travas de `MBB_PREVIA` não têm efeito na produção. A pasta `deploy/previa/` não é usada pelo deploy.
- **Duração:** a estimativa de ~51 min é a sua. Nos últimos deploys completos, o tempo foi de 38 a 44 min sem as imagens novas.

## 4. Core Web Vitals reais (item 1 do Leo)

**O que o Cloudflare Web Analytics oferece:**
- **No painel (Web Analytics → Core Web Vitals):** LCP, INP e CLS com o p75, os elementos que mais pesam e o recorte por caminho da página.
- **Pela API GraphQL:** o conjunto `rumWebVitalsEventsAdaptiveGroups` traz percentis (como p50 e p75) com recorte por dimensões como caminho e tipo de aparelho.
  - **Unidade:** em microssegundos, menos o CLS, que não tem unidade.
  - **Ressalva:** os nomes exatos dos campos de p75 por página precisam ser conferidos no próprio esquema da API quando houver token. As fontes que encontrei são de terceiros.

**Para usar a API, preciso de um token.** O login do wrangler não tem esse acesso (visto na fase 1).
- **Leo:** criar um token com a permissão **Account → Account Analytics → Read**, só leitura.
- Salvar em `Documents\Projetos-locais\cloudflare-analytics.env` (`CF_API_TOKEN=…`), como o do Mercado Pago. Eu leio sem exibir.

**Procedimento:**
- **(a) Antes da publicação:** p75 de LCP, INP e CLS, no celular e no computador, dos últimos 7 dias, para:
  - `/` e `/loja` (página exata);
  - `/loja/*`, `/empresas/*` e `/noticias/*`, agrupando pelo prefixo do caminho.

  Tabela salva em `docs/redesign/cwv-antes.md`.
- **(b) 7 dias depois:** a mesma consulta e a mesma tabela, com a variação em %. Páginas com poucas visitas na semana (menos de ~50 medições) ficam marcadas como "amostra pequena".
- **(c) Gatilho de reversão:** se o LCP p75 real da `/loja` ou dos produtos (`/loja/*`) piorar **mais de 20%**:
  1. volto o site com `voltar-release.yml` e a pasta `_preredesign_*` (minutos, sem rebuild);
  2. faço `git revert -m 1 <merge>` na `main`; o push dispara um Deploy completo do código antigo com o conteúdo atual (~51 min);
  3. otimizo e preparo uma nova publicação.

**Se a API não separar por página ou não expuser esses dados**, a alternativa mais simples é ler os mesmos números no painel do Web Analytics, filtrando pelo caminho, e registrar à mão nas duas datas. Não precisa de código. O CrUX do Google não serve: só tem dados por URL para páginas com muito tráfego.

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

1. **Escolher o dia** (seção 2) e estar disponível das 10:00 às 12:00.
2. **Criar o token do Cloudflare** (só leitura de Analytics) e salvar no arquivo indicado, até a véspera. Sem token, uso o caminho manual pelo painel.
3. **Dizer "pode fazer o merge"** na sessão, depois de ver o resumo do PR.
4. **Não publicar nada no admin** durante os ~51 min do deploy.
5. **Olhar o site** no celular e no computador logo depois da troca.
6. **Decidir sobre a prévia:** manter `previa.meubairroburitis.com.br` para os próximos trabalhos ou desligá-la.
