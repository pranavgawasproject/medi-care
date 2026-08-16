import { redirect } from 'next/navigation'
import { getCurrentUserOrNull, dashboardPathForRole } from '@/lib/auth'
import { AppShell } from '@/components/AppShell'
import { ConfigError } from '@/components/ConfigError'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { countUnread } from '@/lib/db/notifications'

/**
 * All authenticated pages are dynamic — they depend on the user's session
 * and cannot be statically prerendered. This also prevents Next.js from
 * trying to evaluate Client Component event-handler props at build time.
 */
export const dynamic = 'force-dynamic'

/**
 * Authenticated app shell — sidebar + header layout shared by every role's
 * dashboard. If the user isn't logged in, redirect to /login (the middleware
 * already does this, but the layout also guards against direct renders).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isSupabaseConfigured()) {
    return <ConfigError />
  }

  const user = await getCurrentUserOrNull()

  if (!user) redirect('/login')

  // No profile row yet — the auth trigger normally handles this, but if it
  // hasn't fired (e.g. legacy users), drop them on the settings page so they
  // can complete their profile.
  if (!user.profile) redirect('/settings?setup=1')

  const unreadRes = await countUnread(user.id)
  const unread = unreadRes.data ?? 0

  return (
    <AppShell
      profile={user.profile}
      email={user.email}
      unreadCount={unread}
    >
      {children}
    </AppShell>
  )
}

// Reference dashboardPathForRole so it's not flagged unused — kept for
// downstream redirects inside the (app) group.
void dashboardPathForRole
