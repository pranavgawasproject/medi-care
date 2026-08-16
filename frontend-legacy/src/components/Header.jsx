import { useState } from 'react'
import { HeartPulse, Stethoscope, ShieldAlert } from 'lucide-react'
import { cn } from '../lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { EcgDivider } from './ui'

const VIEWS = [
  { key: 'patient', label: 'Patient', icon: HeartPulse },
  { key: 'doctor', label: 'Doctor', icon: Stethoscope },
  { key: 'admin', label: 'Admin', icon: ShieldAlert },
]

export function Header({ view, setView, connected }) {
  const [pulseKey, setPulseKey] = useState(0)

  const handleSetView = (key) => {
    setView(key)
    setPulseKey((k) => k + 1)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
            <HeartPulse className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Medi<span className="text-primary">Care</span>
            </span>
            <span className="hidden text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:block">
              Clinic Operations Platform
            </span>
          </div>
        </div>

        {/* Chart-tab view switcher — index tabs on a patient folder, not a pill nav */}
        <nav className="flex items-center gap-6 sm:gap-8">
          {VIEWS.map((v) => {
            const Icon = v.icon
            const active = view === v.key
            return (
              <button
                key={v.key}
                data-active={active}
                onClick={() => handleSetView(v.key)}
                className={cn(
                  'chart-tab flex items-center gap-1.5 pb-4 pt-1 text-sm font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Connection status + theme toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 sm:flex">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                connected ? 'bg-primary' : 'bg-accent'
              )}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              {connected ? 'DB:CONNECTED' : 'DB:DEMO'}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <EcgDivider key={pulseKey} pulse className="opacity-70" />
    </header>
  )
}
