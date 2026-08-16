import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listPrescriptionsForPatient } from '@/lib/db/prescriptions'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
} from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Prescriptions',
  description: 'Your prescription history.',
}

export default async function PatientPrescriptionsPage() {
  const user = await requireRoleOrRedirect('patient')
  const res = await listPrescriptionsForPatient(user.id)
  if (res.error) return <ErrorState message={res.error.message} />

  const prescriptions = res.data ?? []

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Your prescriptions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active and past prescriptions issued by your care team.
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="No prescriptions yet"
          description="When your doctor prescribes medication, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{rx.diagnosis}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Issued <DateBadge date={rx.created_at} formatStr="MMM d, yyyy" />
                  </p>
                </div>
                <StatusBadge status={rx.status} />
              </CardHeader>
              <CardContent>
                {rx.notes && (
                  <p className="mb-3 text-xs text-muted-foreground">{rx.notes}</p>
                )}
                <ul className="divide-y divide-border">
                  {(rx.items ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.medication_name}{' '}
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.dosage}
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.frequency} · {item.duration}
                        </p>
                      </div>
                      {item.instructions && (
                        <p className="text-[11px] text-muted-foreground sm:text-right">
                          {item.instructions}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
