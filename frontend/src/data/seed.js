// Seed data that mirrors the Supabase schema (supabase_schema.sql).
// Used as a fallback when Supabase env vars are not configured or fetch fails,
// so the redesigned UI always renders something meaningful.

export const ACTING_DOCTOR_ID = 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411' // Dr. Sarah Jenkins
export const ACTING_PATIENT_ID = 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a411' // Pranav Gawas

export const FALLBACK_DOCTORS = [
  {
    id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411',
    full_name: 'Dr. Sarah Jenkins',
    specialization: 'Cardiology',
    location: 'Building A, Room 104',
    max_patients_per_day: 12,
  },
  {
    id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a422',
    full_name: 'Dr. David Miller',
    specialization: 'Pediatrics',
    location: 'Building B, Room 205',
    max_patients_per_day: 15,
  },
  {
    id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a433',
    full_name: 'Dr. Elena Rostova',
    specialization: 'Neurology',
    location: 'Building A, Room 302',
    max_patients_per_day: 8,
  },
  {
    id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a444',
    full_name: 'Dr. Marcus Hale',
    specialization: 'General Medicine',
    location: 'Building C, Room 110',
    max_patients_per_day: 10,
  },
  {
    id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a455',
    full_name: 'Dr. Priya Nair',
    specialization: 'Dermatology',
    location: 'Building B, Room 188',
    max_patients_per_day: 9,
  },
]

export const FALLBACK_PATIENTS = [
  {
    id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a411',
    name: 'Pranav Gawas',
    email: 'pranavgawas1999@gmail.com',
    phone: '+91 9876543210',
    medical_history: 'Hypertension under control, regular checkups',
  },
  {
    id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a422',
    name: 'Emily Watson',
    email: 'emily@example.com',
    phone: '+1 555 382 9102',
    medical_history: 'None',
  },
  {
    id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a433',
    name: 'Michael Chang',
    email: 'm.chang@example.com',
    phone: '+1 555 491 3022',
    medical_history: 'Asthma history',
  },
]

export const FALLBACK_APPOINTMENTS = [
  {
    id: 'apt-001',
    patient_id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a411',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411',
    appointment_date: '2026-07-03',
    appointment_time: '10:00 AM',
    status: 'confirmed',
  },
  {
    id: 'apt-002',
    patient_id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a422',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a422',
    appointment_date: '2026-07-01',
    appointment_time: '11:30 AM',
    status: 'pending',
  },
  {
    id: 'apt-003',
    patient_id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a433',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411',
    appointment_date: '2026-07-02',
    appointment_time: '02:00 PM',
    status: 'pending',
  },
  {
    id: 'apt-004',
    patient_id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a411',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a444',
    appointment_date: '2026-06-18',
    appointment_time: '09:30 AM',
    status: 'cancelled',
  },
  {
    id: 'apt-005',
    patient_id: 'b1e7c8a1-512c-473d-9cb1-e8dfd6a5a422',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411',
    appointment_date: '2026-06-15',
    appointment_time: '04:00 PM',
    status: 'confirmed',
  },
]

export const FALLBACK_SCHEDULES = [
  {
    id: 'sch-001',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411',
    day_of_week: 'Monday',
    start_time: '09:00 AM',
    end_time: '04:00 PM',
    available_slots: 10,
  },
  {
    id: 'sch-002',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411',
    day_of_week: 'Wednesday',
    start_time: '09:00 AM',
    end_time: '04:00 PM',
    available_slots: 8,
  },
  {
    id: 'sch-003',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a422',
    day_of_week: 'Tuesday',
    start_time: '10:00 AM',
    end_time: '05:00 PM',
    available_slots: 12,
  },
  {
    id: 'sch-004',
    doctor_id: 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a433',
    day_of_week: 'Thursday',
    start_time: '08:00 AM',
    end_time: '01:00 PM',
    available_slots: 6,
  },
]

export const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Ophthalmology',
]

export const TIME_SLOTS = [
  '09:30 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
]

// Deterministic avatar colors based on a string hash, so each doctor/patient
// gets a stable color across renders without storing it in the DB.
const AVATAR_PALETTE = [
  'oklch(0.68 0.13 178)',
  'oklch(0.7 0.13 145)',
  'oklch(0.72 0.16 45)',
  'oklch(0.7 0.1 220)',
  'oklch(0.75 0.15 80)',
  'oklch(0.65 0.16 25)',
]
export function colorForName(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}

// Mock medical notes for the acting patient (the Supabase schema doesn't have a
// notes table, so these are presented as derived summaries from history).
export const MEDICAL_NOTES = [
  {
    id: 'n1',
    date: '2026-05-12',
    doctor: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    title: 'Hypertension — Stable',
    content:
      'Blood pressure well controlled on current regimen. Continue Lisinopril 10mg daily. Recheck in 3 months.',
    tag: 'Cardio',
  },
  {
    id: 'n2',
    date: '2026-04-02',
    doctor: 'Dr. Marcus Hale',
    specialty: 'General Medicine',
    title: 'Annual Physical',
    content:
      'Overall health good. Lipid panel within normal limits. Recommended increased physical activity and follow-up as needed.',
    tag: 'General',
  },
]

export const CLINIC_WEEKLY_TREND = [12, 18, 15, 22, 19, 25, 28]
