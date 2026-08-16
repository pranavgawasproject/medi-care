import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Supabase OAuth/email-confirm callback. Exchanges the `code` query param for
 * a session, then redirects to the original `next` URL or `/dashboard`.
 *
 * Mirrors the official `@supabase/ssr` callback handler.
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      // Persist the cookies set during exchangeCodeForSession.
      const all = request.cookies.getAll()
      all.forEach(({ name, value }) =>
        response.cookies.set(name, value, { path: '/' })
      )
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback`)
}
