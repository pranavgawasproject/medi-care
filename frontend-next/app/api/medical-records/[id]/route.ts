import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecord,
} from '@/lib/db/medical-records'
import { medicalRecordPatchSchema } from '@/lib/validations/medical-record'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    if (user.profile?.role !== 'doctor' && user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only doctors and admins can edit medical records.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const json = (await request.json()) as unknown
    const parsed = medicalRecordPatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const existing = await getMedicalRecord(id)
    if (existing.data) {
      const isOwner = existing.data.doctor_id === user.id
      const isAdmin = user.profile?.role === 'admin'
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: 'You can only edit records you created.' },
          { status: 403 }
        )
      }
    }

    const res = await updateMedicalRecord(id, parsed.data, user.id)
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

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    if (user.profile?.role !== 'doctor' && user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only doctors and admins can delete medical records.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const existing = await getMedicalRecord(id)
    if (existing.data) {
      const isOwner = existing.data.doctor_id === user.id
      const isAdmin = user.profile?.role === 'admin'
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: 'You can only delete records you created.' },
          { status: 403 }
        )
      }
    }

    const res = await deleteMedicalRecord(id, user.id)
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
