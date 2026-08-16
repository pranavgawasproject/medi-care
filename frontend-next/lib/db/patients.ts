import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizePatient } from '@/lib/supabase/normalize'
import type { Patient } from '@/lib/types'

export async function listPatients(): Promise<DbResult<Patient[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('patients')
      .select('*')
      .order('name', { ascending: true })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizePatient))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function searchPatients(
  query: string
): Promise<DbResult<Patient[]>> {
  try {
    const client = await createClient()
    const q = query.trim()
    let queryBuilder = client
      .from('patients')
      .select('*')
      .order('name', { ascending: true })

    if (q) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
      )
    }

    const { data, error } = await queryBuilder.limit(100)

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizePatient))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getPatient(id: string): Promise<DbResult<Patient | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizePatient(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getPatientByProfile(
  profileId: string
): Promise<DbResult<Patient | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('patients')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizePatient(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}
