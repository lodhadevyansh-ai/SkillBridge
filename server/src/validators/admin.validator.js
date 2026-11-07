import { z } from 'zod'

export const suspendUserSchema = z.object({
  reason: z.string({ required_error: 'Suspension reason is required' }).trim().min(3, 'Suspension reason must be at least 3 characters'),
})

export const approveJobSchema = z.object({
  notes: z.string().optional(),
})

export const removeJobSchema = z.object({
  reason: z.string().optional(),
})

