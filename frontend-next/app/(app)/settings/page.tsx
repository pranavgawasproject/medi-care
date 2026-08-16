import type { Metadata } from 'next'
import { getCurrentUserOrNull } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { SettingsForm } from './SettingsForm'
import { ErrorState } from '@/components/EmptyState'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Update your profile and preferences.',
}

export default async function SettingsPage() {
  const user = await getCurrentUserOrNull()
  if (!user) return <ErrorState title="Sign in required" />

  const profileRes = await getProfile(user.id)
  const profile = profileRes.data ?? user.profile

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Account settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name, phone, and avatar URL.
        </p>
      </div>
      <SettingsForm profile={profile} email={user.email} />
    </div>
  )
}
