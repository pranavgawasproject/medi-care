import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizeProfile } from '@/lib/supabase/normalize'
import type { Profile } from '@/lib/types'
import type { ProfileInput } from '@/lib/validations/profile'
/** Fetch a single profile by its `auth.users.id`. */
export async function getProfile(
  userId: string
): Promise<DbResult<Profile | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizeProfile(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

/** Fetch all profiles — admin only (RLS enforces). */
export async function listProfiles(): Promise<DbResult<Profile[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeProfile))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function updateProfile(
  userId: string,
  patch: ProfileInput
): Promise<DbResult<Profile>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('profiles')
      .update({
        full_name: patch.full_name,
        phone: patch.phone || null,
        avatar_url: patch.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(normalizeProfile(data))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}
