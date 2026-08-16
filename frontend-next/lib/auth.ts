import { redirect } from 'next/navigation'
import { createClient, SupabaseConfigError } from '@/lib/supabase/server'
import type { Profile, SessionUser, UserRole } from '@/lib/types'
import { dashboardPathForRole } from '@/lib/roles'

export { dashboardPathForRole }

/**
 * Server-side auth helpers.
 *
 * All functions throw {@link SupabaseConfigError} (or return null in the
 * `OrNull` variants) when Supabase env vars aren't set, so pages can render
 * a proper configuration-error UI instead of crashing the build.
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'CONFIG' = 'UNAUTHENTICATED'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

function normalizeProfile(r: unknown): Profile {
  const row = (r ?? {}) as Partial<ProfileRow>
  return {
    id: String(row.id ?? ''),
    email: String(row.email ?? ''),
    full_name: row.full_name ?? null,
    role: (row.role as UserRole) ?? 'patient',
    avatar_url: row.avatar_url ?? null,
    phone: row.phone ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
}

/**
 * Returns the currently logged-in user + their profile, or `null` if not
 * authenticated. Throws {@link SupabaseConfigError} if Supabase isn't
 * configured.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  let client
  try {
    client = await createClient()
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      throw new AuthError(err.message, 'CONFIG')
    }
    throw err
  }

  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) return null

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) {
    // Profile row not yet created — return a minimal session so the user can
    // be redirected to a profile-setup page if needed.
    return {
      id: user.id,
      email: user.email ?? '',
      profile: null,
    }
  }

  return {
    id: user.id,
    email: user.email ?? '',
    profile: normalizeProfile(data),
  }
}

/** Same as {@link getCurrentUser} but returns `null` when Supabase isn't configured. */
export async function getCurrentUserOrNull(): Promise<SessionUser | null> {
  try {
    return await getCurrentUser()
  } catch (err) {
    if (err instanceof AuthError && err.code === 'CONFIG') return null
    throw err
  }
}

/**
 * Throws {@link AuthError} if the current user doesn't have the given role.
 * Call at the top of every role-specific Server Component.
 */
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthError('You must sign in to continue.', 'UNAUTHENTICATED')
  }

  if (!user.profile) {
    throw new AuthError(
      'Your profile is not yet set up. Please contact an administrator.',
      'FORBIDDEN'
    )
  }

  if (user.profile.role !== role && user.profile.role !== 'admin') {
    throw new AuthError(
      `This area is restricted to ${role}s.`,
      'FORBIDDEN'
    )
  }

  return user
}

/**
 * Redirects unauthenticated users to `/login` and authenticated users with
 * the wrong role to their own dashboard. Returns the resolved `SessionUser`
 * on success.
 */
export async function requireRoleOrRedirect(role: UserRole): Promise<SessionUser> {
  try {
    return await requireRole(role)
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === 'UNAUTHENTICATED') {
        redirect('/login')
      }
      if (err.code === 'FORBIDDEN') {
        // Send them to their own dashboard instead of showing an error page.
        const user = await getCurrentUserOrNull()
        redirect(dashboardPathForRole(user?.profile?.role))
      }
      if (err.code === 'CONFIG') {
        // Re-throw so the page can render the config-error UI.
        throw err
      }
    }
    throw err
  }
}
