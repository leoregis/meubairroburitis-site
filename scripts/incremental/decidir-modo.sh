#!/usr/bin/env bash
# Build incremental (etapa 3, 09/out): decide se este deploy pode ser
# parcial. Escreve "modo=incremental" ou "modo=completo" (e o motivo) em
# $GITHUB_OUTPUT. Na dúvida, completo -- é o build de sempre.
#
# Entradas (ambiente):
#   DEPLOY_MODO   variável do repositório; só "incremental" liga o modo parcial
#   EVENTO        github.event_name (só workflow_dispatch tem itens)
#   MODO_PEDIDO   input "modo" (completo força completo)
#   ROTAS         JSON de rotas-afetadas.mjs
#   NO_AR         conteúdo de _current/_build.txt (vazio se não deu pra ler)
#   MBB_BUILD_ID  buildId deste código
#   GITHUB_SHA, GITHUB_RUN_ID, GITHUB_REPOSITORY, GH_TOKEN
set -uo pipefail

decide() {
  echo "modo=$1" >> "$GITHUB_OUTPUT"
  echo "motivo=$2" >> "$GITHUB_OUTPUT"
  echo "Modo do deploy: $1 -- $2"
  echo "### Modo do deploy: $1" >> "$GITHUB_STEP_SUMMARY"
  echo "$2" >> "$GITHUB_STEP_SUMMARY"
  exit 0
}

[ "${DEPLOY_MODO:-}" = "incremental" ] || decide completo "DEPLOY_MODO não é 'incremental' (modo parcial desligado)"
[ "$EVENTO" = "workflow_dispatch" ] || decide completo "evento $EVENTO (push e agendado são sempre completos)"
[ "${MODO_PEDIDO:-auto}" = "completo" ] && decide completo "pedido com modo=completo"

# lê um campo do JSON de rotas (ex.: rota modo)
rota() { node -e 'const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const v=process.argv[2]==="contagem"?r.regerar.length+" rota(s) a regerar, "+r.remover.length+" a remover":r[process.argv[2]];console.log(v??"")' "$ROTAS" "$1"; }
modo_rotas=$(rota modo)
motivo_rotas=$(rota motivo)
[ "$modo_rotas" = "incremental" ] || decide completo "itens: $motivo_rotas"

[ -n "${NO_AR:-}" ] || decide completo "não consegui ler _current/_build.txt"
campo() { echo "$NO_AR" | tr ' ' '\n' | sed -n "s/^$1=//p" | head -1; }
commit_ar=$(campo commit)
build_ar=$(campo build_id)
run_ar=$(campo run)
[ -n "$commit_ar" ] && [ -n "$build_ar" ] && [ -n "$run_ar" ] || decide completo "_build.txt no ar sem commit/build_id/run (build anterior à etapa 1)"

# 1) mesmo código no ar: mesmo buildId e nenhuma mudança fora dos caminhos
#    que não entram no build (os mesmos do paths-ignore do push)
[ "$build_ar" = "$MBB_BUILD_ID" ] || decide completo "buildId no ar ($build_ar) diferente do deste código ($MBB_BUILD_ID)"
if [ "$commit_ar" != "$GITHUB_SHA" ]; then
  git cat-file -e "$commit_ar^{commit}" 2>/dev/null || decide completo "commit no ar ($commit_ar) não está no histórico deste checkout"
  fora=$(git diff --name-only "$commit_ar" "$GITHUB_SHA" | grep -vE '(\.md$|^docs/|^supabase/)' || true)
  [ -z "$fora" ] || decide completo "código mudou desde o build no ar: $(echo "$fora" | head -5 | tr '\n' ' ')"
fi

# 2) nenhum deploy entre o que está no ar e este terminou sem sucesso: um
#    pedido da fila cancelado na espera (a fila do GitHub guarda só 1) ou que
#    falhou levava itens que este run não conhece
ruins=$(gh api "repos/$GITHUB_REPOSITORY/actions/workflows/${WORKFLOW_ARQ:-deploy.yml}/runs?per_page=50" \
  --jq ".workflow_runs[] | select(.id > $run_ar and .id < $GITHUB_RUN_ID and .status == \"completed\" and .conclusion != \"success\") | \"\(.id) \(.conclusion)\"" 2>/dev/null) \
  || decide completo "não consegui consultar os deploys anteriores"
[ -z "$ruins" ] || decide completo "deploy anterior sem sucesso desde o build no ar: $(echo "$ruins" | head -3 | tr '\n' ' ')"

echo "run_no_ar=$run_ar" >> "$GITHUB_OUTPUT"
decide incremental "mesmo código no ar (buildId $MBB_BUILD_ID), $(rota contagem)"
