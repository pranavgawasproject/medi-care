import { HeartPulse, Mail, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
                <HeartPulse className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-lg font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Medi<span className="text-primary">Care</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
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
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> <span className="font-mono">+1 (800) 555-0142</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> care@medicare.health
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> 240 Wellness Ave, Suite 100
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> <span className="font-mono">Mon–Sat · 8am–8pm</span>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="cursor-pointer transition-colors hover:text-primary">Patient Portal</li>
              <li className="cursor-pointer transition-colors hover:text-primary">Doctor Portal</li>
              <li className="cursor-pointer transition-colors hover:text-primary">Admin Console</li>
              <li className="cursor-pointer transition-colors hover:text-primary">Telemedicine</li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Compliance</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> HIPAA Compliant
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> SOC 2 Type II
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> GDPR Ready
              </li>
              <li className="cursor-pointer transition-colors hover:text-primary">Privacy Policy</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 Medi-Care Systems. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  )
}
