'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'
import type { AppNotification } from '@/lib/types'

interface Props {
  initialNotifications: AppNotification[]
  userId: string
}

export function NotificationCenter({ initialNotifications, userId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState(initialNotifications)
  const [markingAll, setMarkingAll] = useState(false)
  void userId

  const unreadCount = items.filter((n) => !n.read_at).length

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      if (!res.ok) {
        toast({
          title: 'Could not mark all as read',
          variant: 'destructive',
        })
        return
      }
      setItems((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      )
      router.refresh()
    } finally {
      setMarkingAll(false)
    }
  }

  const markOneRead = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    if (!res.ok) return
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
      )
    )
    router.refresh()
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={markingAll}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y divide-border">
          {items.map((n) => {
            const unread = !n.read_at
            return (
              <li
                key={n.id}
                className={cn(
                  'flex items-start gap-3 px-5 py-3 transition-colors',
                  unread && 'bg-primary/5'
                )}
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.message}
                  </p>
                  <DateBadge
                    date={n.created_at}
                    relative
                    className="mt-1 text-[10px] text-muted-foreground"
                  />
                </div>
                {unread && (
                  <button
                    onClick={() => markOneRead(n.id)}
                    aria-label="Mark as read"
                    className="rounded p-1 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
