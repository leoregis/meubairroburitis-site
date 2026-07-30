import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const configurado = Boolean(config.public.supabaseUrl && config.public.supabaseAnonKey)

  let supabase: SupabaseClient | null = null

  if (configurado) {
    // no servidor (SSR/build), o Node 20 não tem WebSocket nativo, e o
    // supabase-js sempre instancia um RealtimeClient no construtor mesmo
    // sem uso de realtime — precisa do polyfill `ws` só no server.
    const transport = import.meta.server ? (await import('ws')).default : undefined

    supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
      realtime: transport ? { transport: transport as never } : undefined,
    })
  }

  return {
    provide: { supabase },
  }
})
