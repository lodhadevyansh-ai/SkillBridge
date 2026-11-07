import { z } from 'zod'

export const updateCandidateStageSchema = z.object({
  stage: z.string({ required_error: 'Candidate stage is required' }).trim().min(1, 'Candidate stage cannot be empty'),
  note: z.string().max(2000).optional().nullable(),
})

export const scheduleInterviewSchema = z.object({
  interviewDate: z.string({ required_error: 'Interview date is required' }).trim().min(1, 'Interview date is required'),
  interviewTime: z.string({ required_error: 'Interview time is required' }).trim().min(1, 'Interview time is required'),
  interviewMode: z.string().optional(),
  meetingUrl: z.string().optional().nullable(),
  instructions: z.string().max(2000).optional().nullable(),
})

export const addNoteSchema = z.object({
  text: z.string().optional(),
  note: z.string().optional(),
}).refine((data) => (data.text && data.text.trim().length > 0) || (data.note && data.note.trim().length > 0), {
  message: 'Note content cannot be blank',
})

