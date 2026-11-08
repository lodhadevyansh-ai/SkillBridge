import mongoose from 'mongoose'

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: String,
    endYear: String,
    grade: String,
  },
  { _id: false }
)

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String,
  },
  { _id: false }
)

const projectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    technologies: [String],
    link: String,
    githubUrl: String,
  },
  { _id: false }
)

const resumeSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    size: String,
    url: String,
    publicId: String,
    uploadedAt: String,
    isDefault: Boolean,
  },
  { _id: false }
)

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    classOf: { type: String, default: '' },
    headline: { type: String, default: 'SkillBridge Candidate' },
    about: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    openToWork: { type: Boolean, default: true },
    avatarUrl: { type: String, default: null },
    initials: { type: String, default: 'ST' },
    title: { type: String, default: 'Start your career journey with SkillBridge.' },
    description: { type: String, default: 'Complete your profile sections to stand out to verified recruiters.' },
    resumeUploaded: { type: Boolean, default: false },
    resumeFileName: { type: String, default: null },
    resumeUpdatedAt: { type: String, default: null },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    resumes: { type: [resumeSchema], default: [] },
    savedJobs: { type: [String], default: [] },
    profileStrength: { type: Number, default: 20 },
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

export const StudentProfile =
  mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema)
export default StudentProfile

