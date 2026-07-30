export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return
  if (to.path === '/admin/login') return

  const { $supabase } = useNuxtApp()
  if (!$supabase) return navigateTo('/admin/login')

  const { data: { session } } = await $supabase.auth.getSession()
  if (!session) return navigateTo('/admin/login')

  const { data: souAdmin } = await $supabase.rpc('is_admin')
  if (!souAdmin) {
    await $supabase.auth.signOut()
    return navigateTo('/admin/login')
  }
})
