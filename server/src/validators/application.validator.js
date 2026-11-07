import { z } from 'zod'

export const applyJobSchema = z.object({
  resumeName: z
    .string({ required_error: 'A valid resume selection or upload is required to submit an application.' })
    .trim()
    .min(1, 'A valid resume selection or upload is required to submit an application.'),
  coverLetter: z.string().max(3000).optional().nullable(),
  portfolioUrl: z.string().url('Portfolio must be a valid URL').optional().or(z.literal('')).nullable(),
  phone: z.string().max(20).optional().nullable(),
})

export const withdrawApplicationSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
})

