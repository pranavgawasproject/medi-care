'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bell, LogOut, Menu } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface AppHeaderProps {
  profile: Profile | null
  email: string
  unreadCount?: number
  onMenuClick?: () => void
  className?: string
}

const ROLE_BADGE_CLASS: Record<string, string> = {
  patient: 'bg-primary/10 text-primary border-primary/30',
  doctor: 'bg-primary/10 text-primary border-primary/30',
  admin: 'bg-accent/10 text-accent border-accent/30',
}

export function AppHeader({
  profile,
  email,
  unreadCount = 0,
  onMenuClick,
  className,
}: AppHeaderProps) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    const client = createClient()
    if (client) {
      try {
        await client.auth.signOut()
      } catch {
        // ignore — we still redirect
      }
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:gap-4 sm:px-6',
        className
      )}
    >
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div className="flex-1" />

      <Link
        href="/notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-secondary/60"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-mono font-bold text-accent-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      <ThemeToggle />

      <div className="flex items-center gap-3 border-l border-border pl-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-semibold text-foreground">
            {profile?.full_name ?? email}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {profile?.role ?? 'pending'}
          </p>
        </div>
        <Avatar
          name={profile?.full_name ?? email}
          role={profile?.role}
          src={profile?.avatar_url}
          size="sm"
        />
        {profile && (
          <span
            className={cn(
              'hidden rounded-sm border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wide sm:inline-flex',
              ROLE_BADGE_CLASS[profile.role]
            )}
          >
            {profile.role}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
