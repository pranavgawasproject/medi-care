import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createPrescription } from '@/lib/db/prescriptions'
import { prescriptionSchema } from '@/lib/validations/prescription'

/** POST /api/prescriptions — create a new prescription (doctor/admin only). */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    if (user.profile?.role !== 'doctor' && user.profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only doctors and admins can issue prescriptions.' },
        { status: 403 }
      )
    }

    const json = (await request.json()) as unknown
    const parsed = prescriptionSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const res = await createPrescription(parsed.data, user.id)
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
