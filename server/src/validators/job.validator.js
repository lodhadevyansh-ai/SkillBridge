import { z } from 'zod'

export const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Job title is required' })
    .trim()
    .min(3, 'Job title must be at least 3 characters')
    .max(120, 'Job title cannot exceed 120 characters'),
  description: z
    .string({ required_error: 'Job description is required' })
    .trim()
    .min(10, 'Job description must be at least 10 characters')
    .max(5000, 'Job description cannot exceed 5000 characters'),
  type: z.string().trim().optional(),
  location: z.string().trim().optional(),
  arrangement: z.string().trim().optional(),
  experience: z.string().trim().optional(),
  stipend: z.string().trim().optional(),
  minSalary: z.number().nonnegative().optional(),
  maxSalary: z.number().nonnegative().optional(),
  responsibilities: z.any().optional(),
  requirements: z.any().optional(),
  skills: z.array(z.string()).optional(),
  status: z.enum(['Active', 'Draft', 'Closed', 'Under Review']).optional(),
  closesOn: z.string().optional(),
})

export const updateJobSchema = createJobSchema.partial()

