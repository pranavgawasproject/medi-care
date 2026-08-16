'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { FormField } from '@/components/FormField'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { profileSchema, type ProfileInput } from '@/lib/validations/profile'
import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile | null
  email: string
}

export function SettingsForm({ profile, email }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar_url: profile?.avatar_url ?? '',
    },
  })

  const onSubmit = async (values: ProfileInput) => {
    setBusy(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast({
          title: 'Could not save',
          description: data.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Saved', description: 'Your profile has been updated.' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            id="email"
            label="Email (read-only)"
            type="email"
            value={email}
            readOnly
            disabled
          />
          <FormField
            id="full_name"
            label="Full name"
            required
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <FormField
            id="phone"
            label="Phone"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <FormField
            id="avatar_url"
            label="Avatar URL"
            placeholder="https://"
            error={errors.avatar_url?.message}
            {...register('avatar_url')}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
