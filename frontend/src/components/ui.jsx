import { forwardRef } from 'react'
import { cn } from '../lib/utils'

/* ---------------- Button ---------------- */
const buttonVariants = {
  primary:
    'bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25 hover:shadow-primary/40',
  secondary:
    'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-secondary/60',
  ghost: 'bg-transparent text-foreground hover:bg-secondary/60',
  destructive:
    'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 hover:bg-rose-500/25',
  success:
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25',
}
const buttonSizes = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
  icon: 'h-9 w-9',
}

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
})

/* ---------------- Card ---------------- */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 border-b border-border/60', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-base font-semibold leading-none tracking-tight flex items-center gap-2', className)}
      {...props}
    />
  )
}
export function CardDescription({ className, ...props }) {
  return <p className={cn('text-xs text-muted-foreground mt-1', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

/* ---------------- Badge ---------------- */
export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        className
      )}
      {...props}
    />
  )
}

/* ---------------- Status Badge ---------------- */
// Uses Tailwind's dark: variant so colours stay readable on both themes.
const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    className:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25',
    dot: 'bg-amber-500',
  },
  cancelled: {
    label: 'Cancelled',
    className:
      'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25',
    dot: 'bg-rose-500',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/25',
    dot: 'bg-teal-500',
  },
}
export function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.pending
  return (
    <Badge className={cfg.className}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </Badge>
  )
}

/* ---------------- Avatar (initials) ---------------- */
export function InitialsAvatar({ name, color, size = 'md' }) {
  const initials = name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-black/5 dark:ring-white/10',
        sizes[size]
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

/* ---------------- Input ---------------- */
export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30',
        className
      )}
      {...props}
    />
  )
})

/* ---------------- Label ---------------- */
export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

/* ---------------- Select (native, styled) ---------------- */
export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-border bg-input/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 appearance-none bg-no-repeat',
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '16px',
        paddingRight: '2.25rem',
      }}
      {...props}
    >
      {children}
    </select>
  )
})

/* ---------------- Table primitives ---------------- */
export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}
export function TableHeader({ className, ...props }) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />
}
export function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}
export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-border/50 transition-colors hover:bg-muted/30',
        className
      )}
      {...props}
    />
  )
}
export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}
export function TableCell({ className, ...props }) {
  return (
    <td className={cn('px-4 py-3 align-middle', className)} {...props} />
  )
}

/* ---------------- ScrollArea (passthrough) ---------------- */
export function ScrollArea({ className, children }) {
  return (
    <div className={cn('overflow-auto scroll-area-thin', className)}>{children}</div>
  )
}

/* ---------------- Progress ---------------- */
export function Progress({ value = 0, className }) {
  return (
    <div
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
