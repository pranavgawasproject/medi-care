import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizeMedicalRecord } from '@/lib/supabase/normalize'
import type { MedicalRecord } from '@/lib/types'
import type {
  MedicalRecordInput,
  MedicalRecordPatch,
} from '@/lib/validations/medical-record'
import { createAuditLog } from '@/lib/db/audit-logs'

export async function listMedicalRecordsForPatient(
  patientId: string
): Promise<DbResult<MedicalRecord[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeMedicalRecord))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getMedicalRecord(
  id: string
): Promise<DbResult<MedicalRecord | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizeMedicalRecord(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function createMedicalRecord(
  input: MedicalRecordInput,
  actorId: string
): Promise<DbResult<MedicalRecord>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('medical_records')
      .insert({
        patient_id: input.patient_id,
        doctor_id: actorId,
        record_type: input.record_type,
        title: input.title,
        description: input.description || null,
        record_date: input.record_date,
        attachments: input.attachments ?? [],
      })
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }

    const record = normalizeMedicalRecord(data)

    await createAuditLog({
      actor_id: actorId,
      action: 'medical_record.create',
      entity_type: 'medical_record',
      entity_id: record.id,
      metadata: { record_type: input.record_type, title: input.title },
    })

    return ok(record)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function updateMedicalRecord(
  id: string,
  patch: MedicalRecordPatch,
  actorId: string
): Promise<DbResult<MedicalRecord>> {
  try {
    const client = await createClient()
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.record_type) update.record_type = patch.record_type
    if (patch.title) update.title = patch.title
    if (patch.description !== undefined) update.description = patch.description
    if (patch.record_date) update.record_date = patch.record_date
    if (patch.attachments !== undefined) update.attachments = patch.attachments

    const { data, error } = await client
      .from('medical_records')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }

    await createAuditLog({
      actor_id: actorId,
      action: 'medical_record.update',
      entity_type: 'medical_record',
      entity_id: id,
      metadata: { ...patch },
    })

    return ok(normalizeMedicalRecord(data))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function deleteMedicalRecord(
  id: string,
  actorId: string
): Promise<DbResult<{ id: string }>> {
  try {
    const client = await createClient()
    const { error } = await client.from('medical_records').delete().eq('id', id)

    if (error) return { data: null, error: fromPostgrestError(error) }

    await createAuditLog({
      actor_id: actorId,
      action: 'medical_record.delete',
      entity_type: 'medical_record',
      entity_id: id,
      metadata: {},
    })

    return ok({ id })
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}
