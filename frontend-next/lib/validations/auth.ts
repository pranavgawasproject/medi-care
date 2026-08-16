import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
  full_name: z.string().min(2, 'Enter your full name.'),
  role: z.enum(['patient', 'doctor', 'admin']),
  phone: z.string().optional(),
})
export type SignupInput = z.infer<typeof signupSchema>
