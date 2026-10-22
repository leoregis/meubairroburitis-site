#!/usr/bin/env bash
# Aplica deploy/htaccess-producao como public_html/.htaccess -- usado pelo
# deploy normal (deploy.yml, a cada deploy) e pelo workflow manual
# fix-htaccess-seguranca.yml. Regra do Leo (23/10/2026): mudança no
# .htaccess do repositório vai ao ar pelo deploy, com backup do anterior.
#
#   1. baixa o .htaccess do servidor; se for igual ao do repositório, não faz nada;
#   2. backup: cópia no servidor (.htaccess.bak_<timestamp>, não servida pelo
#      Apache) e em $RUNNER_TEMP/htaccess-antes.txt (o workflow guarda como artifact);
#   3. sobe o novo e confere byte a byte;
#   4. testa a home e uma rota do shell client-only (/carrinho). Se a ORIGEM
#      responder erro (sem o desafio anti-bot do Cloudflare, que é normal para o
#      IP do runner), restaura o backup e termina com erro.
#
# Variáveis: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD. Saída 0 = no ar (aplicado ou
# já igual); 1 = falhou (com o anterior restaurado quando deu para restaurar).
set -euo pipefail

REPO_HTACCESS="deploy/htaccess-producao"
TMP="${RUNNER_TEMP:-/tmp}"
ANTES="$TMP/htaccess-antes.txt"
DEPOIS="$TMP/htaccess-depois.txt"

ftp() {
  lftp -u "$FTP_USERNAME,$FTP_PASSWORD" "ftp://$FTP_SERVER" <<EOF
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set net:timeout 15
set net:max-retries 3
set cmd:fail-exit yes
cd public_html
$1
bye
EOF
}

ftp "get .htaccess -o $ANTES"
test -s "$ANTES" || { echo "::error::não consegui baixar o .htaccess do servidor (vazio) -- nada foi alterado"; exit 1; }

if cmp -s "$ANTES" "$REPO_HTACCESS"; then
  echo ".htaccess no ar já é igual a $REPO_HTACCESS -- nada a fazer."
  echo "aplicado=nao" >> "${GITHUB_OUTPUT:-/dev/null}"
  exit 0
fi

BACKUP=".htaccess.bak_$(date -u +%Y%m%dT%H%M%SZ)"
echo "--- diff (no ar -> repositório) ---"
diff -u "$ANTES" "$REPO_HTACCESS" || true
echo "---"
# cópia, nunca "mv": se o put seguinte falhar, o site não fica sem .htaccess
ftp "put $ANTES -o $BACKUP"
echo "Backup gravado no servidor: public_html/$BACKUP ($(wc -c < "$ANTES") bytes)"
echo "aplicado=sim" >> "${GITHUB_OUTPUT:-/dev/null}"
echo "backup=$BACKUP" >> "${GITHUB_OUTPUT:-/dev/null}"

restaurar() {
  echo "::error::$1 -- restaurando o .htaccess anterior ($BACKUP)"
  if ftp "put $ANTES -o .htaccess"; then
    echo "::error title=.htaccess NÃO aplicado::$1. O anterior foi restaurado (public_html/$BACKUP). Corrigir deploy/htaccess-producao e fazer novo deploy."
  else
    echo "::error title=.htaccess quebrado e restauração falhou::$1. Restaurar à mão: dentro de public_html, put $BACKUP -o .htaccess (ou o artifact htaccess-backup)."
  fi
  exit 1
}

ftp "put $REPO_HTACCESS -o .htaccess" || restaurar "falha no upload"
ftp "get .htaccess -o $DEPOIS" || restaurar "falha ao baixar para conferir"
cmp -s "$DEPOIS" "$REPO_HTACCESS" || restaurar ".htaccess no servidor diferente do repositório depois do upload"
echo "Conferido byte a byte: public_html/.htaccess é igual a $REPO_HTACCESS."

# a origem responde? (o desafio do Cloudflare para o runner vale como "não deu para conferir")
for caminho in / /carrinho; do
  ok=0
  for tentativa in 1 2 3 4 5; do
    headers="$TMP/htaccess-headers.txt"
    status=$(curl -s -D "$headers" -o /dev/null -w "%{http_code}" --max-time 15 "https://meubairroburitis.com.br$caminho" || true)
    if [ "$status" = "200" ]; then
      echo "$caminho respondeu 200 com o .htaccess novo."
      ok=1; break
    fi
    if grep -qiE '^cf-mitigated:[[:space:]]*challenge' "$headers" 2>/dev/null; then
      echo "::warning::$caminho: Cloudflare respondeu com desafio anti-bot ao runner (status $status) -- origem não conferível daqui; .htaccess aplicado e conferido byte a byte. Testar de fora."
      ok=1; break
    fi
    echo "$caminho: tentativa $tentativa, status $status"
    sleep 5
  done
  [ "$ok" = 1 ] || restaurar "$caminho respondeu $status depois do .htaccess novo"
done

echo "::notice title=.htaccess aplicado::Mudança no .htaccess no ar. Backup do anterior: public_html/$BACKUP (e artifact htaccess-backup)."
