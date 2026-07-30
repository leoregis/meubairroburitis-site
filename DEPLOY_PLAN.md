# Plano de virada — WordPress → site novo

> **Este documento é só um plano. Nada aqui é executado automaticamente.**
> Só deve ser seguido manualmente quando o site novo estiver completo,
> testado e aprovado para ir ao ar na raiz de `meubairroburitis.com.br`.

## Estado atual (antes da virada)

`public_html/` (raiz do domínio) hoje contém o WordPress em produção
(`wp-admin/`, `wp-content/`, `wp-includes/`, `wp-config.php`, etc.) e o
subdiretório `guia/` (o app do bairro, Guia Buritis — **projeto separado,
nunca tocado por este plano**).

O deploy contínuo do site novo (`.github/workflows/deploy.yml`) já publica
cada push em `public_html/_current/` via rename atômico — mas até a virada
acontecer, `_current/` não é servido por nada (o domínio ainda responde via
WordPress). A virada é o momento em que isso muda.

## Passo a passo da virada (manual, uma vez)

1. **Backup do WordPress inteiro, recuperável.**
   Renomear (não apagar) tudo que hoje compõe o WordPress na raiz para uma
   pasta de backup datada, preservando também os uploads de mídia (que
   contêm as imagens originais já reaproveitadas no site novo, mas o
   backup mantém o histórico completo por segurança):

   ```
   public_html/wp-admin        → public_html/wordpress_backup_2026/wp-admin
   public_html/wp-content      → public_html/wordpress_backup_2026/wp-content
   public_html/wp-includes     → public_html/wordpress_backup_2026/wp-includes
   public_html/wp-config.php   → public_html/wordpress_backup_2026/wp-config.php
   public_html/*.php (wp-*)    → public_html/wordpress_backup_2026/*.php
   public_html/.htaccess       → public_html/wordpress_backup_2026/.htaccess.wordpress
   ```

   Cada um desses é um rename atômico individual (mesmo mecanismo já
   testado e confirmado nesta rodada) — não precisa ser um único rename de
   pasta porque hoje esses arquivos vivem soltos na raiz, não dentro de uma
   pasta própria.

   `public_html/guia/` e `public_html/.well-known/` **não são tocados** em
   nenhum momento deste passo.

2. **Publicar a regra de rewrite definitiva.**
   Substituir `public_html/.htaccess` por uma versão nova que direciona toda
   requisição — exceto `/guia/*` e `/.well-known/*` — para dentro de
   `public_html/_current/` (a pasta que o deploy contínuo já mantém
   atualizada), **com fallback pra SPA** nas rotas client-only (`/pedido/[id]`
   e `/admin/*` — carrinho/pagamento e a tela de vendas não são pré-geradas,
   são só client-side; confirmado com um teste real de navegador nesta
   rodada, ver Frente 4):

   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_URI} !^/guia/
   RewriteCond %{REQUEST_URI} !^/\.well-known/
   RewriteCond %{REQUEST_URI} !^/_current/
   RewriteCond %{REQUEST_URI} !^/_old_
   RewriteCond %{REQUEST_URI} !^/_release_

   # existe arquivo real dentro de _current/ pra esse caminho? serve ele
   RewriteCond %{DOCUMENT_ROOT}/_current%{REQUEST_URI} -f
   RewriteRule ^(.*)$ /_current/$1 [L]

   # senão (rota dinâmica sem HTML pré-gerado, ex: /pedido/[id], /admin/*),
   # cai no shell client-only (200.html) e o Vue Router assume dali
   RewriteRule ^(.*)$ /_current/200.html [L]
   ```

   A partir deste momento, o domínio raiz passa a servir o site novo.

3. **Confirmar no navegador** que `meubairroburitis.com.br` carrega o site
   novo, que `meubairroburitis.com.br/guia/` continua funcionando
   normalmente, e que nenhuma URL do WordPress (`/wp-admin`, `/wp-login.php`)
   responde mais publicamente.

4. **Manter `wordpress_backup_2026/` por um período de segurança**
   (sugestão: pelo menos 90 dias) antes de cogitar removê-la de vez — ela é
   a via de rollback caso algo inesperado apareça depois da virada (ex:
   algum e-mail transacional ou plugin que ainda dependia do WordPress
   estar respondendo na raiz).

## Rollback (se algo der errado logo após a virada)

Reverter é o processo inverso: renomear `public_html/.htaccess` de volta
para a versão antiga (guardar uma cópia dela antes do passo 2, ex:
`.htaccess.pre-virada`), e mover os arquivos de `wordpress_backup_2026/` de
volta para a raiz. Como cada rename é atômico e reversível, o rollback é
rápido — não é uma restauração de backup tradicional.

## Pré-requisitos antes de executar este plano

- Site novo aprovado pelo usuário (conteúdo revisado, carrinho testado,
  Lighthouse/PageSpeed dentro da faixa "boa" — ver critérios de qualidade
  do projeto).
- DNS já aponta para este servidor (nenhuma mudança de DNS é necessária
  neste plano — o domínio já resolve pra cá, a virada é só de conteúdo
  servido dentro do mesmo `public_html/`).
- Aviso prévio combinado com o usuário sobre o dia/horário da virada, já
  que qualquer downtime residual do WordPress a partir deste ponto é
  intencional e definitivo.
