import { z } from 'zod'

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(80, 'Full name cannot exceed 80 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z
      .string({ required_error: 'Please confirm your password' }),
    role: z
      .enum(['student', 'recruiter'], {
        errorMap: () => ({ message: 'Role must be either student or recruiter' }),
      }),
    companyName: z
      .string()
      .trim()
      .optional(),
    terms: z
      .boolean({ required_error: 'You must accept the terms and conditions' })
      .refine((val) => val === true, {
        message: 'You must agree to the Terms of Service & Privacy Policy',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.role === 'recruiter' && (!data.companyName || data.companyName.trim().length === 0)) {
        return false
      }
      return true
    },
    {
      message: 'Company name is required for recruiter registration',
      path: ['companyName'],
    }
  )

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
  role: z
    .enum(['student', 'recruiter', 'admin'])
    .optional(),
})

export const deleteAccountSchema = z.object({
  password: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password cannot be empty'),
  confirmation: z
    .string({ required_error: 'Confirmation text is required' })
    .refine((val) => val === 'DELETE', {
      message: 'Confirmation text must be DELETE',
    }),
})

