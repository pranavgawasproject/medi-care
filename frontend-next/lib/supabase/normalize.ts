import type {
  Appointment,
  Doctor,
  Patient,
  Schedule,
} from '@/lib/types'

interface DoctorRow {
  id: string
  full_name: string
  specialization: string
  location: string
  max_patients_per_day: number
}
interface PatientRow {
  id: string
  name: string
  email: string
  phone: string
  medical_history: string | null
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
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    medical_history: row.medical_history ?? null,
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
  }
}
