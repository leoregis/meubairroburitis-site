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

/**
 * Dispara o workflow de deploy (GitHub Actions) via workflow_dispatch --
 * chamado pelo admin de produtos (/admin/produtos) depois de qualquer
 * criação/edição/exclusão. O site é gerado estaticamente (SSG); sem isso,
 * a mudança fica só no banco e nunca aparece pro público.
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

    const ghToken = Deno.env.get("GH_DISPATCH_TOKEN");
    const repo = Deno.env.get("GH_REPO") || "leoregis/meubairroburitis-site";
    if (!ghToken) return json({ erro: "Deploy não configurado (GH_DISPATCH_TOKEN ausente)" }, 500);

    const respostaGh = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/deploy.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "meubairroburitis-admin",
        },
        body: JSON.stringify({ ref: "main" }),
      },
    );

    if (!respostaGh.ok) {
      const detalhe = await respostaGh.text();
      console.error("disparar_deploy: GitHub API recusou", respostaGh.status, detalhe);
      return json({ erro: "Não foi possível disparar o deploy", detalhe }, 502);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("disparar_deploy erro:", e);
    return json({ erro: "Erro inesperado" }, 500);
  }
});
