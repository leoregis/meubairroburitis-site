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
#   4. testa / e /carrinho DIRETO NO SERVIDOR DE ORIGEM (24/10: curl --resolve para
#      o IP do FTP_SERVER, sem passar pelo Cloudflare, que desafia o IP do runner).
#      Erro da origem = restaura o backup e termina com erro. Se a origem não for
#      alcançável (ou não parecer o site), cai no teste pelo Cloudflare, onde o
#      desafio anti-bot vira só aviso.
#
# O IP da origem nunca aparece no log (::add-mask::; o repositório é público).
#
# Uso: bash deploy/aplicar-htaccess.sh            (aplica se mudou)
#      bash deploy/aplicar-htaccess.sh --so-testar (só o teste do passo 4, sem mexer em nada)
# Variáveis: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD. Saída 0 = no ar (aplicado,
# já igual ou teste OK); 1 = falhou (com o anterior restaurado quando deu para restaurar).
set -euo pipefail

REPO_HTACCESS="deploy/htaccess-producao"
TMP="${RUNNER_TEMP:-/tmp}"
ANTES="$TMP/htaccess-antes.txt"
DEPOIS="$TMP/htaccess-depois.txt"
DOMINIO="meubairroburitis.com.br"

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

# IP da origem (o host do FTP é a mesma hospedagem), mascarado no log
ORIGEM_IP=""
descobrir_origem() {
  local host="${FTP_SERVER#ftp://}"
  host="${host%%/*}"; host="${host%%:*}"
  if [[ "$host" =~ ^[0-9]+(\.[0-9]+){3}$ ]]; then
    ORIGEM_IP="$host"
  else
    ORIGEM_IP=$(getent ahostsv4 "$host" 2>/dev/null | awk 'NR==1 {print $1}' || true)
  fi
  if [ -n "$ORIGEM_IP" ]; then echo "::add-mask::$ORIGEM_IP"; fi
}

# status da origem para o caminho; "sem_origem" se não alcançou ou não é o site
status_origem() {
  local caminho="$1" headers="$TMP/origem-headers.txt" corpo="$TMP/origem-corpo.txt" status
  [ -n "$ORIGEM_IP" ] || { echo "sem_origem"; return; }
  # -k: só uma consulta de status ao próprio servidor (o certificado da origem
  # pode ser o de origem do Cloudflare); nenhum dado secreto vai no pedido
  status=$(curl -sk --max-time 15 --resolve "$DOMINIO:443:$ORIGEM_IP" -D "$headers" -o "$corpo" \
    -w "%{http_code}" "https://$DOMINIO$caminho" 2>/dev/null || true)
  if [ -z "$status" ] || [ "$status" = "000" ] || grep -qi '^cf-ray:' "$headers" 2>/dev/null; then
    echo "sem_origem"; return
  fi
  # resposta de erro não precisa ter o nome do site; 200 precisa (senão não é o nosso vhost)
  if [ "$status" = "200" ] && ! grep -qi 'Meu Bairro Buritis' "$corpo" 2>/dev/null; then
    echo "sem_origem"; return
  fi
  echo "$status"
}

# testa / e /carrinho; devolve 0 (ok) ou 1 (com a mensagem em $FALHA)
FALHA=""
testar_site() {
  local caminho status ok tentativa headers
  descobrir_origem
  for caminho in / /carrinho; do
    ok=0
    for tentativa in 1 2 3 4 5; do
      status=$(status_origem "$caminho")
      if [ "$status" = "200" ]; then
        echo "$caminho: a origem respondeu 200 (direto no servidor, sem o Cloudflare)."
        ok=1; break
      fi
      if [ "$status" != "sem_origem" ]; then
        echo "$caminho: tentativa $tentativa, a origem respondeu $status"
        sleep 5; continue
      fi
      # origem não alcançável daqui: teste pelo Cloudflare (desafio = aviso)
      headers="$TMP/htaccess-headers.txt"
      status=$(curl -s -D "$headers" -o /dev/null -w "%{http_code}" --max-time 15 "https://$DOMINIO$caminho" || true)
      if [ "$status" = "200" ]; then
        echo "::warning::$caminho: origem não alcançável direto; pelo Cloudflare respondeu 200."
        ok=1; break
      fi
      if grep -qiE '^cf-mitigated:[[:space:]]*challenge' "$headers" 2>/dev/null; then
        echo "::warning::$caminho: origem não alcançável direto e o Cloudflare respondeu com desafio anti-bot (status $status) -- não deu para conferir daqui. Testar de fora."
        ok=1; break
      fi
      echo "$caminho: tentativa $tentativa, pelo Cloudflare: $status"
      sleep 5
    done
    if [ "$ok" != 1 ]; then FALHA="$caminho respondeu $status"; return 1; fi
  done
  return 0
}

if [ "${1:-}" = "--so-testar" ]; then
  testar_site || { echo "::error::teste falhou: $FALHA"; exit 1; }
  echo "Teste OK (nada foi alterado)."
  exit 0
fi

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

testar_site || restaurar "$FALHA depois do .htaccess novo"

echo "::notice title=.htaccess aplicado::Mudança no .htaccess no ar. Backup do anterior: public_html/$BACKUP (e artifact htaccess-backup)."
