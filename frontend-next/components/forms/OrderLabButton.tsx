'use client'

import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { LabReportForm } from '@/components/forms/LabReportForm'
import type { Patient } from '@/lib/types'

interface Props {
  patients: Patient[]
  defaultPatientId?: string
}

export function OrderLabButton({ patients, defaultPatientId }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <FlaskConical className="mr-1.5 h-3.5 w-3.5" /> Order lab test
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Order lab test"
        description="Order a diagnostic test for a patient."
        size="md"
      >
        <LabReportForm
          patients={patients}
          defaultPatientId={defaultPatientId}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
