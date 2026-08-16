import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { updateLabReport, getLabReport } from '@/lib/db/lab-reports'
import { labReportPatchSchema } from '@/lib/validations/lab-report'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const { id } = await params
    const json = (await request.json()) as unknown
    const parsed = labReportPatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const existing = await getLabReport(id)
    if (existing.data) {
      const isOwner = existing.data.doctor_id === user.id
      const isPatient = existing.data.patient_id === user.id
      const isAdmin = user.profile?.role === 'admin'
      if (!isOwner && !isPatient && !isAdmin) {
        return NextResponse.json(
          { error: 'You do not have access to this lab report.' },
          { status: 403 }
        )
      }
    }

    const res = await updateLabReport(id, parsed.data, user.id)
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
