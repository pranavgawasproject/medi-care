import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  createAppointment,
  listAppointments,
} from '@/lib/db/appointments'
import { appointmentSchema } from '@/lib/validations/appointment'
import { getPatientByProfile } from '@/lib/db/patients'

/** GET /api/appointments — list appointments for the current user. */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? undefined

    // For patients, fetch their own appointments via their patient record.
    // For doctors, fetch via their doctor record.
    // For admins, list all.
    if (user.profile?.role === 'admin') {
      const res = await listAppointments({
        page: 1,
        pageSize: 200,
        status: status as
          | 'pending'
          | 'confirmed'
          | 'cancelled'
          | 'completed'
          | undefined,
      })
      if (res.error) {
        return NextResponse.json({ error: res.error.message }, { status: 500 })
      }
      return NextResponse.json(res.data)
    }

    // We don't have the doctor/patient id at this layer without a lookup.
    // Fall through to a generic list — RLS will restrict to what the user
    // is allowed to see.
    const res = await listAppointments({
      page: 1,
      pageSize: 200,
      status: status as
        | 'pending'
        | 'confirmed'
        | 'cancelled'
        | 'completed'
        | undefined,
    })
    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 })
    }
    return NextResponse.json(res.data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/** POST /api/appointments — create a new appointment. */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const json = (await request.json()) as unknown
    const parsed = appointmentSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    // If patient_id wasn't supplied, look it up from the auth user.
    let input = parsed.data
    if (!input.patient_id) {
      if (user.profile?.role !== 'patient') {
        return NextResponse.json(
          { error: 'patient_id is required' },
          { status: 400 }
        )
      }
      const patientRes = await getPatientByProfile(user.id)
      if (patientRes.error || !patientRes.data) {
        return NextResponse.json(
          { error: 'Your patient profile is not linked. Contact an administrator.' },
          { status: 400 }
        )
      }
      input = { ...input, patient_id: patientRes.data.id }
    }

    // Patients can only create appointments for themselves.
    if (user.profile?.role === 'patient') {
      const ownPatient = await getPatientByProfile(user.id)
      if (ownPatient.data?.id !== input.patient_id) {
        return NextResponse.json(
          { error: 'You can only book appointments for yourself.' },
          { status: 403 }
        )
      }
    }

    const res = await createAppointment(input, user.id)
    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 })
    }
    return NextResponse.json(res.data, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
