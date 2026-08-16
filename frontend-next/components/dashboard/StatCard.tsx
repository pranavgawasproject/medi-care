import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  hint?: string
  /** Positive number → green up arrow; negative → red down arrow. */
  trend?: number
  trendLabel?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-mono text-2xl font-semibold text-foreground">
            {value}
          </p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {typeof trend === 'number' && (
        <div className="mt-3 flex items-center gap-1 text-[11px]">
          {trend >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={cn(
              'font-mono font-medium',
              trend >= 0 ? 'text-primary' : 'text-destructive'
            )}
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </Card>
  )
}
