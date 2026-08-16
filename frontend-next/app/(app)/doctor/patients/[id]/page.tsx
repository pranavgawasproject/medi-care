import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRoleOrRedirect } from '@/lib/auth'
import { getPatient } from '@/lib/db/patients'
import { listAppointmentsForPatient } from '@/lib/db/appointments'
import { listPrescriptionsForPatient } from '@/lib/db/prescriptions'
import { listMedicalRecordsForPatient } from '@/lib/db/medical-records'
import { listLabReportsForPatient } from '@/lib/db/lab-reports'
import { Avatar } from '@/components/Avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
} from '@/components/ui'
import { DateBadge } from '@/components/DateBadge'
import { ErrorState } from '@/components/EmptyState'
import { PrescribeButton } from '@/components/forms/PrescribeButton'
import { OrderLabButton } from '@/components/forms/OrderLabButton'
import { AddMedicalRecordButton } from '@/components/forms/AddMedicalRecordButton'
import { ArrowLeft, Phone, Mail } from 'lucide-react'
import type { Patient } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Patient detail',
  description: 'Patient overview, records, prescriptions, and labs.',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: PageProps) {
  const _user = await requireRoleOrRedirect('doctor')
  const { id } = await params

  const patientRes = await getPatient(id)
  if (patientRes.error) return <ErrorState message={patientRes.error.message} />
  const patient = patientRes.data
  if (!patient) notFound()

  // Use the patient.profile_id for profile-keyed tables (prescriptions,
  // medical_records, lab_reports) and patient.id for appointments.
  const profileId = patient.profile_id
  const [apptsRes, rxRes, labsRes, recordsRes] = await Promise.all([
    listAppointmentsForPatient(patient.id),
    profileId
      ? listPrescriptionsForPatient(profileId)
      : Promise.resolve({ data: [], error: null }),
    profileId
      ? listLabReportsForPatient(profileId)
      : Promise.resolve({ data: [], error: null }),
    profileId
      ? listMedicalRecordsForPatient(profileId)
      : Promise.resolve({ data: [], error: null }),
  ])

  const appointments = apptsRes.data ?? []
  const prescriptions = rxRes.data ?? []
  const labs = labsRes.data ?? []
  const records = recordsRes.data ?? []

  // Build a list of "patients" for the prescribe form. The form posts to
  // /api/prescriptions which expects a profile_id; if the patient row has no
  // profile_id, the doctor can't prescribe (admin must link the patient first).
  const formPatients: Patient[] = profileId
    ? [
        {
          id: profileId,
          profile_id: profileId,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          medical_history: patient.medical_history,
        },
      ]
    : []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/doctor/patients"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to patients
      </Link>

      {/* Patient header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={patient.name} size="lg" />
            <div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {patient.name}
              </h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {patient.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {patient.phone}
                </span>
              </div>
              {patient.medical_history && (
                <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                  <strong className="text-foreground">History:</strong>{' '}
                  {patient.medical_history}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {formPatients.length > 0 ? (
              <>
                <PrescribeButton patients={formPatients} defaultPatientId={profileId ?? undefined} />
                <OrderLabButton patients={formPatients} defaultPatientId={profileId ?? undefined} />
                <AddMedicalRecordButton patients={formPatients} defaultPatientId={profileId ?? undefined} />
              </>
            ) : (
              <span className="rounded-sm border border-accent/30 bg-accent/5 px-3 py-1 text-[11px] text-accent">
                Patient has no linked user account — issuing prescriptions / orders is disabled.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Records & prescriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Medical records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {records.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                No medical records yet.
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {records.slice(0, 10).map((r) => (
                  <li key={r.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{r.title}</p>
                      <StatusBadge status={r.record_type} />
                    </div>
                    {r.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                    <DateBadge
                      date={r.record_date}
                      formatStr="MMM d, yyyy"
                      className="mt-1 text-[10px] text-muted-foreground"
                    />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {prescriptions.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                No prescriptions yet.
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {prescriptions.slice(0, 10).map((rx) => (
                  <li key={rx.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {rx.diagnosis}
                      </p>
                      <StatusBadge status={rx.status} />
                    </div>
                    {rx.items && rx.items.length > 0 && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {rx.items.map((i) => i.medication_name).join(', ')}
                      </p>
                    )}
                    <DateBadge
                      date={rx.created_at}
                      relative
                      className="mt-1 text-[10px] text-muted-foreground"
                    />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lab reports + appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Lab reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {labs.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                No lab reports yet.
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {labs.slice(0, 10).map((l) => (
                  <li key={l.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {l.test_name}
                      </p>
                      <StatusBadge status={l.status} />
                    </div>
                    <DateBadge
                      date={l.ordered_at}
                      relative
                      className="mt-1 text-[10px] text-muted-foreground"
                    />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Appointment history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {appointments.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                No appointments yet.
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {appointments.slice(0, 10).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <DateBadge date={a.appointment_date} formatStr="MMM d, yyyy" /> ·{' '}
                        {a.appointment_time}
                      </p>
                      {a.reason && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {a.reason}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
