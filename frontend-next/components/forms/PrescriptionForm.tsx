'use client'

import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useState, useMemo } from 'react'

import { FormField, FormSelect, FormTextarea } from '@/components/FormField'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import {
  prescriptionSchema,
  type PrescriptionInput,
} from '@/lib/validations/prescription'
import { calculatePatientMedicationSafetyScore } from '@/lib/utils/medication-safety'
import type { Patient } from '@/lib/types'

interface Props {
  patients: Patient[]
  defaultPatientId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PrescriptionForm({
  patients,
  defaultPatientId,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PrescriptionInput>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patient_id: defaultPatientId ?? '',
      diagnosis: '',
      notes: '',
      status: 'active',
      items: [
        {
          medication_name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const assessment = useMemo(() => {
    const meds = (items ?? [])
      .map((i) => i.medication_name)
      .filter(Boolean)
    if (meds.length === 0) return null
    return calculatePatientMedicationSafetyScore({ medications: meds })
  }, [items])

  const onSubmit = async (values: PrescriptionInput) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast({
          title: 'Could not save prescription',
          description: data.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Prescription created',
        description: 'The patient has been notified.',
      })
      router.refresh()
      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          id="patient_id"
          label="Patient"
          required
          error={errors.patient_id?.message}
          {...register('patient_id')}
        >
          <option value="">Select a patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.email}
            </option>
          ))}
        </FormSelect>
        <FormSelect
          id="status"
          label="Status"
          {...register('status')}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </FormSelect>
      </div>

      <FormField
        id="diagnosis"
        label="Diagnosis"
        required
        placeholder="e.g. Hypertension, stage 2"
        error={errors.diagnosis?.message}
        {...register('diagnosis')}
      />

      <FormTextarea
        id="notes"
        label="Notes"
        rows={2}
        placeholder="Optional notes for the patient or pharmacy."
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Medication safety banner */}
      {assessment && assessment.riskLevel !== 'LOW' && (
        <div
          className={`flex items-start gap-2 rounded-md border p-3 text-xs ${
            assessment.riskLevel === 'HIGH'
              ? 'border-destructive/30 bg-destructive/5 text-destructive'
              : 'border-accent/30 bg-accent/5 text-accent'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div className="space-y-1">
            <p>
              <strong>{assessment.riskLevel} risk</strong> · safety score{' '}
              {assessment.safetyScore}/100 · {assessment.interactionCount}{' '}
              interaction(s)
            </p>
            {assessment.severeInteractions.map((i, idx) => (
              <p key={idx}>{i.description}</p>
            ))}
            {assessment.dosageWarnings.map((w, idx) => (
              <p key={`w-${idx}`}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Prescription items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Medications
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                medication_name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
              })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add medication
          </Button>
        </div>

        {errors.items?.message && (
          <p className="text-[11px] text-destructive">{errors.items.message}</p>
        )}

        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="space-y-3 rounded-md border border-border bg-secondary/20 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Medication #{idx + 1}
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(idx)}
                  aria-label={`Remove medication ${idx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                id={`items.${idx}.medication_name`}
                label="Medication"
                required
                placeholder="e.g. Lisinopril"
                error={errors.items?.[idx]?.medication_name?.message}
                {...register(`items.${idx}.medication_name`)}
              />
              <FormField
                id={`items.${idx}.dosage`}
                label="Dosage"
                required
                placeholder="e.g. 10mg"
                error={errors.items?.[idx]?.dosage?.message}
                {...register(`items.${idx}.dosage`)}
              />
              <FormField
                id={`items.${idx}.frequency`}
                label="Frequency"
                required
                placeholder="e.g. Once daily"
                error={errors.items?.[idx]?.frequency?.message}
                {...register(`items.${idx}.frequency`)}
              />
              <FormField
                id={`items.${idx}.duration`}
                label="Duration"
                required
                placeholder="e.g. 30 days"
                error={errors.items?.[idx]?.duration?.message}
                {...register(`items.${idx}.duration`)}
              />
            </div>
            <FormTextarea
              id={`items.${idx}.instructions`}
              label="Instructions"
              rows={2}
              placeholder="e.g. Take in the morning with food."
              {...register(`items.${idx}.instructions`)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            'Save prescription'
          )}
        </Button>
      </div>
    </form>
  )
}
