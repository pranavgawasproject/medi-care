'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { MedicalRecordForm } from '@/components/forms/MedicalRecordForm'
import type { Patient } from '@/lib/types'

interface Props {
  patients: Patient[]
  defaultPatientId?: string
}

export function AddMedicalRecordButton({ patients, defaultPatientId }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <ClipboardList className="mr-1.5 h-3.5 w-3.5" /> Add record
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add medical record"
        description="Document a visit, diagnosis, treatment, allergy, immunization, or surgery."
        size="md"
      >
        <MedicalRecordForm
          patients={patients}
          defaultPatientId={defaultPatientId}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
