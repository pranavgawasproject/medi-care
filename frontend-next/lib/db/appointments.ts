import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import {
  normalizeAppointment,
  normalizeDoctor,
  normalizePatient,
} from '@/lib/supabase/normalize'
import type { Appointment, Doctor, Patient } from '@/lib/types'
import type {
  AppointmentFilters,
  AppointmentInput,
  AppointmentPatch,
} from '@/lib/validations/appointment'
import { createAuditLog } from '@/lib/db/audit-logs'
import { createNotification } from '@/lib/db/notifications'

export interface AppointmentWithRelations extends Appointment {
  doctor?: Doctor
  patient?: Patient
}

export async function listAppointments(
  filters: AppointmentFilters
): Promise<DbResult<AppointmentWithRelations[]>> {
  try {
    const client = await createClient()
    const offset = (filters.page - 1) * filters.pageSize

    let query = client
      .from('appointments')
      .select(
        '*, doctor:doctors(*), patient:patients(*)',
        { count: 'exact' }
      )
      .order('appointment_date', { ascending: false })
      .range(offset, offset + filters.pageSize - 1)

    if (filters.status) query = query.eq('status', filters.status)

    const { data, error } = await query

    if (error) return { data: null, error: fromPostgrestError(error) }

    const rows = (data ?? []).map((row) => {
      const appt = normalizeAppointment(row)
      const r = row as {
        doctor?: unknown
        patient?: unknown
      }
      return {
        ...appt,
        doctor: r.doctor ? normalizeDoctor(r.doctor) : undefined,
        patient: r.patient ? normalizePatient(r.patient) : undefined,
      }
    })

    return ok(rows)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function listAppointmentsForPatient(
  patientId: string
): Promise<DbResult<AppointmentWithRelations[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('appointments')
      .select('*, doctor:doctors(*), patient:patients(*)')
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }

    const rows = (data ?? []).map((row) => {
      const appt = normalizeAppointment(row)
      const r = row as { doctor?: unknown; patient?: unknown }
      return {
        ...appt,
        doctor: r.doctor ? normalizeDoctor(r.doctor) : undefined,
        patient: r.patient ? normalizePatient(r.patient) : undefined,
      }
    })
    return ok(rows)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function listAppointmentsForDoctor(
  doctorId: string
): Promise<DbResult<AppointmentWithRelations[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('appointments')
      .select('*, doctor:doctors(*), patient:patients(*)')
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }

    const rows = (data ?? []).map((row) => {
      const appt = normalizeAppointment(row)
      const r = row as { doctor?: unknown; patient?: unknown }
      return {
        ...appt,
        doctor: r.doctor ? normalizeDoctor(r.doctor) : undefined,
        patient: r.patient ? normalizePatient(r.patient) : undefined,
      }
    })
    return ok(rows)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getAppointment(
  id: string
): Promise<DbResult<AppointmentWithRelations | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('appointments')
      .select('*, doctor:doctors(*), patient:patients(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    if (!data) return ok(null)

    const r = data as { doctor?: unknown; patient?: unknown }
    return ok({
      ...normalizeAppointment(data),
      doctor: r.doctor ? normalizeDoctor(r.doctor) : undefined,
      patient: r.patient ? normalizePatient(r.patient) : undefined,
    })
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function createAppointment(
  input: AppointmentInput,
  actorId: string
): Promise<DbResult<Appointment>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('appointments')
      .insert({
        patient_id: input.patient_id,
        doctor_id: input.doctor_id,
        appointment_date: input.appointment_date,
        appointment_time: input.appointment_time,
        reason: input.reason || null,
        urgency: input.urgency,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }
    const appt = normalizeAppointment(data)

    await createAuditLog({
      actor_id: actorId,
      action: 'appointment.create',
      entity_type: 'appointment',
      entity_id: appt.id,
      metadata: { ...input },
    })

    return ok(appt)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function updateAppointment(
  id: string,
  patch: AppointmentPatch,
  actorId: string
): Promise<DbResult<Appointment>> {
  try {
    const client = await createClient()
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.status) update.status = patch.status
    if (patch.appointment_date) update.appointment_date = patch.appointment_date
    if (patch.appointment_time) update.appointment_time = patch.appointment_time
    if (patch.reason !== undefined) update.reason = patch.reason
    if (patch.urgency) update.urgency = patch.urgency

    const { data, error } = await client
      .from('appointments')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }
    const appt = normalizeAppointment(data)

    await createAuditLog({
      actor_id: actorId,
      action: 'appointment.update',
      entity_type: 'appointment',
      entity_id: id,
      metadata: { ...patch },
    })

    return ok(appt)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function cancelAppointment(
  id: string,
  actorId: string
): Promise<DbResult<Appointment>> {
  const result = await updateAppointment(
    id,
    { status: 'cancelled' },
    actorId
  )

  if (result.data) {
    // Notify the patient about cancellation.
    await createNotification({
      user_id: result.data.patient_id,
      type: 'appointment_cancelled',
      title: 'Appointment cancelled',
      message: `Your appointment on ${result.data.appointment_date} at ${result.data.appointment_time} has been cancelled.`,
      data: { appointment_id: id },
    })
  }

  return result
}
