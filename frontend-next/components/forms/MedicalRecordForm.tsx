'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { FormField, FormSelect, FormTextarea } from '@/components/FormField'
import { Button } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import {
  medicalRecordSchema,
  type MedicalRecordInput,
} from '@/lib/validations/medical-record'
import type { Patient } from '@/lib/types'

interface Props {
  patients: Patient[]
  defaultPatientId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function MedicalRecordForm({
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
    formState: { errors },
  } = useForm<MedicalRecordInput>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_id: defaultPatientId ?? '',
      record_type: 'visit',
      title: '',
      description: '',
      record_date: new Date().toISOString().slice(0, 10),
      attachments: [],
    },
  })

  const onSubmit = async (values: MedicalRecordInput) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast({
          title: 'Could not save record',
          description: data.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Record added', description: 'The medical record was saved.' })
      router.refresh()
      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          id="record_type"
          label="Record type"
          required
          {...register('record_type')}
        >
          <option value="visit">Visit</option>
          <option value="diagnosis">Diagnosis</option>
          <option value="treatment">Treatment</option>
          <option value="allergy">Allergy</option>
          <option value="immunization">Immunization</option>
          <option value="surgery">Surgery</option>
        </FormSelect>
        <FormField
          id="record_date"
          label="Date"
          type="date"
          required
          error={errors.record_date?.message}
          {...register('record_date')}
        />
      </div>

      <FormField
        id="title"
        label="Title"
        required
        placeholder="e.g. Annual physical exam"
        error={errors.title?.message}
        {...register('title')}
      />

      <FormTextarea
        id="description"
        label="Description"
        rows={5}
        placeholder="Findings, observations, treatment plan, etc."
        {...register('description')}
      />

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
            'Save record'
          )}
        </Button>
      </div>
    </form>
  )
}
