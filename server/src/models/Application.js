import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    id: String,
    authorName: String,
    content: String,
    createdAt: String,
  },
  { _id: false }
)

const interviewSchema = new mongoose.Schema(
  {
    id: String,
    date: String,
    time: String,
    mode: { type: String, enum: ['video', 'in-person', 'phone'], default: 'video' },
    link: String,
    instructions: String,
    scheduledAt: String,
  },
  { _id: false }
)

const timelineItemSchema = new mongoose.Schema(
  {
    status: String,
    date: String,
    note: String,
  },
  { _id: false }
)

const applicationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    recruiterId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    studentPhone: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Withdrawn', 'Hired'],
      default: 'Applied',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    timeline: {
      type: [timelineItemSchema],
      default: [],
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    interview: {
      type: interviewSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound unique index ensuring a student can only apply once to a specific job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true })
applicationSchema.index({ recruiterId: 1, status: 1 })

export const Application =
  mongoose.models.Application || mongoose.model('Application', applicationSchema)
export default Application

