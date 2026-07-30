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
 * Consulta pública e minimalista do status de um pedido — só devolve
 * `status`, nunca dados do comprador/valor/itens. Exige a `idempotency_key`
 * exata (um UUID gerado no client e nunca exposto em nenhuma outra rota)
 * como prova de posse, já que `pedidos` não tem policy de select pra
 * anon/authenticated.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { pedido_id, idempotency_key } = await req.json();
    if (!pedido_id || !idempotency_key) return json({ erro: "Dados incompletos" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data } = await supabase
      .from("pedidos")
      .select("status")
      .eq("id", pedido_id)
      .eq("idempotency_key", idempotency_key)
      .maybeSingle();

    if (!data) return json({ erro: "Pedido não encontrado" }, 404);
    return json({ status: data.status });
  } catch (e) {
    console.error("consultar_pagamento erro:", e);
    return json({ erro: "Erro inesperado" }, 500);
  }
});
