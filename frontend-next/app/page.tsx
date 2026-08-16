import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CalendarDays,
  FileText,
  FlaskConical,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { getCurrentUserOrNull } from '@/lib/auth'
import { dashboardPathForRole } from '@/lib/auth'
import { EcgDivider } from '@/components/ui'
import { isSupabaseConfigured } from '@/lib/supabase/server'

export default async function LandingPage() {
  // If logged in, send to dashboard.
  const user = await getCurrentUserOrNull()
  if (user?.profile) {
    redirect(dashboardPathForRole(user.profile.role))
  }

  const configured = isSupabaseConfigured()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
                Healthcare Platform
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {configured ? (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-foreground hover:bg-secondary/60"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Get started
                </Link>
              </>
            ) : (
              <span className="rounded-sm border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wide text-accent">
                Demo build
              </span>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Enterprise healthcare platform
              </span>
              <h1
                className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Healthcare operations,
                <br />
                <span className="text-primary">without the chaos.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                A unified workspace for patients, practitioners, and clinic
                administrators. Book consultations, manage prescriptions, track
                lab results, and keep every medical record in one secure place.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={configured ? '/signup' : '/login'}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-secondary/60"
                >
                  Sign in
                </Link>
              </div>
              {!configured && (
                <p className="mt-4 text-[11px] text-muted-foreground">
                  Supabase is not configured — sign-in is disabled. Set{' '}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
                  to enable.
                </p>
              )}
            </div>
          </div>
          <EcgDivider pulse className="opacity-50" />
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="For patients"
              description="Book appointments, view prescriptions, track lab results, and access your complete medical history — all in one place."
              features={[
                'Book & manage appointments',
                'View active prescriptions',
                'Access lab reports online',
                'Receive appointment reminders',
              ]}
            />
            <FeatureCard
              icon={<Stethoscope className="h-5 w-5" />}
              title="For practitioners"
              description="Manage your patient panel, prescribe with safety checks, order labs, and document visits with structured medical records."
              features={[
                'Patient panel with search',
                'Medication interaction checks',
                'Order & track lab tests',
                'Structured medical records',
              ]}
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="For administrators"
              description="Run the clinic with analytics, user management, doctor onboarding, and a complete audit trail of every action."
              features={[
                'Clinic-wide analytics',
                'User & doctor management',
                'Complete audit log',
                'Role-based access control',
              ]}
            />
          </div>
        </section>

        {/* Modules */}
        <section className="border-y border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Every part of the patient journey, covered.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              From the first appointment to long-term care, MediCare keeps the
              whole care team on the same page.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ModuleCard
                icon={<CalendarDays className="h-5 w-5" />}
                title="Appointments"
                description="Self-service booking with urgency triage and realtime status updates."
              />
              <ModuleCard
                icon={<FileText className="h-5 w-5" />}
                title="Prescriptions"
                description="Structured e-prescriptions with built-in drug interaction safety checks."
              />
              <ModuleCard
                icon={<FlaskConical className="h-5 w-5" />}
                title="Lab reports"
                description="Order tests, track status, and notify patients the moment results are ready."
              />
              <ModuleCard
                icon={<HeartPulse className="h-5 w-5" />}
                title="Medical records"
                description="Structured records for visits, diagnoses, treatments, allergies, and immunizations."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-md border border-border bg-card p-10 text-center">
            <h2
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Ready to modernize your clinic?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Set up your Supabase project, run the schema, and start inviting
              patients and practitioners in minutes.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={configured ? '/signup' : '/login'}
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-secondary/60"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
                <HeartPulse className="h-4 w-4 text-primary" />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Medi<span className="text-primary">Care</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground">
              © {new Date().getFullYear()} MediCare. HIPAA-aware by design.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
        {icon}
      </div>
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ModuleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground">
        {icon}
      </div>
      <h4
        className="mt-3 text-sm font-semibold"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h4>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
