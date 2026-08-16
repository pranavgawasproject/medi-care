import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizeDoctor } from '@/lib/supabase/normalize'
import type { Doctor } from '@/lib/types'

export async function listDoctors(): Promise<DbResult<Doctor[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('doctors')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeDoctor))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getDoctor(id: string): Promise<DbResult<Doctor | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('doctors')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizeDoctor(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getDoctorByProfile(
  profileId: string
): Promise<DbResult<Doctor | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('doctors')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizeDoctor(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}
