'use client'

import { useState } from 'react'
import { Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { PrescriptionForm } from '@/components/forms/PrescriptionForm'
import type { Patient } from '@/lib/types'

interface Props {
  patients: Patient[]
  defaultPatientId?: string
}

export function PrescribeButton({ patients, defaultPatientId }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Stethoscope className="mr-1.5 h-3.5 w-3.5" /> New prescription
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New prescription"
        description="Issue a prescription. Medication interactions are checked automatically."
        size="lg"
      >
        <PrescriptionForm
          patients={patients}
          defaultPatientId={defaultPatientId}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
