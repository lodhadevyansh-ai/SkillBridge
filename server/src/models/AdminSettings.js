import mongoose from 'mongoose'

const adminSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
      index: true,
    },
    mandatoryRecruiterApproval: {
      type: Boolean,
      default: true,
    },
    autoFlagUnpaidInternships: {
      type: Boolean,
      default: true,
    },
    minRecommendedStipend: {
      type: String,
      default: '₹15,000 / month',
    },
    maxApplicationsPerStudent: {
      type: Number,
      default: 15,
    },
    moderationEmailAlerts: {
      type: Boolean,
      default: true,
    },
    auditLogRetentionDays: {
      type: Number,
      default: 90,
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

export const AdminSettings =
  mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema)
export default AdminSettings

