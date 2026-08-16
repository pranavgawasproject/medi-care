import { type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id: string
  title: string
  description?: string
  timestamp?: string | null
  icon?: ReactNode
}

interface RecentActivityProps {
  items: ActivityItem[]
  emptyMessage?: string
  className?: string
}

export function RecentActivity({
  items,
  emptyMessage = 'No recent activity.',
  className,
}: RecentActivityProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                {item.icon && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground">
                    {item.icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.timestamp && (
                  <DateBadge
                    date={item.timestamp}
                    relative
                    className="text-[10px] text-muted-foreground"
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
