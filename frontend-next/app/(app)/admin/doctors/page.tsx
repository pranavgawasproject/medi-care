import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listDoctors } from '@/lib/db/doctors'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Avatar } from '@/components/Avatar'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { Stethoscope } from 'lucide-react'
import type { Doctor } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Doctors',
  description: 'Manage doctor profiles and specializations.',
}

export default async function AdminDoctorsPage() {
  const _user = await requireRoleOrRedirect('admin')
  const res = await listDoctors()
  if (res.error) return <ErrorState message={res.error.message} />

  const doctors = res.data ?? []

  const columns: DataTableColumn<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor',
      cell: (d) => (
        <div className="flex items-center gap-3">
          <Avatar name={d.full_name} role="doctor" size="sm" />
          <span className="font-medium text-foreground">{d.full_name}</span>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialty',
      cell: (d) => <span className="text-muted-foreground">{d.specialization}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      cell: (d) => <span className="text-muted-foreground">{d.location}</span>,
    },
    {
      key: 'capacity',
      header: 'Max/day',
      align: 'right',
      cell: (d) => <span className="num">{d.max_patients_per_day}</span>,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Doctors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All registered practitioners and their clinic assignments.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={doctors}
        getRowId={(d) => d.id}
        emptyState={
          <EmptyState
            icon={<Stethoscope className="h-5 w-5" />}
            title="No doctors yet"
            description="Add doctor records to make them available for appointments."
          />
        }
      />
    </div>
  )
}
