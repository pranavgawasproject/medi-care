import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  updatePrescription,
  deletePrescription,
  getPrescription,
} from '@/lib/db/prescriptions'
import { prescriptionPatchSchema } from '@/lib/validations/prescription'

interface Params {
  params: Promise<{ id: string }>
}

/** PATCH /api/prescriptions/[id] */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { id } = await params
    const json = (await request.json()) as unknown
    const parsed = prescriptionPatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const existing = await getPrescription(id)
    if (existing.data) {
      const isOwner = existing.data.doctor_id === user.id
      const isPatient = existing.data.patient_id === user.id
      const isAdmin = user.profile?.role === 'admin'
      if (!isOwner && !isPatient && !isAdmin) {
        return NextResponse.json(
          { error: 'You do not have access to this prescription.' },
          { status: 403 }
        )
      }
      // Patients can only update status of their own prescriptions (e.g. mark
      // as completed once the course is finished).
      if (isPatient && !isAdmin) {
        if (parsed.data.notes !== undefined) {
          return NextResponse.json(
            { error: 'Patients can only change the prescription status.' },
            { status: 403 }
          )
        }
      }
    }

    const res = await updatePrescription(id, parsed.data, user.id)
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

/** DELETE /api/prescriptions/[id] */
export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    if (user.profile?.role !== 'doctor' && user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only doctors and admins can delete prescriptions.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const res = await deletePrescription(id, user.id)
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
