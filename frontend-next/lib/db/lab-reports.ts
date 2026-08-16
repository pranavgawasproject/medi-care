import { createClient } from '@/lib/supabase/server'
import { fromPostgrestError, ok, type DbResult } from '@/lib/db/result'
import { normalizeLabReport } from '@/lib/supabase/normalize'
import type { LabReport } from '@/lib/types'
import type {
  LabReportInput,
  LabReportPatch,
} from '@/lib/validations/lab-report'
import { createAuditLog } from '@/lib/db/audit-logs'
import { createNotification } from '@/lib/db/notifications'

export async function listLabReportsForPatient(
  patientId: string
): Promise<DbResult<LabReport[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('lab_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('ordered_at', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeLabReport))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function listLabReportsForDoctor(
  doctorId: string
): Promise<DbResult<LabReport[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('lab_reports')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('ordered_at', { ascending: false })

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok((data ?? []).map(normalizeLabReport))
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function getLabReport(
  id: string
): Promise<DbResult<LabReport | null>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('lab_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return { data: null, error: fromPostgrestError(error) }
    return ok(data ? normalizeLabReport(data) : null)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function createLabReport(
  input: LabReportInput,
  actorId: string
): Promise<DbResult<LabReport>> {
  try {
    const client = await createClient()
    const { data, error } = await client
      .from('lab_reports')
      .insert({
        patient_id: input.patient_id,
        doctor_id: actorId,
        test_name: input.test_name,
        test_type: input.test_type,
        status: 'ordered',
        result_summary: input.result_summary || null,
        result_url: input.result_url || null,
      })
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }

    const report = normalizeLabReport(data)

    await createAuditLog({
      actor_id: actorId,
      action: 'lab_report.create',
      entity_type: 'lab_report',
      entity_id: report.id,
      metadata: { test_name: input.test_name, test_type: input.test_type },
    })

    return ok(report)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}

export async function updateLabReport(
  id: string,
  patch: LabReportPatch,
  actorId: string
): Promise<DbResult<LabReport>> {
  try {
    const client = await createClient()
    const update: Record<string, unknown> = {}
    if (patch.status) update.status = patch.status
    if (patch.result_summary !== undefined)
      update.result_summary = patch.result_summary
    if (patch.result_url !== undefined)
      update.result_url = patch.result_url || null
    if (patch.status === 'completed') {
      update.completed_at = new Date().toISOString()
    }

    const { data, error } = await client
      .from('lab_reports')
      .update(update)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return { data: null, error: fromPostgrestError(error) }

    const report = normalizeLabReport(data)

    await createAuditLog({
      actor_id: actorId,
      action: 'lab_report.update',
      entity_type: 'lab_report',
      entity_id: id,
      metadata: { ...patch },
    })

    if (patch.status === 'completed') {
      await createNotification({
        user_id: report.patient_id,
        type: 'lab_result_ready',
        title: 'Lab result ready',
        message: `Your ${report.test_name} result is now available.`,
        data: { lab_report_id: id },
      })
    }

    return ok(report)
  } catch (e) {
    return { data: null, error: fromPostgrestError(e) }
  }
}
