import bcrypt from 'bcryptjs'
import { User, Job, AdminSettings } from '../models/index.js'
import { isDatabaseConnected } from '../config/database.js'
import { jobStore } from './jobStore.js'

/**
 * Idempotently initialize MongoDB Atlas on first deployment.
 * Never creates insecure default accounts in production.
 */
export async function seedMongoIfEmpty() {
  if (!isDatabaseConnected()) return

  const isProduction = process.env.NODE_ENV === 'production'

  try {
    const userCount = await User.countDocuments()

    if (userCount === 0) {
      if (isProduction) {
        // In production, only create initial admin if explicitly configured via secure env vars
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD

        if (adminEmail && adminPassword && adminPassword.length >= 10) {
          console.log(`🔐 [MongoDB] Creating production initial administrator for: ${adminEmail}`)
          const salt = await bcrypt.genSalt(12)
          const passwordHash = await bcrypt.hash(adminPassword, salt)

          await User.create({
            id: `usr_admin_${Date.now()}`,
            fullName: process.env.INITIAL_ADMIN_NAME || 'Platform Administrator',
            email: adminEmail.trim().toLowerCase(),
            passwordHash,
            role: 'admin',
            initials: 'AD',
            headline: 'Platform Operations Administrator',
            companyName: 'SkillBridge Admin',
            isVerified: true,
            status: 'Active',
          })
          console.log('✅ [MongoDB] Initial administrator account created successfully.')
        } else {
          console.log(
            'ℹ️ [MongoDB] No INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD provided. Run `npm run create:admin` to initialize administrator.'
          )
        }
      } else {
        // Non-production development seed fixtures
        console.log('🌱 [MongoDB] Seeding development accounts...')
        const salt = await bcrypt.genSalt(10)
        const defaultPasswordHash = await bcrypt.hash('password123', salt)
        const adminPasswordHash = await bcrypt.hash('admin123', salt)

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
            status: 'Active',
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
            status: 'Active',
          },
        ])
        console.log('✅ [MongoDB] Development seed accounts ready.')
      }
    }

    // Initialize Default Settings if none exist
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
      console.log('✅ [MongoDB] Default platform moderation parameters initialized.')
    }

    // Initialize seed jobs if empty (development or freshly deployed platform)
    const jobCount = await Job.countDocuments()
    if (jobCount === 0) {
      console.log('🌱 [MongoDB] Seeding initial job catalog...')
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
        console.log(`✅ [MongoDB] ${jobsToInsert.length} catalog job listings initialized.`)
      }
    }
  } catch (err) {
    console.warn('⚠️ [MongoDB] Error during initial database initialization:', err.message)
  }
}

export default seedMongoIfEmpty
