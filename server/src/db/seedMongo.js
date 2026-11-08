import bcrypt from 'bcryptjs'
import { User, Job, AdminSettings } from '../models/index.js'
import { isDatabaseConnected } from '../config/database.js'
import { jobStore } from './jobStore.js'

export async function seedMongoIfEmpty() {
  if (!isDatabaseConnected()) return

  try {
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      console.log('🌱 [MongoDB] Seeding initial users...')
      const defaultPasswordHash = await bcrypt.hash('password123', 10)
      const adminPasswordHash = await bcrypt.hash('admin123', 10)

      await User.create([
        {
          id: 'usr_recruiter_meera',
          fullName: 'Meera Kapoor',
          email: 'meera@linear.app',
          passwordHash: defaultPasswordHash,
          role: 'recruiter',
          initials: 'MK',
          headline: 'Lead Technical Recruiter at Linear',
          companyName: 'Linear',
          isVerified: true,
        },
        {
          id: 'usr_admin_rohan',
          fullName: 'Rohan Agarwal',
          email: 'admin@skillbridge.io',
          passwordHash: adminPasswordHash,
          role: 'admin',
          initials: 'RA',
          headline: 'Platform Operations Administrator',
          companyName: 'SkillBridge Admin',
          isVerified: true,
        },
      ])
      console.log('✅ [MongoDB] Seed users created successfully.')
    }

    const jobCount = await Job.countDocuments()
    if (jobCount === 0) {
      console.log('🌱 [MongoDB] Seeding initial jobs...')
      const initialJobs = jobStore.getAllJobs()
      if (initialJobs && initialJobs.length > 0) {
        const jobsToInsert = initialJobs.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          companySlug: j.companySlug || j.company.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          recruiterId: j.recruiterId || 'usr_recruiter_meera',
          type: j.type || 'Full-time',
          arrangement: j.arrangement || 'Remote',
          location: j.location || 'Remote',
          stipend: j.stipend || '',
          minSalary: j.minSalary || 0,
          experience: j.experience || 'Fresher / 0-1 yr',
          description: j.description || '',
          requirements: j.requirements || [],
          skills: j.skills || [],
          status: j.status || 'Active',
          closesOn: j.closesOn || '',
        }))
        await Job.insertMany(jobsToInsert, { ordered: false }).catch(() => {})
        console.log(`✅ [MongoDB] ${jobsToInsert.length} seed jobs inserted.`)
      }
    }

    const settingsCount = await AdminSettings.countDocuments()
    if (settingsCount === 0) {
      await AdminSettings.create({
        key: 'global_settings',
        mandatoryRecruiterApproval: true,
        autoFlagUnpaidInternships: true,
        minRecommendedStipend: '₹15,000 / month',
        maxApplicationsPerStudent: 15,
        moderationEmailAlerts: true,
        auditLogRetentionDays: 90,
      })
    }
  } catch (err) {
    console.warn('⚠️ [MongoDB] Error during initial database seed:', err.message)
  }
}

export default seedMongoIfEmpty

