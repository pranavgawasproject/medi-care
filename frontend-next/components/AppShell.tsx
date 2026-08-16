'use client'

import { useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { AppHeader } from '@/components/AppHeader'
import { MobileSidebar } from '@/components/MobileSidebar'
import type { Profile, UserRole } from '@/lib/types'

interface AppShellProps {
  profile: Profile
  email: string
  unreadCount: number
  children: ReactNode
}

/**
 * Client-side shell that owns the mobile sidebar open/close state. Server-
 * rendered once (sidebar + header visible immediately), then hydrated.
 */
export function AppShell({
  profile,
  email,
  unreadCount,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const role: UserRole = profile.role

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <Sidebar role={role} unreadCount={unreadCount} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          profile={profile}
          email={email}
          unreadCount={unreadCount}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        role={role}
        unreadCount={unreadCount}
      />
    </div>
  )
}
