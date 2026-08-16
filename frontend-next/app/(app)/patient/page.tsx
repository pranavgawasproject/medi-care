import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { getPatientByProfile } from '@/lib/db/patients'
import { listDoctors } from '@/lib/db/doctors'
import {
  listAppointmentsForPatient,
} from '@/lib/db/appointments'
import { listPrescriptionsForPatient } from '@/lib/db/prescriptions'
import { listLabReportsForPatient } from '@/lib/db/lab-reports'
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
import { BookAppointmentButton } from '@/components/forms/BookAppointmentButton'
import { CalendarDays, FileText, FlaskConical, Bell } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Patient dashboard',
  description: 'Your appointments, prescriptions, and lab results.',
}

export default async function PatientDashboardPage() {
  const user = await requireRoleOrRedirect('patient')

  const patientRes = await getPatientByProfile(user.id)
  const doctorsRes = await listDoctors()
  const unreadRes = await countUnread(user.id)

  if (patientRes.error || doctorsRes.error) {
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        message={patientRes.error?.message ?? doctorsRes.error?.message ?? ''}
      />
    )
  }

  const patient = patientRes.data
  const doctors = doctorsRes.data ?? []

  if (!patient) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome to MediCare
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account is ready, but you don&rsquo;t have a patient record
            yet. An administrator can link your account to a patient profile.
          </p>
        </div>
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="No patient profile linked"
          description="Once an administrator links your account to a patient record, you'll see appointments, prescriptions, and lab results here."
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
    listAppointmentsForPatient(patient.id),
    listPrescriptionsForPatient(user.id),
    listLabReportsForPatient(user.id),
  ])

  const appointments = apptsRes.data ?? []
  const prescriptions = rxRes.data ?? []
  const labs = labsRes.data ?? []

  const upcoming = appointments
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .slice(0, 6)

  const activeRx = prescriptions.filter((p) => p.status === 'active')
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
            Hello, {patient.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&rsquo;s a snapshot of your care.
          </p>
        </div>
        <BookAppointmentButton doctors={doctors} patient={patient} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming appointments"
          value={upcoming.length}
          icon={CalendarDays}
          hint={upcoming[0] ? `Next: ${upcoming[0].appointment_date}` : 'None scheduled'}
        />
        <StatCard
          label="Active prescriptions"
          value={activeRx.length}
          icon={FileText}
          hint={activeRx[0] ? `Last: ${activeRx[0].diagnosis}` : 'None active'}
        />
        <StatCard
          label="Pending lab tests"
          value={pendingLabs.length}
          icon={FlaskConical}
          hint={pendingLabs[0] ? pendingLabs[0].test_name : 'All complete'}
        />
        <StatCard
          label="Unread notifications"
          value={unreadRes.data ?? 0}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingAppointments
            appointments={upcoming.map((a) => ({
              id: a.id,
              date: a.appointment_date,
              time: a.appointment_time,
              doctorName: a.doctor?.full_name,
              status: a.status,
              reason: a.reason,
            }))}
            perspective="patient"
            emptyMessage="Book an appointment to get started."
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeRx.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                  No active prescriptions.
                </p>
              ) : (
                <ol className="divide-y divide-border">
                  {activeRx.slice(0, 5).map((rx) => (
                    <li key={rx.id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {rx.diagnosis}
                        </p>
                        <StatusBadge status={rx.status} />
                      </div>
                      {rx.items && rx.items.length > 0 && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {rx.items.map((i) => i.medication_name).join(', ')}
                        </p>
                      )}
                      <DateBadge
                        date={rx.created_at}
                        relative
                        className="mt-1 text-[10px] text-muted-foreground"
                      />
                    </li>
                  ))}
                </ol>
              )}
              <div className="border-t border-border p-3">
                <Link
                  href="/patient/prescriptions"
                  className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  View all prescriptions →
                </Link>
              </div>
            </CardContent>
          </Card>

          <RecentActivity
            items={[
              ...labs.slice(0, 3).map((l) => ({
                id: l.id,
                title: `Lab test: ${l.test_name}`,
                description: l.result_summary ?? undefined,
                timestamp: l.ordered_at,
                icon: <FlaskConical className="h-3.5 w-3.5" />,
              })),
              ...prescriptions.slice(0, 3).map((p) => ({
                id: p.id,
                title: `Prescription: ${p.diagnosis}`,
                description: p.notes ?? undefined,
                timestamp: p.created_at,
                icon: <FileText className="h-3.5 w-3.5" />,
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
