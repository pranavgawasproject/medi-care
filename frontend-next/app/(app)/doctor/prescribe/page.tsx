import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listPatients } from '@/lib/db/patients'
import { listPrescriptionsForDoctor } from '@/lib/db/prescriptions'
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
import { Stethoscope } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Prescribe',
  description: 'Issue a new prescription.',
}

export default async function DoctorPrescribePage() {
  const user = await requireRoleOrRedirect('doctor')

  const [patientsRes, rxRes] = await Promise.all([
    listPatients(),
    listPrescriptionsForDoctor(user.id),
  ])

  if (patientsRes.error || rxRes.error) {
    return (
      <ErrorState
        message={patientsRes.error?.message ?? rxRes.error?.message ?? ''}
      />
    )
  }

  const patients = patientsRes.data ?? []
  const recent = rxRes.data ?? []

  // Only patients with a linked profile_id can be prescribed for.
  const prescribable = patients.filter((p) => p.profile_id)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Prescribe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue a new e-prescription. Medication interactions are checked
            automatically before saving.
          </p>
        </div>
        <PrescribeButton patients={prescribable} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recent prescriptions you&rsquo;ve issued</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="px-5 py-8">
              <EmptyState
                icon={<Stethoscope className="h-5 w-5" />}
                title="No prescriptions yet"
                description="Use the button above to issue your first prescription."
              />
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {recent.slice(0, 10).map((rx) => (
                <li
                  key={rx.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {rx.diagnosis}
                    </p>
                    {rx.items && rx.items.length > 0 && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {rx.items.map((i) => i.medication_name).join(', ')}
                      </p>
                    )}
                    <DateBadge
                      date={rx.created_at}
                      relative
                      className="mt-1 text-[10px] text-muted-foreground"
                    />
                  </div>
                  <StatusBadge status={rx.status} />
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
