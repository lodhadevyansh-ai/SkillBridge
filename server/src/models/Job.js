import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companySlug: {
      type: String,
      trim: true,
    },
    recruiterId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Internship', 'Part-time', 'Contract'],
      default: 'Full-time',
    },
    arrangement: {
      type: String,
      required: true,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    stipend: {
      type: String,
      trim: true,
    },
    minSalary: {
      type: Number,
      default: 0,
    },
    experience: {
      type: String,
      trim: true,
      default: 'Fresher / 0-1 yr',
    },
    description: {
      type: String,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Closed'],
      default: 'Active',
      index: true,
    },
    closesOn: {
      type: String,
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

jobSchema.index({ status: 1, recruiterId: 1 })
jobSchema.index({ company: 1, status: 1 })

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema)
export default Job

