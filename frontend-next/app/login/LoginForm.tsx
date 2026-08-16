'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { FormField, FormSelect } from '@/components/FormField'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase/client'
import { dashboardPathForRole } from '@/lib/roles'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import type { UserRole } from '@/lib/types'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginInput) => {
    setBusy(true)
    try {
      const client = createClient()
      if (!client) {
        toast({
          title: 'Configuration error',
          description: 'Supabase is not configured.',
          variant: 'destructive',
        })
        return
      }

      const { error } = await client.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast({
          title: 'Sign-in failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({ title: 'Welcome back', description: 'You are signed in.' })

      // Determine role via /api/me — fallback to /patient.
      try {
        const res = await fetch('/api/profile', { method: 'GET' })
        if (res.ok) {
          const data = (await res.json()) as { role?: UserRole }
          const dest = dashboardPathForRole(data.role)
          const redirect = params.get('redirect')
          router.push(redirect ?? dest)
          router.refresh()
          return
        }
      } catch {
        // ignore
      }
      router.push('/patient')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        error={errors.password?.message}
        {...register('password')}
      />

      {/* honeypot for bots — never visible, never auto-filled */}
      <div className="hidden" aria-hidden="true">
        <FormSelect id="role" label="Role" {...register('role' as never)}>
          <option value="">Select</option>
        </FormSelect>
      </div>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
