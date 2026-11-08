import mongoose from 'mongoose'

const recruiterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    headline: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    headquarters: { type: String, default: '' },
    companySize: { type: String, default: '' },
    description: { type: String, default: '' },
    industry: { type: String, default: 'Technology' },
    logo: { type: String, default: '' },
    initials: { type: String, default: '' },
    leadRecruiter: { type: String, default: '' },
    workEmail: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
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

export const RecruiterProfile =
  mongoose.models.RecruiterProfile || mongoose.model('RecruiterProfile', recruiterProfileSchema)
export default RecruiterProfile

