import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateBadgeProps {
  /** ISO date string. */
  date: string | null | undefined
  /** Show relative time (e.g. "3 hours ago") instead of an absolute date. */
  relative?: boolean
  formatStr?: string
  className?: string
}

export function DateBadge({
  date,
  relative,
  formatStr = 'MMM d, yyyy',
  className,
}: DateBadgeProps) {
  if (!date) {
    return <span className={cn('text-muted-foreground', className)}>—</span>
  }

  const parsed = parseISO(date)

  if (!isValid(parsed)) {
    return <span className={cn('text-muted-foreground', className)}>—</span>
  }

  return (
    <time
      dateTime={parsed.toISOString()}
      title={format(parsed, 'PPpp')}
      className={cn('num', className)}
    >
      {relative ? formatDistanceToNow(parsed, { addSuffix: true }) : format(parsed, formatStr)}
    </time>
  )
}
