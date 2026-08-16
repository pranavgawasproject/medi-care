import { forwardRef } from 'react'
import { cn } from '../lib/utils'

/* ---------------- Button ---------------- */
const buttonVariants = {
  primary:
    'bg-primary text-primary-foreground border border-primary hover:opacity-90',
  secondary:
    'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/70',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-secondary/60',
  ghost: 'bg-transparent text-foreground hover:bg-secondary/60',
  destructive:
    'bg-transparent text-destructive border border-destructive/40 hover:bg-destructive/10',
  success:
    'bg-transparent text-primary border border-primary/40 hover:bg-primary/10',
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
        'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
})

/* ---------------- Card (chart-form styling: label over a hairline rule) ---------------- */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    />
  )
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 border-b border-border', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2',
        className
      )}
      {...props}
    />
  )
}
export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-foreground mt-1', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

/* ---------------- Badge ---------------- */
export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wide',
        className
      )}
      {...props}
    />
  )
}

/* ---------------- Status Badge ---------------- */
const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
  },
  pending: {
    label: 'Pending',
    className: 'bg-accent/10 text-accent border-accent/30',
    dot: 'bg-accent',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    dot: 'bg-destructive',
  },
  completed: {
    label: 'Completed',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
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

/* ---------------- Avatar (initials) — squared, chart-tag style ---------------- */
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
        'flex shrink-0 items-center justify-center rounded-md font-mono font-semibold text-white border border-black/10',
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
        'flex h-10 w-full rounded-md border border-border bg-input/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
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
        'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
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
        'flex h-10 w-full rounded-md border border-border bg-input/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-no-repeat',
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
        'border-b border-border transition-colors hover:bg-muted/40',
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
        'h-10 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}
export function TableCell({ className, ...props }) {
  return (
    <td className={cn('px-4 py-3 align-middle font-mono text-sm', className)} {...props} />
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
        'relative h-1.5 w-full overflow-hidden rounded-sm bg-secondary',
        className
      )}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

/* ---------------- ECG signature divider ---------------- */
export function EcgDivider({ pulse = false, className }) {
  return (
    <svg
      viewBox="0 0 400 20"
      preserveAspectRatio="none"
      className={cn('ecg-line', pulse && 'pulse', className)}
    >
      <path d="M0 10 H140 L155 10 L163 2 L172 18 L180 10 H210 L222 10 L230 4 L238 16 L246 10 H400" />
    </svg>
  )
}
