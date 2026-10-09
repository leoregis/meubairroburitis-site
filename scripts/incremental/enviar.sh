#!/usr/bin/env bash
# Build incremental (etapa 3, 09/out): fases do envio parcial por FTP. Usado
# pelo deploy.yml (produção, pasta public_html/_current) e pelo
# deploy-staging.yml (public_html/_staging_test) -- o mesmo código nos dois,
# pra o teste de staging valer pela produção.
#
# Uso: bash scripts/incremental/enviar.sh <fase>
#   preparar   lê do servidor o que já está no ar (_nuxt, paginação, sitemap,
#              lista de imagens), mescla o sitemap, grava o _build.txt, roda a
#              checagem de registros de teste e monta os roteiros (preparar-envio.mjs)
#   backup     baixa o que vai ser sobrescrito (pasta $DIR/backup)
#   enviar     sobe as páginas e apaga as que saíram do ar
#   conferir   confere no servidor: páginas presentes, removidas ausentes,
#              _build.txt deste run
#   restaurar  devolve os arquivos do backup
#
# Ambiente: FTP_SERVER, FTP_USERNAME, FTP_PASSWORD, ROTAS (rotas.json),
#   DIR (pasta de trabalho), MBB_REMOTO (padrão public_html/_current),
#   MBB_SITE, MBB_BUILD_ID, RUN_NO_AR, GITHUB_SHA, GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT
set -euo pipefail

fase="${1:?fase}"
REMOTO="${MBB_REMOTO:-public_html/_current}"
DIR="${DIR:?DIR}"
SAIDA=.output/public
mkdir -p "$DIR"

ftp() { lftp -u "$FTP_USERNAME,$FTP_PASSWORD" "ftp://$FTP_SERVER"; }
cabecalho() {
  printf '%s\n' 'set ftp:ssl-force true' 'set ftp:ssl-protect-data true' 'set ssl:verify-certificate no' \
    'set net:timeout 15' 'set net:max-retries 3'
}

case "$fase" in
preparar)
  { cabecalho; echo 'set cmd:fail-exit yes'; echo "cd $REMOTO/_nuxt"; echo 'cls -1'; echo bye; } | ftp > "$DIR/nuxt_remoto.txt"
  { cabecalho; echo "cd $REMOTO/noticias/pagina"; echo 'cls -1'; echo bye; } | ftp > "$DIR/paginas_remotas.txt" 2>/dev/null || true
  { cabecalho; echo 'set cmd:fail-exit yes'; echo "get $REMOTO/sitemap.xml -o $DIR/sitemap_ar.xml"
    echo 'set cmd:fail-exit no'; echo "get $REMOTO/_ipx-lista.txt -o $DIR/ipx_remoto.txt"; echo bye; } | ftp
  echo "_nuxt no ar: $(wc -l < "$DIR/nuxt_remoto.txt") arquivo(s); páginas de notícias no ar: $(tr '\n' ' ' < "$DIR/paginas_remotas.txt")"

  node scripts/incremental/mesclar-sitemap.mjs "$DIR/sitemap_ar.xml" "$ROTAS" "$SAIDA/sitemap.xml"

  echo "commit=${GITHUB_SHA} build_id=${MBB_BUILD_ID} run=${GITHUB_RUN_ID} attempt=${GITHUB_RUN_ATTEMPT} tipo=incremental base_run=${RUN_NO_AR:-}" > "$SAIDA/_build.txt"
  cat "$SAIDA/_build.txt"
  primeira=$(node scripts/incremental/primeira-rota.mjs "$ROTAS")
  grep -q "buildId:\"${MBB_BUILD_ID}\"" "$SAIDA/${primeira}index.html" \
    || { echo "ERRO: página gerada sem o buildId ${MBB_BUILD_ID}"; exit 1; }

  # mesma barreira do build completo: título ou sitemap com registro de teste
  node scripts/checar-registros-teste.mjs "$SAIDA"

  node scripts/incremental/preparar-envio.mjs "$ROTAS" "$SAIDA" "$DIR" \
    "$DIR/nuxt_remoto.txt" "$DIR/paginas_remotas.txt" "$DIR/ipx_remoto.txt"
  ;;

backup)
  ftp < "$DIR/backup.lftp" || true
  echo "Backup: $(find "$DIR/backup" -type f | wc -l) arquivo(s) baixado(s) de $REMOTO"
  test -s "$DIR/backup/_build.txt" || { echo "ERRO: backup sem _build.txt -- não sigo sem poder desfazer"; exit 1; }
  ;;

enviar)
  cat "$DIR/resumo.json"; echo
  inicio=$(date +%s)
  ftp < "$DIR/envio.lftp"
  ftp < "$DIR/remocao.lftp" || true
  echo "Envio e remoção: $(( $(date +%s) - inicio ))s"
  ;;

conferir)
  ftp < "$DIR/conferencia.lftp" > /dev/null
  echo "Todas as páginas regeradas estão em $REMOTO."
  sobrou=$(ftp < "$DIR/conferencia-remocao.lftp" 2>/dev/null || true)
  [ -z "$sobrou" ] || { echo "ERRO: páginas removidas ainda no servidor: $sobrou"; exit 1; }
  { cabecalho; echo 'set cmd:fail-exit yes'; echo "cat $REMOTO/_build.txt"; echo bye; } | ftp > "$DIR/build_remoto.txt"
  [ "$(tr -d '\r\n' < "$DIR/build_remoto.txt")" = "$(tr -d '\r\n' < "$SAIDA/_build.txt")" ] \
    || { echo "ERRO: $REMOTO/_build.txt não é deste run"; exit 1; }
  echo "$REMOTO/_build.txt: $(cat "$DIR/build_remoto.txt")"
  ;;

restaurar)
  ftp < "$DIR/restaurar.lftp"
  ;;

*)
  echo "fase desconhecida: $fase"; exit 2 ;;
esac
