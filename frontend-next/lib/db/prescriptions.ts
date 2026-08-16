import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizePrescription, normalizePrescriptionItem } from '@/lib/supabase/normalize'
import type { Prescription } from '@/lib/types'
import type {
  PrescriptionInput,
  PrescriptionPatch,
} from '@/lib/validations/prescription'
import { createAuditLog } from '@/lib/db/audit-logs'
import { createNotification } from '@/lib/db/notifications'

export async function listPrescriptions(): Promise<DbResult<Prescription[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('prescriptions')
      .select('*, items:prescription_items(*)')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizePrescription))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function listPrescriptionsForPatient(
  patientId: string
): Promise<DbResult<Prescription[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('prescriptions')
      .select('*, items:prescription_items(*)')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizePrescription))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function listPrescriptionsForDoctor(
  doctorId: string
): Promise<DbResult<Prescription[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('prescriptions')
      .select('*, items:prescription_items(*)')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizePrescription))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getPrescription(
  id: string
): Promise<DbResult<Prescription | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('prescriptions')
      .select('*, items:prescription_items(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizePrescription(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function createPrescription(
  input: PrescriptionInput,
  actorId: string
): Promise<DbResult<Prescription>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('prescriptions')
      .insert({
        patient_id: input.patient_id,
        doctor_id: actorId,
        diagnosis: input.diagnosis,
        notes: input.notes || null,
        status: input.status,
      })
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }

    const prescription = normalizePrescription(data)

    if (input.items.length > 0) {
      const { error: itemsError } = await client
        .from('prescription_items')
        .insert(
          input.items.map((i) => ({
            prescription_id: prescription.id,
            medication_name: i.medication_name,
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
            instructions: i.instructions || null,
          }))
        )

      if (itemsError) {
        return { data: null, error: fromPostgrestError(itemsError) }
      }
    }

    await createAuditLog({
      actor_id: actorId,
      action: 'prescription.create',
      entity_type: 'prescription',
      entity_id: prescription.id,
      metadata: { diagnosis: input.diagnosis, item_count: input.items.length },
    })

    await createNotification({
      user_id: input.patient_id,
      type: 'prescription_created',
      title: 'New prescription',
      message: `You have a new prescription for ${input.diagnosis}.`,
      data: { prescription_id: prescription.id },
    })

    const full = await getPrescription(prescription.id)
    return full.data ? ok(full.data) : ok(prescription)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function updatePrescription(
  id: string,
  patch: PrescriptionPatch,
  actorId: string
): Promise<DbResult<Prescription>> {
  try {
    const client = await createClient()
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.status) update.status = patch.status
    if (patch.notes !== undefined) update.notes = patch.notes

    const { data, error } = await client
      .from('prescriptions')
      .update(update)
      .eq('id', id)
      .select('*, items:prescription_items(*)')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }

    await createAuditLog({
      actor_id: actorId,
      action: 'prescription.update',
      entity_type: 'prescription',
      entity_id: id,
      metadata: { ...patch },
    })

    return ok(normalizePrescription(data))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function deletePrescription(
  id: string,
  actorId: string
): Promise<DbResult<{ id: string }>> {
  try {
    const client = await createClient()
    const { error } = await client.from('prescriptions').delete().eq('id', id)

    if (error) return { data: null, error: fromPostgrestError(error) }

    await createAuditLog({
      actor_id: actorId,
      action: 'prescription.delete',
      entity_type: 'prescription',
      entity_id: id,
      metadata: {},
    })

    return ok({ id })
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

// Re-export for convenience
export { normalizePrescriptionItem }
