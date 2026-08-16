import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  updateAppointment,
  cancelAppointment,
  getAppointment,
} from '@/lib/db/appointments'
import { appointmentPatchSchema } from '@/lib/validations/appointment'

interface Params {
  params: Promise<{ id: string }>
}

/** PATCH /api/appointments/[id] — update an appointment. */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { id } = await params
    const json = (await request.json()) as unknown
    const parsed = appointmentPatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    // Optional auth check: load the appointment and verify the user is a
    // participant or admin. (RLS will also enforce this server-side.)
    const existing = await getAppointment(id)
    if (existing.data) {
      const appt = existing.data
      const isPatient = appt.patient?.profile_id === user.id
      const isDoctor = appt.doctor?.profile_id === user.id
      const isAdmin = user.profile?.role === 'admin'
      if (!isPatient && !isDoctor && !isAdmin) {
        return NextResponse.json(
          { error: 'You do not have access to this appointment.' },
          { status: 403 }
        )
      }
    }

    const res = await updateAppointment(id, parsed.data, user.id)
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

/** DELETE /api/appointments/[id] — cancel an appointment. */
export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { id } = await params
    const res = await cancelAppointment(id, user.id)
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
