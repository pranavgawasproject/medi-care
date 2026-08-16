/**
 * Shared TypeScript domain types, mirrored from
 * /home/z/my-project/repos/medi-care/supabase_schema.sql
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

export interface Doctor {
  id: string
  full_name: string
  specialization: string
  location: string
  max_patients_per_day: number
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  medical_history: string | null
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
}

export type Role = 'patient' | 'doctor' | 'admin'
