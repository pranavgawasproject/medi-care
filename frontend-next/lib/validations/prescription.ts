import { z } from 'zod'

export const prescriptionItemSchema = z.object({
  medication_name: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  duration: z.string().min(1, 'Duration is required.'),
  instructions: z.string().max(500).optional(),
})
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>

export const prescriptionSchema = z.object({
  patient_id: z.string().uuid('Select a patient.'),
  diagnosis: z.string().min(2, 'Diagnosis is required.'),
  notes: z.string().max(2000).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
  items: z
    .array(prescriptionItemSchema)
    .min(1, 'Add at least one medication.'),
})
export type PrescriptionInput = z.infer<typeof prescriptionSchema>

export const prescriptionPatchSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  notes: z.string().max(2000).optional(),
})
export type PrescriptionPatch = z.infer<typeof prescriptionPatchSchema>
