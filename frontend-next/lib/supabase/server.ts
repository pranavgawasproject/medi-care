import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Error thrown when Supabase environment variables are missing. Callers should
 * catch this and surface a "Service unavailable" UI rather than crashing the
 * Server Component.
 */
export class SupabaseConfigError extends Error {
  constructor(message = 'Supabase is not configured.') {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 *
 * Throws {@link SupabaseConfigError} when env vars are missing so the caller
 * can render a clear configuration error UI. NEVER silently falls back to fake
 * data — that's what made the legacy app a demo, not a product.
 *
 * `cookies()` is async in Next.js 15 — this function is therefore async.
 */
export async function createClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new SupabaseConfigError(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
    global: {
      headers: { 'x-my-custom-header': 'medi-care' },
    },
  })
}

/**
 * Non-throwing variant for code paths that want to short-circuit gracefully
 * (e.g. middleware that should pass through when the app isn't configured yet).
 *
 * Returns `null` when env vars are missing — DOES NOT fall back to seed data.
 */
export async function createClientOrNull(): Promise<SupabaseClient | null> {
  try {
    return await createClient()
  } catch {
    return null
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
