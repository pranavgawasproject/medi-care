import type { Metadata } from 'next'
import { requireRoleOrRedirect } from '@/lib/auth'
import { listDoctors } from '@/lib/db/doctors'
import { listPatients } from '@/lib/db/patients'
import { listProfiles } from '@/lib/db/profiles'
import { listAppointments } from '@/lib/db/appointments'
import { listAuditLogs } from '@/lib/db/audit-logs'
import { countUnread } from '@/lib/db/notifications'
import { StatCard } from '@/components/dashboard/StatCard'
import { AppointmentsChart } from '@/components/dashboard/AppointmentsChart'
import { PatientsByDepartment } from '@/components/dashboard/PatientsByDepartment'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/EmptyState'
import {
  Users,
  Stethoscope,
  CalendarDays,
  Bell,
  ScrollText,
  ShieldAlert,
} from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

export const metadata: Metadata = {
  title: 'Admin dashboard',
  description: 'Clinic-wide analytics and operations.',
}

export default async function AdminDashboardPage() {
  const _user = await requireRoleOrRedirect('admin')

  const [doctorsRes, patientsRes, profilesRes, apptsRes, auditRes, unreadRes] =
    await Promise.all([
      listDoctors(),
      listPatients(),
      listProfiles(),
      listAppointments({ page: 1, pageSize: 500 }),
      listAuditLogs(20),
      countUnread(_user.id),
    ])

  if (doctorsRes.error || patientsRes.error || profilesRes.error) {
    return (
      <ErrorState
        message={
          doctorsRes.error?.message ??
          patientsRes.error?.message ??
          profilesRes.error?.message ??
          ''
        }
      />
    )
  }

  const doctors = doctorsRes.data ?? []
  const patients = patientsRes.data ?? []
  const profiles = profilesRes.data ?? []
  const appointments = apptsRes.data ?? []
  const audit = auditRes.data ?? []
  const unread = unreadRes.data ?? 0

  // Chart: appointments per day (last 7 days).
  const today = new Date()
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const value = appointments.filter((a) => a.appointment_date === key).length
    return { label: format(d, 'EEE'), value }
  })

  // Chart: patients by doctor specialty.
  const specialtyMap = new Map<string, number>()
  for (const d of doctors) {
    specialtyMap.set(d.specialization, (specialtyMap.get(d.specialization) ?? 0) + 1)
  }
  const specialtyData = Array.from(specialtyMap.entries())
    .map(([label, value]) => ({ label, value }))
    .slice(0, 8)

  const auditItems = audit.map((log) => ({
    id: log.id,
    title: log.action,
    description: log.metadata ? JSON.stringify(log.metadata).slice(0, 80) : undefined,
    timestamp: log.created_at,
    icon: <ScrollText className="h-3.5 w-3.5" />,
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Admin overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Clinic-wide metrics, analytics, and operational insights.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={profiles.length}
          icon={Users}
          hint={`${patients.length} patients · ${doctors.length} doctors`}
        />
        <StatCard
          label="Active doctors"
          value={doctors.length}
          icon={Stethoscope}
        />
        <StatCard
          label="Appointments (30d)"
          value={
            appointments.filter((a) => {
              const d = parseISO(a.appointment_date)
              if (!isValid(d)) return false
              const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
              return diff >= 0 && diff <= 30
            }).length
          }
          icon={CalendarDays}
        />
        <StatCard
          label="Unread alerts"
          value={unread}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointments · last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentsChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctors by specialty</CardTitle>
          </CardHeader>
          <CardContent>
            {specialtyData.length === 0 ? (
              <EmptyState
                icon={<ShieldAlert className="h-5 w-5" />}
                title="No doctors yet"
                description="Add doctors from the Doctors page."
              />
            ) : (
              <PatientsByDepartment data={specialtyData} />
            )}
          </CardContent>
        </Card>
      </div>

      <RecentActivity
        items={auditItems}
        emptyMessage="No recent audit activity."
      />
    </div>
  )
}
