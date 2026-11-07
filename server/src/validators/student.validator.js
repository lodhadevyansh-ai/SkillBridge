import { z } from 'zod'

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80).optional(),
  headline: z.string().max(200).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional(),
  about: z.string().max(4000).optional().nullable(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  github: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  portfolio: z.string().optional().nullable(),
})

export const uploadResumeSchema = z.object({
  name: z.string({ required_error: 'Resume file name is required.' }).trim().min(1, 'Resume file name is required.'),
  fileSize: z.number().max(5 * 1024 * 1024, 'File size exceeds maximum allowed limit of 5 MB.').optional(),
  fileType: z.string().optional(),
  fileData: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
})

