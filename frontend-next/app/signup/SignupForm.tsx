'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { FormField, FormSelect } from '@/components/FormField'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase/client'
import { dashboardPathForRole } from '@/lib/roles'
import { signupSchema, type SignupInput } from '@/lib/validations/auth'

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      role: 'patient',
      phone: '',
    },
  })

  const onSubmit = async (values: SignupInput) => {
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

      const { data, error } = await client.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            role: values.role,
            phone: values.phone ?? '',
          },
        },
      })

      if (error) {
        toast({
          title: 'Sign-up failed',
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Account created',
        description: 'Welcome to MediCare. Redirecting to your dashboard…',
      })

      if (data.session) {
        // Session active immediately — go to role dashboard.
        router.push(dashboardPathForRole(values.role))
        router.refresh()
      } else {
        // Email confirmation required — bounce to login.
        router.push('/login?verified=pending')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        id="full_name"
        label="Full name"
        autoComplete="name"
        placeholder="Jane Doe"
        required
        error={errors.full_name?.message}
        {...register('full_name')}
      />
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
        autoComplete="new-password"
        placeholder="••••••••"
        required
        hint="Use at least 8 characters."
        error={errors.password?.message}
        {...register('password')}
      />
      <FormField
        id="phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        placeholder="+1 555 000 0000"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <FormSelect
        id="role"
        label="I am a…"
        required
        error={errors.role?.message}
        {...register('role')}
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor / practitioner</option>
        <option value="admin">Clinic administrator</option>
      </FormSelect>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground">
        By signing up you agree to our terms and acknowledge our privacy policy.
      </p>
    </form>
  )
}
