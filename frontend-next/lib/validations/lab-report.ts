import { z } from 'zod'

export const labReportSchema = z.object({
  patient_id: z.string().uuid('Select a patient.'),
  test_name: z.string().min(2, 'Test name is required.'),
  test_type: z.enum(['blood', 'urine', 'imaging', 'biopsy', 'other']),
  result_summary: z.string().max(2000).optional(),
  result_url: z.string().url().optional().or(z.literal('')),
})
export type LabReportInput = z.infer<typeof labReportSchema>

export const labReportPatchSchema = z.object({
  status: z
    .enum(['ordered', 'collected', 'in_progress', 'completed', 'cancelled'])
    .optional(),
  result_summary: z.string().max(2000).optional(),
  result_url: z.string().url().optional().or(z.literal('')),
  completed_at: z.string().optional(),
})
export type LabReportPatch = z.infer<typeof labReportPatchSchema>
