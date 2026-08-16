import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listProfiles } from '@/lib/db/profiles'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Avatar } from '@/components/Avatar'
import { StatusBadge } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { Users } from 'lucide-react'
import type { Profile } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Users',
  description: 'Manage user accounts and roles.',
}

export default async function AdminUsersPage() {
  const _user = await requireRoleOrRedirect('admin')
  const res = await listProfiles()
  if (res.error) return <ErrorState message={res.error.message} />

  const profiles = res.data ?? []

  const columns: DataTableColumn<Profile>[] = [
    {
      key: 'name',
      header: 'User',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.full_name ?? p.email} role={p.role} src={p.avatar_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {p.full_name ?? 'Unnamed'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{p.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (p) => <StatusBadge status={p.role} />,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (p) => <span className="num text-muted-foreground">{p.phone ?? '—'}</span>,
    },
    {
      key: 'created_at',
      header: 'Joined',
      cell: (p) => <DateBadge date={p.created_at} formatStr="MMM d, yyyy" />,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All registered users across patient, doctor, and admin roles.
        </p>
      </div>

      <DataTable
        columns={columns}
        rows={profiles}
        getRowId={(p) => p.id}
        emptyState={
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No users yet"
            description="Users will appear here once they sign up."
          />
        }
      />
    </div>
  )
}
