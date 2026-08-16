import type { Metadata } from 'next'
import { getCurrentUserOrNull } from '@/lib/auth'
import { listNotifications } from '@/lib/db/notifications'
import { NotificationCenter } from './NotificationCenter'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { Bell } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Your notifications and alerts.',
}

export default async function NotificationsPage() {
  const user = await getCurrentUserOrNull()
  if (!user) return <ErrorState title="Sign in required" />

  const res = await listNotifications(user.id)
  if (res.error) return <ErrorState message={res.error.message} />

  const notifications = res.data ?? []

  if (notifications.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Appointment reminders, prescription updates, and lab results.
          </p>
        </div>
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Notifications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Appointment reminders, prescription updates, and lab results.
        </p>
      </div>
      <NotificationCenter initialNotifications={notifications} userId={user.id} />
    </div>
  )
}
