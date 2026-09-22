import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Fase 4 -- segundo client, projeto Supabase do meubairro-app (SEPARADO do
// projeto do site, ver app/plugins/supabase.ts). Usado só de leitura
// (anon) pelas RPCs públicas de SEO buscar_empresa_publica_seo/
// buscar_prestador_publico_seo -- nenhuma escrita.
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const configurado = Boolean(config.public.meubairroAppSupabaseUrl && config.public.meubairroAppSupabaseAnonKey)

  let meubairroApp: SupabaseClient | null = null

  if (configurado) {
    // mesmo motivo do plugin supabase.ts: Node 20 não tem WebSocket nativo,
    // e o supabase-js sempre instancia um RealtimeClient no construtor.
    const transport = import.meta.server ? (await import('ws')).default : undefined

    meubairroApp = createClient(config.public.meubairroAppSupabaseUrl, config.public.meubairroAppSupabaseAnonKey, {
      realtime: transport ? { transport: transport as never } : undefined,
    })
  }

  return {
    provide: { meubairroApp },
  }
})
