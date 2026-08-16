import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizeAuditLog } from '@/lib/supabase/normalize'
import type { AuditLog } from '@/lib/types'

export async function listAuditLogs(
  limit = 100
): Promise<DbResult<AuditLog[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeAuditLog))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export interface CreateAuditLogInput {
  actor_id: string
  action: string
  entity_type?: string | null
  entity_id?: string | null
  metadata?: Record<string, unknown>
  ip_address?: string | null
}

export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<DbResult<AuditLog | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('audit_logs')
      .insert({
        actor_id: input.actor_id,
        action: input.action,
        entity_type: input.entity_type ?? null,
        entity_id: input.entity_id ?? null,
        metadata: input.metadata ?? {},
        ip_address: input.ip_address ?? null,
      })
      .select('*')
      .single()

    if (error) {
      // Audit log failures shouldn't fail the parent mutation. Surface as a
      // non-fatal error result.
      return ok(null)
    }
    return ok(normalizeAuditLog(data))
  } catch {
    return ok(null)
  }
}
