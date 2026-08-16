import type { UserRole } from '@/lib/types'

/**
 * Returns the dashboard path for the user's role. Pure utility — safe to
 * import from both Client and Server Components (does NOT touch `next/headers`
 * or the Supabase server client).
 */
export function dashboardPathForRole(
  role: UserRole | undefined | null
): string {
  switch (role) {
    case 'doctor':
      return '/doctor'
    case 'admin':
      return '/admin'
    case 'patient':
    default:
      return '/patient'
  }
}
