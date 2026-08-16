'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: UserRole
  unreadCount?: number
}

/** Slide-over mobile sidebar. Controlled by the parent AppShell. */
export function MobileSidebar({
  open,
  onOpenChange,
  role,
  unreadCount,
}: MobileSidebarProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative h-full w-64 transform bg-card transition-transform'
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
        <Sidebar
          role={role}
          unreadCount={unreadCount}
          onNavigate={() => onOpenChange(false)}
        />
      </div>
    </div>
  )
}
