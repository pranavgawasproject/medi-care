import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listAuditLogs } from '@/lib/db/audit-logs'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { ScrollText } from 'lucide-react'
import type { AuditLog } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Audit log',
  description: 'Complete activity trail of every mutation in the system.',
}

export default async function AdminAuditLogPage() {
  const _user = await requireRoleOrRedirect('admin')
  const res = await listAuditLogs(200)
  if (res.error) return <ErrorState message={res.error.message} />

  const logs = res.data ?? []

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: 'created_at',
      header: 'When',
      cell: (l) => <DateBadge date={l.created_at} relative />,
    },
    {
      key: 'action',
      header: 'Action',
      cell: (l) => (
        <span className="font-mono text-xs text-foreground">{l.action}</span>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      cell: (l) =>
        l.entity_type ? (
          <span className="text-xs text-muted-foreground">
            {l.entity_type}
            {l.entity_id ? ` · ${l.entity_id.slice(0, 8)}` : ''}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'actor',
      header: 'Actor',
      cell: (l) => (
        <span className="font-mono text-xs text-muted-foreground">
          {l.actor_id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'metadata',
      header: 'Metadata',
      cell: (l) =>
        l.metadata ? (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">view</summary>
            <pre className="mt-1 max-w-md overflow-auto rounded bg-secondary/40 p-2 text-[10px]">
              {JSON.stringify(l.metadata, null, 2)}
            </pre>
          </details>
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
          Audit log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every mutation is recorded here — appointments, prescriptions, lab
          orders, medical records, and more.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={logs}
        getRowId={(l) => l.id}
        emptyState={
          <EmptyState
            icon={<ScrollText className="h-5 w-5" />}
            title="No audit entries yet"
            description="Activity will be recorded here as users interact with the system."
          />
        }
      />
    </div>
  )
}
