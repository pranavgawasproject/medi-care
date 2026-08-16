'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  Stethoscope,
  Users,
  Bell,
  FlaskConical,
  ClipboardList,
  ShieldAlert,
  ScrollText,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'
import { EcgDivider } from '@/components/ui'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  patient: [
    { href: '/patient', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/patient/records', label: 'Medical Records', icon: ClipboardList },
    { href: '/patient/lab-reports', label: 'Lab Reports', icon: FlaskConical },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  doctor: [
    { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/doctor/patients', label: 'Patients', icon: Users },
    { href: '/doctor/prescribe', label: 'Prescribe', icon: Stethoscope },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
}

const ROLE_LABEL: Record<UserRole, { name: string; icon: LucideIcon }> = {
  patient: { name: 'Patient', icon: HeartPulse },
  doctor: { name: 'Doctor', icon: Stethoscope },
  admin: { name: 'Admin', icon: ShieldAlert },
}

interface SidebarProps {
  role: UserRole
  unreadCount?: number
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ role, unreadCount = 0, className, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const items = NAV_BY_ROLE[role]
  const roleMeta = ROLE_LABEL[role]

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-border bg-card/50',
        className
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
          <HeartPulse className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col leading-none">
          <span
            className="text-base font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Medi<span className="text-primary">Care</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {roleMeta.name} workspace
          </span>
        </div>
      </div>

      <EcgDivider pulse className="px-2" />

      <nav className="flex-1 space-y-0.5 px-2 py-4" aria-label="Primary">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href))
          const Icon = item.icon
          const showBadge = item.href === '/notifications' && unreadCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-mono font-semibold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ListChecks className="h-3.5 w-3.5" />
          Help & support
        </Link>
      </div>
    </aside>
  )
}
