'use client'

import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui'
import { Modal } from '@/components/Modal'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import type { Doctor, Patient } from '@/lib/types'

interface Props {
  doctors: Doctor[]
  patient: Patient
}

export function BookAppointmentButton({ doctors, patient }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Book appointment
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Book an appointment"
        description="Choose a doctor and a time that works for you."
        size="md"
      >
        <AppointmentForm
          doctors={doctors}
          patient={patient}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
