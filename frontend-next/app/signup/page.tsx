import type { Metadata } from 'next'
import Link from 'next/link'
import { HeartPulse } from 'lucide-react'
import { ConfigError } from '@/components/ConfigError'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { SignupForm } from './SignupForm'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create your MediCare account.',
  robots: { index: false, follow: false },
}

export default async function SignupPage() {
  const configured = isSupabaseConfigured()

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
          Create your MediCare account
        </h1>
        <p className="max-w-xs text-xs text-muted-foreground">
          Patients, practitioners, and clinic administrators welcome.
        </p>
      </div>

      {!configured ? (
        <ConfigError
          title="Sign-up unavailable"
          message="Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable authentication."
          hideRetry
        />
      ) : (
        <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 shadow-sm">
          <SignupForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
