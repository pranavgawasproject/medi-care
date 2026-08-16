import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { getDoctorByProfile } from '@/lib/db/doctors'
import { listAppointmentsForDoctor } from '@/lib/db/appointments'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { StatusBadge } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { CalendarDays } from 'lucide-react'
import type { AppointmentWithRelations } from '@/lib/db/appointments'

export const metadata: Metadata = {
  title: 'Appointments · Doctor',
  description: 'Your appointment schedule.',
}

export default async function DoctorAppointmentsPage() {
  const user = await requireRoleOrRedirect('doctor')
  const doctorRes = await getDoctorByProfile(user.id)
  if (doctorRes.error) return <ErrorState message={doctorRes.error.message} />

  const doctor = doctorRes.data
  if (!doctor) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-5 w-5" />}
        title="No doctor profile linked"
        description="An administrator needs to link your account before you can see appointments."
      />
    )
  }

  const apptsRes = await listAppointmentsForDoctor(doctor.id)
  if (apptsRes.error) return <ErrorState message={apptsRes.error.message} />

  const appts = apptsRes.data ?? []

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
      key: 'patient',
      header: 'Patient',
      cell: (a) => a.patient?.name ?? '—',
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
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Appointment schedule
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All upcoming and past appointments for your panel.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={appts}
        getRowId={(a) => a.id}
        emptyState={
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="No appointments yet"
            description="Your scheduled appointments will appear here."
          />
        }
      />
    </div>
  )
}
