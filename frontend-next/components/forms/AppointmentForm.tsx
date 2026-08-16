'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useState, useMemo } from 'react'

import { FormField, FormSelect, FormTextarea } from '@/components/FormField'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import {
  appointmentSchema,
  type AppointmentInput,
} from '@/lib/validations/appointment'
import { checkMedicationInteractions } from '@/lib/utils/medication-safety'
import type { Doctor, Patient } from '@/lib/types'

interface Props {
  doctors: Doctor[]
  patient: Patient
  onSuccess?: () => void
  onCancel?: () => void
}

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
]

export function AppointmentForm({ doctors, patient, onSuccess, onCancel }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor_id: '',
      patient_id: patient.id,
      appointment_date: '',
      appointment_time: '',
      reason: '',
      urgency: 'routine',
    },
  })

  // Surfacing the medication-safety utility in a low-stakes spot: if the
  // patient mentions any high-risk drug name in the reason field, we show a
  // warning. This keeps the legacy util wired into the UI without making the
  // booking flow dependent on it.
  const reasonText = watch('reason') ?? ''
  const safetyWarning = useMemo(() => {
    if (!reasonText) return null
    const meds = reasonText
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const { hasHighRisk, warnings } = checkMedicationInteractions(meds)
    if (!hasHighRisk) return null
    return warnings[0] ?? null
  }, [reasonText])

  const onSubmit = async (values: AppointmentInput) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast({
          title: 'Could not book appointment',
          description: data.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Appointment requested',
        description: 'Your doctor will confirm shortly.',
      })
      router.refresh()
      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        id="patient_id"
        type="hidden"
        {...register('patient_id')}
      />
      <FormSelect
        id="doctor_id"
        label="Doctor"
        required
        error={errors.doctor_id?.message}
        {...register('doctor_id')}
      >
        <option value="">Select a doctor…</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.full_name} — {d.specialization}
          </option>
        ))}
      </FormSelect>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="appointment_date"
          label="Date"
          type="date"
          min={today}
          required
          error={errors.appointment_date?.message}
          {...register('appointment_date')}
        />
        <FormSelect
          id="appointment_time"
          label="Time"
          required
          error={errors.appointment_time?.message}
          {...register('appointment_time')}
        >
          <option value="">Select a time…</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </FormSelect>
      </div>

      <FormSelect
        id="urgency"
        label="Urgency"
        required
        hint="Routine = standard consult. Emergency = call 911 if life-threatening."
        {...register('urgency')}
      >
        <option value="routine">Routine</option>
        <option value="urgent">Urgent (within 24h)</option>
        <option value="emergency">Emergency</option>
      </FormSelect>

      <FormTextarea
        id="reason"
        label="Reason for visit"
        rows={3}
        placeholder="Briefly describe your symptoms or reason for the appointment."
        error={errors.reason?.message}
        {...register('reason')}
      />

      {safetyWarning && (
        <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-accent">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Medication safety note:</strong> {safetyWarning}
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking…
            </>
          ) : (
            'Request appointment'
          )}
        </Button>
      </div>
    </form>
  )
}
