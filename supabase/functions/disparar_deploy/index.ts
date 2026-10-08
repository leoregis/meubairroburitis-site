import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// duração típica de um deploy (build + envio + swap + purga), em minutos --
// depois que a limpeza de releases saiu do caminho (08/out)
const DURACAO_DEPLOY_MIN = 40;
// calma de 3 min + cron a cada 2 min (ver deploy_fila_pronto)
const ESPERA_FILA_MIN = 5;

/**
 * Pede publicação do site -- chamado pelo admin (/admin/noticias,
 * /admin/produtos) quando algo PÚBLICO muda (publicar, despublicar,
 * editar ou excluir algo publicado/ativo; rascunho nunca chama).
 *
 * Desde 08/out NÃO chama mais o GitHub na hora: registra o pedido na fila
 * (deploy_fila). O pg_cron deploy_fila_processar dispara o deploy quando
 * o último pedido tem 3 min sem pedido novo (rajada vira 1 deploy) --
 * ver a migration 20261008180000 e a function disparar_deploy_fila.
 *
 * Só admins autenticados podem chamar -- valida o JWT do chamador contra
 * is_admin() (mesmo padrão de /admin/vendas), nunca aceita a anon key
 * sozinha como "autenticação" aqui.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ erro: "Não autenticado" }, 401);

    const supabaseUsuario = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: souAdmin, error: erroAdmin } = await supabaseUsuario.rpc("is_admin");
    if (erroAdmin || !souAdmin) {
      return json({ erro: "Acesso negado" }, 403);
    }

    let motivo = "admin";
    try {
      const corpo = await req.json();
      if (typeof corpo?.motivo === "string" && corpo.motivo.trim()) motivo = corpo.motivo.trim();
    } catch { /* corpo vazio: motivo genérico */ }

    const supabaseServico = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: erroFila } = await supabaseServico.rpc("deploy_fila_solicitar", { p_motivo: motivo });
    if (erroFila) {
      console.error("disparar_deploy: erro registrando pedido na fila", erroFila);
      return json({ erro: "Não foi possível agendar a publicação" }, 500);
    }

    return json({ ok: true, agendado: true, previsaoMinutos: await estimarMinutos() });
  } catch (e) {
    console.error("disparar_deploy erro:", e);
    return json({ erro: "Erro inesperado" }, 500);
  }
});

// Previsão grosseira de quando a mudança entra no ar: espera da fila, mais o
// que falta do deploy em andamento (se houver), mais um deploy inteiro.
// Um run "queued" não soma -- o nosso substitui ele na fila do GitHub.
async function estimarMinutos(): Promise<number> {
  let restanteEmAndamento = 0;
  const ghToken = Deno.env.get("GH_DISPATCH_TOKEN");
  const repo = Deno.env.get("GH_REPO") || "leoregis/meubairroburitis-site";
  if (ghToken) {
    try {
      const r = await fetch(
        `https://api.github.com/repos/${repo}/actions/workflows/deploy.yml/runs?status=in_progress&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "meubairroburitis-admin",
          },
        },
      );
      if (r.ok) {
        const dados = await r.json();
        const inicio = dados?.workflow_runs?.[0]?.run_started_at;
        if (inicio) {
          const decorrido = (Date.now() - new Date(inicio).getTime()) / 60000;
          restanteEmAndamento = Math.max(0, DURACAO_DEPLOY_MIN - decorrido);
        }
      } else {
        await r.text();
      }
    } catch { /* sem previsão fina: usa o básico */ }
  }
  const total = Math.max(ESPERA_FILA_MIN, restanteEmAndamento) + DURACAO_DEPLOY_MIN;
  return Math.ceil(total / 5) * 5;
}
