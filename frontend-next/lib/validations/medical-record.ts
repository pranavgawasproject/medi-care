import { z } from 'zod'

export const medicalRecordSchema = z.object({
  patient_id: z.string().uuid('Select a patient.'),
  record_type: z.enum([
    'visit',
    'diagnosis',
    'treatment',
    'allergy',
    'immunization',
    'surgery',
  ]),
  title: z.string().min(2, 'Title is required.'),
  description: z.string().max(5000).optional(),
  record_date: z.string().min(1, 'Date is required.'),
  attachments: z.array(z.string().url()).default([]),
})
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>

export const medicalRecordPatchSchema = z.object({
  record_type: z
    .enum([
      'visit',
      'diagnosis',
      'treatment',
      'allergy',
      'immunization',
      'surgery',
    ])
    .optional(),
  title: z.string().min(2).optional(),
  description: z.string().max(5000).optional(),
  record_date: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
})
export type MedicalRecordPatch = z.infer<typeof medicalRecordPatchSchema>
