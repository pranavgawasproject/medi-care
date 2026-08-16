import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

const AVATAR_COLORS: Record<string, string> = {
  patient: '#0f766e',
  doctor: '#1d4ed8',
  admin: '#9333ea',
  default: '#475569',
}

const SIZES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

interface AvatarProps {
  name: string
  role?: UserRole | string
  src?: string | null
  size?: keyof typeof SIZES
  className?: string
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^Dr\.?\s+/i, '').trim()
  if (!cleaned) return '?'
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ name, role, src, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name)
  const color = AVATAR_COLORS[role ?? 'default'] ?? AVATAR_COLORS.default

  if (src) {
    return (
      // Using a plain <img> because the avatar URL is user-supplied and may
      // not be on a domain whitelisted by next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full border border-border object-cover',
          SIZES[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-black/10 font-mono font-semibold text-white',
        SIZES[size],
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  )
}
