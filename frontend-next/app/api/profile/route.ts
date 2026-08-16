import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getProfile, updateProfile } from '@/lib/db/profiles'
import { profileSchema } from '@/lib/validations/profile'

/** GET /api/profile — current user's profile. */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }
    const res = await getProfile(user.id)
    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 })
    }
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: res.data?.role ?? null,
      profile: res.data,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/** PATCH /api/profile — update the current user's profile. */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    }

    const json = (await request.json()) as unknown
    const parsed = profileSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const res = await updateProfile(user.id, parsed.data)
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
