import { redirect } from 'next/navigation'
import { getCurrentUserOrNull } from '@/lib/auth'
import { dashboardPathForRole } from '@/lib/auth'
import { ConfigError } from '@/components/ConfigError'
import { isSupabaseConfigured } from '@/lib/supabase/server'

/**
 * `/dashboard` — universal redirect to the user's role-based dashboard.
 * Falls through to a config-error UI when Supabase isn't configured.
 */
export default async function DashboardRedirect() {
  if (!isSupabaseConfigured()) {
    return <ConfigError />
  }

  const user = await getCurrentUserOrNull()
  if (!user) redirect('/login')
  if (!user.profile) redirect('/settings?setup=1')

  redirect(dashboardPathForRole(user.profile.role))
}
