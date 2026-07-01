import { HeartPulse, Mail, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/30">
                <HeartPulse className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-lg font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Medi<span className="text-primary">Care</span>
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Clinic Operations Platform
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A unified platform connecting patients, practitioners, and clinic
              administrators — designed for modern, human-centered care.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +1 (800) 555-0142
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> care@medicare.health
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> 240 Wellness Ave, Suite 100
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Mon–Sat · 8am–8pm
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="cursor-pointer transition-colors hover:text-primary">Patient Portal</li>
              <li className="cursor-pointer transition-colors hover:text-primary">Doctor Portal</li>
              <li className="cursor-pointer transition-colors hover:text-primary">Admin Console</li>
              <li className="cursor-pointer transition-colors hover:text-primary">Telemedicine</li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Compliance</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> HIPAA Compliant
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> SOC 2 Type II
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> GDPR Ready
              </li>
              <li className="cursor-pointer transition-colors hover:text-primary">Privacy Policy</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © 2026 Medi-Care Systems. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  )
}
