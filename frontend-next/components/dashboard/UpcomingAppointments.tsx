import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { StatusBadge } from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'

export interface UpcomingAppointment {
  id: string
  date: string
  time: string
  patientName?: string
  doctorName?: string
  status: string
  reason?: string | null
}

interface UpcomingAppointmentsProps {
  appointments: UpcomingAppointment[]
  /** "patient" → shows doctor name; "doctor" → shows patient name. */
  perspective: 'patient' | 'doctor'
  emptyMessage?: string
  className?: string
}

export function UpcomingAppointments({
  appointments,
  perspective,
  emptyMessage,
  className,
}: UpcomingAppointmentsProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming appointments</CardTitle>
        <Link
          href={`/${perspective}/appointments`}
          className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="px-5 py-6">
            <EmptyState
              icon={<Calendar className="h-5 w-5" />}
              title="No upcoming appointments"
              description={emptyMessage ?? 'Schedule one to get started.'}
            />
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {appointments.slice(0, 6).map((appt) => (
              <li
                key={appt.id}
                className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {perspective === 'patient'
                      ? appt.doctorName ?? 'Doctor'
                      : appt.patientName ?? 'Patient'}
                  </p>
                  {appt.reason && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {appt.reason}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                    <DateBadge date={appt.date} formatStr="EEE, MMM d" /> ·{' '}
                    {appt.time}
                  </p>
                </div>
                <StatusBadge status={appt.status} />
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
