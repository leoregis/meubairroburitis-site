import type { SupabaseClient } from '@supabase/supabase-js'

// Clientes do Supabase sob demanda (redesign, item 1 da fase 5, aprovado pelo
// Leo em 30/10/2026). Antes, plugins/supabase.ts e plugins/supabase-meubairro-app.ts
// criavam os dois clientes completos (Auth, Realtime...) na abertura de TODA
// página, e o supabase-js ia junto no JS inicial -- era o maior peso do LCP no
// celular. Agora o supabase-js só é baixado quando alguma tela precisa dele
// (admin, carrinho/pedido, Meus pedidos, /links, busca) ou no build.
//
// Uso: chamar useSupabaseSite()/useSupabaseGuia() no setup (precisa do
// contexto do Nuxt para ler o runtimeConfig) e, na hora de usar,
// `const supabase = await obterSupabase()`. Devolve null sem URL/chave
// configuradas, como os plugins faziam.
//
// Um cliente por projeto, guardado no módulo: no navegador é o mesmo cliente
// para a página toda (a sessão do admin fica nele, como antes); no build ele
// só faz leituras anônimas.

let clienteSite: Promise<SupabaseClient | null> | null = null
let clienteGuia: Promise<SupabaseClient | null> | null = null

async function criar(url: string, chave: string): Promise<SupabaseClient | null> {
  if (!url || !chave) return null
  const { createClient } = await import('@supabase/supabase-js')
  // no servidor (build), o Node 20 não tem WebSocket nativo, e o supabase-js
  // sempre instancia um RealtimeClient no construtor mesmo sem uso de
  // realtime -- precisa do polyfill `ws` só no server.
  const transport = import.meta.server ? (await import('ws')).default : undefined
  return createClient(url, chave, {
    realtime: transport ? { transport: transport as never } : undefined,
  })
}

// projeto do site (notícias, produtos, pedidos, admin)
export function useSupabaseSite() {
  const config = useRuntimeConfig()
  return () => (clienteSite ??= criar(config.public.supabaseUrl, config.public.supabaseAnonKey))
}

// projeto do meubairro-app / Guia: só leitura anônima (empresas, prestadores)
export function useSupabaseGuia() {
  const config = useRuntimeConfig()
  return () => (clienteGuia ??= criar(config.public.meubairroAppSupabaseUrl, config.public.meubairroAppSupabaseAnonKey))
}
