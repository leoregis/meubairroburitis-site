// 22/out (projeto "Meus pedidos", fatia 3): o visitante pede o código de acesso
// ao /meus-pedidos. O banco decide (meus_pedidos_preparar_codigo: número válido,
// limites por número e por IP, teto do dia, número com pedidos) e gera o código;
// o envio pelo WhatsApp é da função codigo-meus-pedidos do Guia (que tem o token
// da Meta), com o segredo MEUS_PEDIDOS_SEGREDO.
//
// A resposta é a mesma quando o número tem pedidos e quando não tem, e sai antes
// do envio (EdgeRuntime.waitUntil): nem o texto nem o tempo dizem se o número
// comprou. Só "telefone inválido" e "limite" respondem diferente.
//
// MEUS_PEDIDOS_PERMITIDOS (só no período de teste): números normalizados
// separados por vírgula; com ela preenchida, só esses recebem código. Vazia ou
// ausente = aberto a todos.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";
import { normalizarTelefone } from "../_shared/telefone.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

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

// deno-lint-ignore no-explicit-any
async function enviarPeloGuia(supabase: any, telefone: string, codigo: string, id: number) {
  try {
    const r = await fetch(Deno.env.get("GUIA_CODIGO_URL")!, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mbb-segredo": Deno.env.get("MEUS_PEDIDOS_SEGREDO") ?? "" },
      body: JSON.stringify({ telefone, codigo }),
    });
    if (r.ok) return;
    console.error(`meus_pedidos_codigo: envio pelo Guia falhou (HTTP ${r.status}) para ***${telefone.slice(-4)}`);
  } catch (e) {
    console.error("meus_pedidos_codigo: erro de rede no envio pelo Guia:", e);
  }
  await supabase.rpc("meus_pedidos_codigo_nao_enviado", { p_id: id });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ erro: "metodo" }, 405);

  try {
    const corpo = await req.json().catch(() => ({}));
    const telefone = normalizarTelefone(String(corpo?.telefone ?? ""));
    if (!telefone) return json({ erro: "telefone_invalido" }, 400);

    const permitidos = (Deno.env.get("MEUS_PEDIDOS_PERMITIDOS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (permitidos.length && !permitidos.includes(telefone)) return json({ ok: true });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const origem = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const { data, error } = await supabase.rpc("meus_pedidos_preparar_codigo", { p_telefone: telefone, p_origem: origem });
    if (error) {
      console.error("meus_pedidos_codigo: preparar falhou:", error.message);
      return json({ erro: "indisponivel" }, 500);
    }

    if (data.status === "invalido") return json({ erro: "telefone_invalido" }, 400);
    if (data.status === "limite") return json({ erro: "limite", minutos: data.minutos }, 429);
    if (data.status === "enviar") EdgeRuntime.waitUntil(enviarPeloGuia(supabase, data.telefone, data.codigo, data.id));
    return json({ ok: true });
  } catch (e) {
    console.error("meus_pedidos_codigo erro:", e);
    return json({ erro: "indisponivel" }, 500);
  }
});
