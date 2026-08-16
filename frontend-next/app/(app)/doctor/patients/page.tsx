import type { Metadata } from 'next'
import Link from 'next/link'
import { requireRoleOrRedirect } from '@/lib/auth'
import { searchPatients } from '@/lib/db/patients'
import { DataTable, type DataTableColumn } from '@/components/DataTable'
import { Avatar } from '@/components/Avatar'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { PatientSearch } from './PatientSearch'
import { Users } from 'lucide-react'
import type { Patient } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Patients',
  description: 'Search and manage your patient panel.',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function DoctorPatientsPage({ searchParams }: PageProps) {
  const _user = await requireRoleOrRedirect('doctor')
  const { q } = await searchParams

  const res = await searchPatients(q ?? '')
  if (res.error) return <ErrorState message={res.error.message} />

  const patients = res.data ?? []

  const columns: DataTableColumn<Patient>[] = [
    {
      key: 'name',
      header: 'Patient',
      cell: (p) => (
        <Link
          href={`/doctor/patients/${p.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar name={p.name} size="sm" />
          <span className="font-medium text-foreground">{p.name}</span>
        </Link>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (p) => <span className="text-muted-foreground">{p.email}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (p) => <span className="num text-muted-foreground">{p.phone}</span>,
    },
    {
      key: 'history',
      header: 'Medical history',
      cell: (p) => (
        <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
          {p.medical_history ?? '—'}
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
          Patients
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search and access patient records.
        </p>
      </div>

      <PatientSearch initialQuery={q ?? ''} />

      <DataTable
        columns={columns}
        rows={patients}
        getRowId={(p) => p.id}
        emptyState={
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title={q ? `No patients match "${q}"` : 'No patients yet'}
            description={
              q
                ? 'Try a different name, email, or phone number.'
                : 'Patients will appear here once they book an appointment.'
            }
          />
        }
      />
    </div>
  )
}
