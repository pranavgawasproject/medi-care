/**
 * Shared TypeScript domain types, mirrored from supabase_schema.sql.
 *
 * NOTE: The DB schema only defines 'pending' | 'confirmed' | 'cancelled' for
 * appointment status; the UI also renders 'completed' as a legacy value.
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type UserRole = 'patient' | 'doctor' | 'admin'

/** Legacy alias kept for backward compatibility with existing components. */
export type Role = UserRole

export interface Doctor {
  id: string
  profile_id?: string | null
  full_name: string
  specialization: string
  location: string
  max_patients_per_day: number
}

export interface Patient {
  id: string
  profile_id?: string | null
  name: string
  email: string
  phone: string
  medical_history: string | null
  date_of_birth?: string | null
}

export interface Schedule {
  id: string
  doctor_id: string
  day_of_week: DayOfWeek | string
  start_time: string
  end_time: string
  available_slots: number
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus | string
  reason?: string | null
  urgency?: string | null
}

/* ---------------------- Enterprise domain types ---------------------- */

export interface Profile {
  id: string // matches auth.users.id
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled'

export interface PrescriptionItem {
  id: string
  prescription_id: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string | null
  created_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  diagnosis: string
  notes: string | null
  status: PrescriptionStatus | string
  created_at: string
  updated_at: string
  items?: PrescriptionItem[]
}

export type MedicalRecordType =
  | 'visit'
  | 'diagnosis'
  | 'treatment'
  | 'allergy'
  | 'immunization'
  | 'surgery'

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  record_type: MedicalRecordType | string
  title: string
  description: string | null
  record_date: string
  attachments: string[] | null
  created_at: string
  updated_at: string
}

export type LabTestType =
  | 'blood'
  | 'urine'
  | 'imaging'
  | 'biopsy'
  | 'other'

export type LabReportStatus =
  | 'ordered'
  | 'collected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface LabReport {
  id: string
  patient_id: string
  doctor_id: string
  test_name: string
  test_type: LabTestType | string
  status: LabReportStatus | string
  result_summary: string | null
  result_url: string | null
  ordered_at: string
  completed_at: string | null
  created_at: string
}

export type NotificationType =
  | 'appointment_reminder'
  | 'prescription_created'
  | 'lab_result_ready'
  | 'appointment_cancelled'
  | 'system'

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType | string
  title: string
  message: string
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

/** Lightweight shape used by auth helpers — minimal superset of auth.users. */
export interface SessionUser {
  id: string
  email: string
  profile: Profile | null
}
