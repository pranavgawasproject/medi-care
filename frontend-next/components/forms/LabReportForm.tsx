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
  labReportSchema,
  type LabReportInput,
} from '@/lib/validations/lab-report'
import type { Patient } from '@/lib/types'

interface Props {
  patients: Patient[]
  defaultPatientId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function LabReportForm({ patients, defaultPatientId, onSuccess, onCancel }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LabReportInput>({
    resolver: zodResolver(labReportSchema),
    defaultValues: {
      patient_id: defaultPatientId ?? '',
      test_name: '',
      test_type: 'blood',
      result_summary: '',
      result_url: '',
    },
  })

  const onSubmit = async (values: LabReportInput) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/lab-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast({
          title: 'Could not order test',
          description: data.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Lab test ordered',
        description: 'The patient will be notified when results are ready.',
      })
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
        <FormField
          id="test_name"
          label="Test name"
          required
          placeholder="e.g. Complete blood count"
          error={errors.test_name?.message}
          {...register('test_name')}
        />
        <FormSelect
          id="test_type"
          label="Test type"
          required
          {...register('test_type')}
        >
          <option value="blood">Blood</option>
          <option value="urine">Urine</option>
          <option value="imaging">Imaging</option>
          <option value="biopsy">Biopsy</option>
          <option value="other">Other</option>
        </FormSelect>
      </div>

      <FormTextarea
        id="result_summary"
        label="Notes (optional)"
        rows={3}
        placeholder="Any notes for the lab or the patient about this test."
        {...register('result_summary')}
      />

      <FormField
        id="result_url"
        label="Result URL (optional)"
        placeholder="https://"
        error={errors.result_url?.message}
        {...register('result_url')}
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ordering…
            </>
          ) : (
            'Order test'
          )}
        </Button>
      </div>
    </form>
  )
}
