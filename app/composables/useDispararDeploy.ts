export function useDispararDeploy() {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()

  async function dispararDeploy(): Promise<boolean> {
    if (!$supabase) return false

    const { data: sessao } = await $supabase.auth.getSession()
    if (!sessao.session) return false

    try {
      const resposta = await $fetch<{ ok?: boolean; erro?: string }>(
        `${config.public.supabaseUrl}/functions/v1/disparar_deploy`,
        {
          method: 'POST',
          headers: {
            apikey: config.public.supabaseAnonKey,
            Authorization: `Bearer ${sessao.session.access_token}`,
          },
        },
      )
      return Boolean(resposta.ok)
    } catch (e) {
      console.error('Erro ao disparar deploy:', e)
      return false
    }
  }

  return { dispararDeploy }
}
