import { z } from 'zod'

export const appointmentSchema = z.object({
  doctor_id: z.string().uuid('Select a doctor.'),
  patient_id: z.string().uuid().optional(),
  appointment_date: z.string().min(1, 'Pick a date.'),
  appointment_time: z.string().min(1, 'Pick a time.'),
  reason: z.string().max(500).optional(),
  urgency: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
})
export type AppointmentInput = z.infer<typeof appointmentSchema>

export const appointmentPatchSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  appointment_date: z.string().optional(),
  appointment_time: z.string().optional(),
  reason: z.string().max(500).optional(),
  urgency: z.enum(['routine', 'urgent', 'emergency']).optional(),
})
export type AppointmentPatch = z.infer<typeof appointmentPatchSchema>

export const appointmentFiltersSchema = z.object({
  q: z.string().optional(),
  status: z
    .enum(['pending', 'confirmed', 'cancelled', 'completed'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})
export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>
