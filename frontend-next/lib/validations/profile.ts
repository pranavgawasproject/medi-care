import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name.'),
  phone: z.string().max(40).optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
})
export type ProfileInput = z.infer<typeof profileSchema>
