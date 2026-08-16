import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  normalizeAppointment,
  normalizeDoctor,
  normalizePatient,
  normalizeSchedule,
} from '@/lib/supabase/normalize'
import { AppClient } from '@/components/AppClient'
import {
  FALLBACK_APPOINTMENTS,
  FALLBACK_DOCTORS,
  FALLBACK_PATIENTS,
  FALLBACK_SCHEDULES,
} from '@/lib/data/seed'
import type {
  Appointment,
  Doctor,
  Patient,
  Schedule,
} from '@/lib/types'

export const metadata: Metadata = {
  title: 'MediCare — Clinic Operations Platform for Patients and Practitioners',
  description:
    'MediCare is a modern clinic operations platform connecting patients, practitioners, and administrators. Book consultations, manage medical notes, and streamline clinic workflows.',
}

/**
 * Home page — Server Component.
 *
 * Fetches the initial doctors / patients / appointments / schedules lists
 * server-side using the @supabase/ssr server client (with cookie auth). Falls
 * back to the seed dataset when Supabase env vars are missing so the SSR HTML
 * always renders with real content. The client component then layers realtime
 * subscriptions and optimistic mutations on top of this initial snapshot.
 */
export default async function Page() {
  const client = await createClient()

  let doctors: Doctor[] = FALLBACK_DOCTORS
  let patients: Patient[] = FALLBACK_PATIENTS
  let appointments: Appointment[] = FALLBACK_APPOINTMENTS
  let schedules: Schedule[] = FALLBACK_SCHEDULES
  let connected = false

  if (client) {
    const [doctorRes, patientRes, apptRes, schedRes] = await Promise.all([
      client.from('doctors').select('*'),
      client.from('patients').select('*'),
      client
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false }),
      client.from('schedules').select('*'),
    ])

    // Each fetch can succeed or fail independently; we only override the
    // fallback when we got back a non-empty array.
    if (!doctorRes.error && doctorRes.data && doctorRes.data.length) {
      doctors = doctorRes.data.map(normalizeDoctor)
      connected = true
    }
    if (!patientRes.error && patientRes.data && patientRes.data.length) {
      patients = patientRes.data.map(normalizePatient)
    }
    if (!apptRes.error && apptRes.data) {
      appointments = apptRes.data.map(normalizeAppointment)
    }
    if (!schedRes.error && schedRes.data && schedRes.data.length) {
      schedules = schedRes.data.map(normalizeSchedule)
    }
  }

  return (
    <AppClient
      initialDoctors={doctors}
      initialPatients={patients}
      initialAppointments={appointments}
      initialSchedules={schedules}
      initialConnected={connected}
    />
  )
}
