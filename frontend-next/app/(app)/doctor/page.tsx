import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { getDoctorByProfile } from '@/lib/db/doctors'
import { listAppointmentsForDoctor } from '@/lib/db/appointments'
import { listPrescriptionsForDoctor } from '@/lib/db/prescriptions'
import { listLabReportsForDoctor } from '@/lib/db/lab-reports'
import { countUnread } from '@/lib/db/notifications'
import { StatCard } from '@/components/dashboard/StatCard'
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
} from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { PrescribeButton } from '@/components/forms/PrescribeButton'
import { OrderLabButton } from '@/components/forms/OrderLabButton'
import { listPatients } from '@/lib/db/patients'
import {
  CalendarDays,
  FileText,
  FlaskConical,
  Users,
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Doctor dashboard',
  description: 'Your patient panel, appointments, and orders.',
}

export default async function DoctorDashboardPage() {
  const user = await requireRoleOrRedirect('doctor')

  const doctorRes = await getDoctorByProfile(user.id)
  const patientsRes = await listPatients()
  const unreadRes = await countUnread(user.id)

  if (doctorRes.error || patientsRes.error) {
    return (
      <ErrorState
        message={doctorRes.error?.message ?? patientsRes.error?.message ?? ''}
      />
    )
  }

  const doctor = doctorRes.data
  const patients = patientsRes.data ?? []

  if (!doctor) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome, Doctor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account is ready, but you don&rsquo;t have a doctor profile
            yet. An administrator can link your account to a doctor record.
          </p>
        </div>
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No doctor profile linked"
          description="Once an administrator links your account to a doctor record, you'll see your patient panel and appointments here."
          action={
            <Link
              href="/settings"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Account settings
            </Link>
          }
        />
      </div>
    )
  }

  const [apptsRes, rxRes, labsRes] = await Promise.all([
    listAppointmentsForDoctor(doctor.id),
    listPrescriptionsForDoctor(user.id),
    listLabReportsForDoctor(user.id),
  ])

  const appointments = apptsRes.data ?? []
  const prescriptions = rxRes.data ?? []
  const labs = labsRes.data ?? []

  const upcoming = appointments
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .slice(0, 6)
  const pendingLabs = labs.filter(
    (l) => l.status !== 'completed' && l.status !== 'cancelled'
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Dr. {doctor.full_name.replace(/^Dr\.?\s*/i, '')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {doctor.specialization} · {doctor.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrescribeButton patients={patients} />
          <OrderLabButton patients={patients} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's appointments"
          value={
            appointments.filter(
              (a) => a.appointment_date === new Date().toISOString().slice(0, 10)
            ).length
          }
          icon={CalendarDays}
        />
        <StatCard
          label="Total patients"
          value={patients.length}
          icon={Users}
        />
        <StatCard
          label="Active prescriptions"
          value={prescriptions.filter((p) => p.status === 'active').length}
          icon={FileText}
        />
        <StatCard
          label="Pending labs"
          value={pendingLabs.length}
          icon={FlaskConical}
          hint={unreadRes.data ? `${unreadRes.data} unread alerts` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingAppointments
            appointments={upcoming.map((a) => ({
              id: a.id,
              date: a.appointment_date,
              time: a.appointment_time,
              patientName: a.patient?.name,
              status: a.status,
              reason: a.reason,
            }))}
            perspective="doctor"
            emptyMessage="No upcoming appointments scheduled."
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending lab orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingLabs.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                  No pending lab orders.
                </p>
              ) : (
                <ol className="divide-y divide-border">
                  {pendingLabs.slice(0, 5).map((lab) => (
                    <li key={lab.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {lab.test_name}
                        </p>
                        <StatusBadge status={lab.status} />
                      </div>
                      <DateBadge
                        date={lab.ordered_at}
                        relative
                        className="mt-1 text-[10px] text-muted-foreground"
                      />
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <RecentActivity
            items={[
              ...prescriptions.slice(0, 3).map((p) => ({
                id: p.id,
                title: `Prescribed: ${p.diagnosis}`,
                description: p.notes ?? undefined,
                timestamp: p.created_at,
                icon: <FileText className="h-3.5 w-3.5" />,
              })),
              ...labs.slice(0, 3).map((l) => ({
                id: l.id,
                title: `Ordered: ${l.test_name}`,
                description: l.result_summary ?? undefined,
                timestamp: l.ordered_at,
                icon: <FlaskConical className="h-3.5 w-3.5" />,
              })),
            ]
              .sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''))
              .slice(0, 6)}
          />
        </div>
      </div>
    </div>
  )
}
