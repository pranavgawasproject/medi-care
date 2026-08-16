import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listLabReportsForPatient } from '@/lib/db/lab-reports'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { StatusBadge } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { FlaskConical } from 'lucide-react'
import type { LabReport } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Lab reports',
  description: 'Your lab test results.',
}

export default async function PatientLabReportsPage() {
  const user = await requireRoleOrRedirect('patient')
  const res = await listLabReportsForPatient(user.id)
  if (res.error) return <ErrorState message={res.error.message} />

  const reports = res.data ?? []

  const columns: DataTableColumn<LabReport>[] = [
    {
      key: 'ordered_at',
      header: 'Ordered',
      cell: (r) => <DateBadge date={r.ordered_at} formatStr="MMM d, yyyy" />,
    },
    {
      key: 'test_name',
      header: 'Test',
      cell: (r) => <span className="font-medium text-foreground">{r.test_name}</span>,
    },
    {
      key: 'test_type',
      header: 'Type',
      cell: (r) => <span className="uppercase text-muted-foreground">{r.test_type}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'result',
      header: 'Result',
      cell: (r) =>
        r.result_summary ? (
          <span className="line-clamp-2 max-w-xs text-xs text-muted-foreground">
            {r.result_summary}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
          Lab reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tests ordered by your doctor and their results.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={reports}
        getRowId={(r) => r.id}
        emptyState={
          <EmptyState
            icon={<FlaskConical className="h-5 w-5" />}
            title="No lab reports yet"
            description="When your doctor orders a lab test, it will appear here."
          />
        }
      />
    </div>
  )
}
