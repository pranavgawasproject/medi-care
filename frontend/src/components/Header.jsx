import { motion } from 'framer-motion'
import { HeartPulse, Stethoscope, ShieldAlert } from 'lucide-react'
import { cn } from '../lib/utils'
import { ThemeToggle } from './ThemeToggle'

const VIEWS = [
  { key: 'patient', label: 'Patient', icon: HeartPulse },
  { key: 'doctor', label: 'Doctor', icon: Stethoscope },
  { key: 'admin', label: 'Admin', icon: ShieldAlert },
]

export function Header({ view, setView, connected }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/30">
            <HeartPulse className="h-5 w-5 text-primary-foreground" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Medi<span className="text-primary">Care</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
              Clinic Operations Platform
            </span>
          </div>
        </div>

        {/* View switcher */}
        <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 shadow-sm">
          {VIEWS.map((v) => {
            const Icon = v.icon
            const active = view === v.key
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4',
                  active
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="view-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-emerald-600 shadow-md shadow-primary/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">{v.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Connection status + theme toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 sm:flex">
            <span className="flex h-2 w-2">
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {connected ? 'Connected to Supabase' : 'Demo mode'}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
