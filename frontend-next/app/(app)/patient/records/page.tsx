import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listMedicalRecordsForPatient } from '@/lib/db/medical-records'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { StatusBadge } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { ClipboardList } from 'lucide-react'
import type { MedicalRecord } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Medical records',
  description: 'Your medical history.',
}

export default async function PatientRecordsPage() {
  const user = await requireRoleOrRedirect('patient')
  const res = await listMedicalRecordsForPatient(user.id)
  if (res.error) return <ErrorState message={res.error.message} />

  const records = res.data ?? []

  const columns: DataTableColumn<MedicalRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (r) => <DateBadge date={r.record_date} formatStr="MMM d, yyyy" />,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (r) => <StatusBadge status={r.record_type} />,
    },
    {
      key: 'title',
      header: 'Title',
      cell: (r) => <span className="font-medium text-foreground">{r.title}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      cell: (r) => (
        <span className="line-clamp-2 max-w-md text-xs text-muted-foreground">
          {r.description ?? '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Medical records
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visits, diagnoses, treatments, allergies, immunizations, and surgeries.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={records}
        getRowId={(r) => r.id}
        emptyState={
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title="No medical records yet"
            description="When your doctor documents a visit or diagnosis, it will appear here."
          />
        }
      />
    </div>
  )
}
