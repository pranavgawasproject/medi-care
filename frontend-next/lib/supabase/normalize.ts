import type {
  Appointment,
  Doctor,
  Patient,
  Prescription,
  PrescriptionItem,
  MedicalRecord,
  LabReport,
  AppNotification,
  AuditLog,
  Profile,
  Schedule,
  UserRole,
} from '@/lib/types'

interface DoctorRow {
  id: string
  profile_id?: string | null
  full_name: string
  specialization: string
  location: string
  max_patients_per_day: number
}
interface PatientRow {
  id: string
  profile_id?: string | null
  name: string
  email: string
  phone: string
  medical_history: string | null
  date_of_birth?: string | null
}
interface ScheduleRow {
  id: string
  doctor_id: string
  day_of_week: string
  start_time: string
  end_time: string
  available_slots: number
}
interface AppointmentRow {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  reason?: string | null
  urgency?: string | null
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
interface PrescriptionItemRow {
  id: string
  prescription_id: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string | null
  created_at: string
}
interface PrescriptionRow {
  id: string
  patient_id: string
  doctor_id: string
  diagnosis: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  items?: PrescriptionItemRow[]
}
interface MedicalRecordRow {
  id: string
  patient_id: string
  doctor_id: string
  record_type: string
  title: string
  description: string | null
  record_date: string
  attachments: string[] | null
  created_at: string
  updated_at: string
}
interface LabReportRow {
  id: string
  patient_id: string
  doctor_id: string
  test_name: string
  test_type: string
  status: string
  result_summary: string | null
  result_url: string | null
  ordered_at: string
  completed_at: string | null
  created_at: string
}
interface NotificationRow {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}
interface AuditLogRow {
  id: string
  actor_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

/**
 * Strip a Supabase row down to the known fields the client expects. Keeps the
 * client component's prop types honest without fighting the untyped Supabase
 * response (which can include extra columns or partial fields).
 */
export function normalizeDoctor(r: unknown): Doctor {
  const row = (r ?? {}) as Partial<DoctorRow>
  return {
    id: String(row.id ?? ''),
    profile_id: row.profile_id ?? null,
    full_name: String(row.full_name ?? ''),
    specialization: String(row.specialization ?? ''),
    location: String(row.location ?? ''),
    max_patients_per_day: Number(row.max_patients_per_day ?? 0),
  }
}

export function normalizePatient(r: unknown): Patient {
  const row = (r ?? {}) as Partial<PatientRow>
  return {
    id: String(row.id ?? ''),
    profile_id: row.profile_id ?? null,
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    medical_history: row.medical_history ?? null,
    date_of_birth: row.date_of_birth ?? null,
  }
}

export function normalizeSchedule(r: unknown): Schedule {
  const row = (r ?? {}) as Partial<ScheduleRow>
  return {
    id: String(row.id ?? ''),
    doctor_id: String(row.doctor_id ?? ''),
    day_of_week: String(row.day_of_week ?? ''),
    start_time: String(row.start_time ?? ''),
    end_time: String(row.end_time ?? ''),
    available_slots: Number(row.available_slots ?? 0),
  }
}

export function normalizeAppointment(r: unknown): Appointment {
  const row = (r ?? {}) as Partial<AppointmentRow>
  return {
    id: String(row.id ?? ''),
    patient_id: String(row.patient_id ?? ''),
    doctor_id: String(row.doctor_id ?? ''),
    appointment_date: String(row.appointment_date ?? ''),
    appointment_time: String(row.appointment_time ?? ''),
    status: String(row.status ?? 'pending'),
    reason: row.reason ?? null,
    urgency: row.urgency ?? null,
  }
}

export function normalizeProfile(r: unknown): Profile {
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

export function normalizePrescriptionItem(r: unknown): PrescriptionItem {
  const row = (r ?? {}) as Partial<PrescriptionItemRow>
  return {
    id: String(row.id ?? ''),
    prescription_id: String(row.prescription_id ?? ''),
    medication_name: String(row.medication_name ?? ''),
    dosage: String(row.dosage ?? ''),
    frequency: String(row.frequency ?? ''),
    duration: String(row.duration ?? ''),
    instructions: row.instructions ?? null,
    created_at: String(row.created_at ?? ''),
  }
}

export function normalizePrescription(r: unknown): Prescription {
  const row = (r ?? {}) as Partial<PrescriptionRow>
  return {
    id: String(row.id ?? ''),
    patient_id: String(row.patient_id ?? ''),
    doctor_id: String(row.doctor_id ?? ''),
    diagnosis: String(row.diagnosis ?? ''),
    notes: row.notes ?? null,
    status: String(row.status ?? 'active'),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    items: Array.isArray(row.items)
      ? row.items.map(normalizePrescriptionItem)
      : undefined,
  }
}

export function normalizeMedicalRecord(r: unknown): MedicalRecord {
  const row = (r ?? {}) as Partial<MedicalRecordRow>
  return {
    id: String(row.id ?? ''),
    patient_id: String(row.patient_id ?? ''),
    doctor_id: String(row.doctor_id ?? ''),
    record_type: String(row.record_type ?? 'visit'),
    title: String(row.title ?? ''),
    description: row.description ?? null,
    record_date: String(row.record_date ?? ''),
    attachments: Array.isArray(row.attachments) ? row.attachments : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  }
}

export function normalizeLabReport(r: unknown): LabReport {
  const row = (r ?? {}) as Partial<LabReportRow>
  return {
    id: String(row.id ?? ''),
    patient_id: String(row.patient_id ?? ''),
    doctor_id: String(row.doctor_id ?? ''),
    test_name: String(row.test_name ?? ''),
    test_type: String(row.test_type ?? 'blood'),
    status: String(row.status ?? 'ordered'),
    result_summary: row.result_summary ?? null,
    result_url: row.result_url ?? null,
    ordered_at: String(row.ordered_at ?? ''),
    completed_at: row.completed_at ?? null,
    created_at: String(row.created_at ?? ''),
  }
}

export function normalizeNotification(r: unknown): AppNotification {
  const row = (r ?? {}) as Partial<NotificationRow>
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    type: String(row.type ?? 'system'),
    title: String(row.title ?? ''),
    message: String(row.message ?? ''),
    data: row.data ?? null,
    read_at: row.read_at ?? null,
    created_at: String(row.created_at ?? ''),
  }
}

export function normalizeAuditLog(r: unknown): AuditLog {
  const row = (r ?? {}) as Partial<AuditLogRow>
  return {
    id: String(row.id ?? ''),
    actor_id: String(row.actor_id ?? ''),
    action: String(row.action ?? ''),
    entity_type: row.entity_type ?? null,
    entity_id: row.entity_id ?? null,
    metadata: row.metadata ?? null,
    ip_address: row.ip_address ?? null,
    created_at: String(row.created_at ?? ''),
  }
}
