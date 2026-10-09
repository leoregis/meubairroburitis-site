import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Dispara o deploy do site (workflow_dispatch do deploy.yml) a partir da
 * fila deploy_fila (08/out). Chamada só pelo pg_cron deploy_fila_processar
 * deste projeto, e só quando há pedido pronto (3 min de calma ou 15 min de
 * teto) -- nunca pelo navegador. Por isso verify_jwt fica desligado e a
 * autenticação é o header x-cron-secret, conferido contra o vault pelo
 * próprio banco (deploy_fila_confere_segredo).
 *
 * O disparo é reivindicado de forma atômica (deploy_fila_reivindicar):
 * chamadas repetidas não geram dois deploys. Se o GitHub recusar, o pedido
 * continua pendente e o cron tenta de novo em ~2 min.
 */
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const { data: segredoOk } = await supabase.rpc("deploy_fila_confere_segredo", {
    p_segredo: req.headers.get("x-cron-secret") ?? "",
  });
  if (!segredoOk) return json({ erro: "Nao autorizado" }, 401);

  const { data: reivindicadoEm, error: erroReivindicar } = await supabase.rpc("deploy_fila_reivindicar");
  if (erroReivindicar) {
    console.error("disparar_deploy_fila: erro reivindicando", erroReivindicar);
    return json({ erro: "Erro lendo a fila" }, 500);
  }
  if (!reivindicadoEm) return json({ ok: true, disparado: false, motivo: "nada pronto" });

  // 09/out (build incremental, etapa 2): os itens que mudaram vão junto no
  // disparo (input "itens" do workflow). Sem a função no banco (migration
  // ainda não aplicada) ou com lista grande demais, dispara sem itens e com
  // modo=completo -- o comportamento de antes.
  const { data: itens, error: erroItens } = await supabase.rpc("deploy_fila_itens_para_disparo", { p_ate: reivindicadoEm });
  if (erroItens) console.error("disparar_deploy_fila: sem itens (seguindo com build completo)", erroItens.message);
  let itensJson = !erroItens && Array.isArray(itens) && itens.length ? JSON.stringify(itens) : "";
  if (itensJson.length > 60000) itensJson = "";
  const inputs = { modo: itensJson ? "auto" : "completo", itens: itensJson };

  const workflow = Deno.env.get("GH_WORKFLOW") || "deploy.yml";
  const corpo = JSON.stringify({ ref: "main", inputs });

  // simulação: devolve o que seria enviado, sem chamar o GitHub. Liga sozinha
  // fora do projeto de produção do site (branch de dev nunca dispara o deploy
  // real por engano); GH_DRY_RUN=0 desliga (ex.: staging com token próprio),
  // GH_DRY_RUN=1 força.
  const naProducao = (Deno.env.get("SUPABASE_URL") || "").includes("peusailkyxqbhgdgmqyk");
  const dryRun = Deno.env.get("GH_DRY_RUN");
  if (dryRun === "1" || (!naProducao && dryRun !== "0")) {
    await supabase.rpc("deploy_fila_confirmar", { p_reivindicado_em: reivindicadoEm });
    return json({ ok: true, disparado: false, simulado: true, workflow, corpo: JSON.parse(corpo) });
  }

  const ghToken = Deno.env.get("GH_DISPATCH_TOKEN");
  const repo = Deno.env.get("GH_REPO") || "leoregis/meubairroburitis-site";
  if (!ghToken) {
    await supabase.rpc("deploy_fila_falhou", { p_erro: "GH_DISPATCH_TOKEN ausente" });
    return json({ erro: "GH_DISPATCH_TOKEN ausente" }, 500);
  }

  const respostaGh = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "meubairroburitis-fila-deploy",
      },
      body: corpo,
    },
  );

  if (!respostaGh.ok) {
    // corpo do erro do GitHub fica fora da resposta (a resposta do pg_net
    // fica em net._http_response)
    await respostaGh.text();
    console.error("disparar_deploy_fila: GitHub API recusou", respostaGh.status);
    await supabase.rpc("deploy_fila_falhou", { p_erro: `GitHub HTTP ${respostaGh.status}` });
    return json({ erro: "GitHub recusou o dispatch" }, 502);
  }

  const { error: erroConfirmar } = await supabase.rpc("deploy_fila_confirmar", { p_reivindicado_em: reivindicadoEm });
  if (erroConfirmar) {
    console.error("disparar_deploy_fila: deploy disparado, mas falhou confirmar na fila", erroConfirmar);
    return json({ erro: "Deploy disparado mas falhou confirmar na fila" }, 500);
  }

  return json({ ok: true, disparado: true });
});
