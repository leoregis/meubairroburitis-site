export type StatusPublicacao = 'publicando' | 'ok' | 'erro' | 'sem_publicacao' | null

// Pede publicação do site. Desde 08/out o pedido entra numa fila com
// período de calma de 3 min (edge function disparar_deploy + pg_cron),
// então vários salvamentos seguidos viram 1 deploy só. Chamar só quando
// algo PÚBLICO muda (publicar, despublicar, editar/excluir algo publicado
// ou ativo) -- rascunho não muda nada no site.
export function useDispararDeploy() {
  const config = useRuntimeConfig()
  const { $supabase } = useNuxtApp()

  // aviso compartilhado entre páginas do admin: a tela de edição salva,
  // redireciona pra listagem, e a listagem mostra o aviso com a previsão
  const aviso = useState<{ status: StatusPublicacao; previsaoMinutos: number | null }>(
    'admin-aviso-publicacao',
    () => ({ status: null, previsaoMinutos: null }),
  )

  async function dispararDeploy(motivo = 'admin'): Promise<boolean> {
    aviso.value = { status: 'publicando', previsaoMinutos: null }

    if (!$supabase) {
      aviso.value = { status: 'erro', previsaoMinutos: null }
      return false
    }

    const { data: sessao } = await $supabase.auth.getSession()
    if (!sessao.session) {
      aviso.value = { status: 'erro', previsaoMinutos: null }
      return false
    }

    try {
      const resposta = await $fetch<{ ok?: boolean; erro?: string; previsaoMinutos?: number }>(
        `${config.public.supabaseUrl}/functions/v1/disparar_deploy`,
        {
          method: 'POST',
          headers: {
            apikey: config.public.supabaseAnonKey,
            Authorization: `Bearer ${sessao.session.access_token}`,
          },
          body: { motivo },
        },
      )
      const ok = Boolean(resposta.ok)
      aviso.value = { status: ok ? 'ok' : 'erro', previsaoMinutos: resposta.previsaoMinutos ?? null }
      return ok
    } catch (e) {
      console.error('Erro ao pedir publicação:', e)
      aviso.value = { status: 'erro', previsaoMinutos: null }
      return false
    }
  }

  // salvo sem nada público mudar (ex.: rascunho): avisa que não vai publicar
  function avisarSemPublicacao() {
    aviso.value = { status: 'sem_publicacao', previsaoMinutos: null }
  }

  function fecharAviso() {
    aviso.value = { status: null, previsaoMinutos: null }
  }

  return { dispararDeploy, avisarSemPublicacao, fecharAviso, aviso }
}
