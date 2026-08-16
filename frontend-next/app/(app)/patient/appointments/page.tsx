import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { getPatientByProfile } from '@/lib/db/patients'
import { listDoctors } from '@/lib/db/doctors'
import { listAppointmentsForPatient } from '@/lib/db/appointments'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { StatusBadge } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { BookAppointmentButton } from '@/components/forms/BookAppointmentButton'
import { CalendarDays } from 'lucide-react'
import type { AppointmentWithRelations } from '@/lib/db/appointments'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Appointments',
  description: 'Your appointment history.',
}

export default async function PatientAppointmentsPage() {
  const user = await requireRoleOrRedirect('patient')
  const patientRes = await getPatientByProfile(user.id)
  const doctorsRes = await listDoctors()

  if (patientRes.error) {
    return <ErrorState message={patientRes.error.message} />
  }
  const patient = patientRes.data
  if (!patient) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-5 w-5" />}
        title="No patient profile linked"
        description="An administrator needs to link your account before you can book appointments."
      />
    )
  }

  const apptsRes = await listAppointmentsForPatient(patient.id)
  if (apptsRes.error) return <ErrorState message={apptsRes.error.message} />

  const appts = apptsRes.data ?? []
  const doctors = doctorsRes.data ?? []

  const columns: DataTableColumn<AppointmentWithRelations>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (a) => <DateBadge date={a.appointment_date} formatStr="EEE, MMM d, yyyy" />,
    },
    {
      key: 'time',
      header: 'Time',
      cell: (a) => <span className="num">{a.appointment_time}</span>,
    },
    {
      key: 'doctor',
      header: 'Doctor',
      cell: (a) => a.doctor?.full_name ?? '—',
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (a) => (
        <span className="line-clamp-1 max-w-xs text-muted-foreground">
          {a.reason ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (a) => <StatusBadge status={a.status} />,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book, track, and review every consultation.
          </p>
        </div>
        <BookAppointmentButton doctors={doctors} patient={patient} />
      </div>

      <DataTable
        columns={columns}
        rows={appts}
        getRowId={(a) => a.id}
        emptyState={
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="No appointments yet"
            description="Book your first appointment to see it here."
            action={
              <Link
                href="/patient"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Go to dashboard
              </Link>
            }
          />
        }
      />
    </div>
  )
}
