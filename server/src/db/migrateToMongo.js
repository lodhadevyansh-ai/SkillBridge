import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDatabase, disconnectDatabase, isDatabaseConnected } from '../config/database.js'
import {
  User,
  Job,
  Application,
  StudentProfile,
  RecruiterProfile,
  Notification,
  AuditLog,
  AdminSettings,
} from '../models/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')

function readJsonFile(filename, defaultVal = null) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return defaultVal
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`⚠️ Could not parse JSON file ${filename}:`, err.message)
    return defaultVal
  }
}

/**
 * Safe, idempotent migration script that transfers records from existing datasets into MongoDB Atlas
 */
export async function runMigration() {
  console.log('=====================================================')
  console.log('🔄 SkillBridge Database Migration to MongoDB Atlas')
  console.log('=====================================================')

  const conn = await connectDatabase()
  if (!conn || !isDatabaseConnected()) {
    console.error('❌ Cannot run migration: MongoDB Atlas connection is unavailable.')
    process.exit(1)
  }

  const results = {
    users: { processed: 0, inserted: 0, skipped: 0 },
    jobs: { processed: 0, inserted: 0, skipped: 0 },
    studentProfiles: { processed: 0, inserted: 0, skipped: 0 },
    recruiterProfiles: { processed: 0, inserted: 0, skipped: 0 },
    applications: { processed: 0, inserted: 0, skipped: 0 },
    notifications: { processed: 0, inserted: 0, skipped: 0 },
    auditLogs: { processed: 0, inserted: 0, skipped: 0 },
    adminSettings: { updated: false },
  }

  // 1. Migrate Users (from users.json)
  const users = readJsonFile('users.json', [])
  if (Array.isArray(users)) {
    for (const u of users) {
      results.users.processed++
      const exists = await User.findOne({
        $or: [{ id: u.id }, { email: (u.email || '').toLowerCase() }],
      })
      if (!exists) {
        await User.create({
          id: u.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fullName: u.fullName || 'User',
          email: (u.email || '').toLowerCase(),
          passwordHash: u.passwordHash,
          role: u.role || 'student',
          initials: u.initials || 'U',
          headline: u.headline || '',
          companyName: u.companyName || null,
          isVerified: !!u.isVerified,
          status: u.status || 'Active',
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        })
        results.users.inserted++
      } else {
        results.users.skipped++
      }
    }
  }

  // 2. Migrate Jobs (from jobs.json)
  const jobs = readJsonFile('jobs.json', [])
  if (Array.isArray(jobs)) {
    for (const j of jobs) {
      results.jobs.processed++
      const exists = await Job.findOne({ id: j.id })
      if (!exists) {
        await Job.create({
          id: j.id,
          title: j.title || 'Job Listing',
          company: j.company || 'Company',
          companySlug: j.companySlug || '',
          recruiterId: j.recruiterId || 'usr_recruiter_meera',
          type: j.type || 'Full-time',
          arrangement: j.arrangement || 'Remote',
          location: j.location || 'Remote',
          stipend: j.stipend || '',
          minSalary: j.salaryMin || j.minSalary || 0,
          experience: j.experience || 'Fresher / 0-1 yr',
          description: j.description || '',
          requirements: Array.isArray(j.requirements) ? j.requirements : [],
          skills: Array.isArray(j.skills) ? j.skills : [],
          applicantsCount: j.applicantsCount || 0,
          shortlistedCount: j.shortlistedCount || 0,
          status: j.status || 'Active',
          closesOn: j.deadline || j.closesOn || '',
          createdAt: j.createdAt ? new Date(j.createdAt) : new Date(),
        })
        results.jobs.inserted++
      } else {
        results.jobs.skipped++
      }
    }
  }

  // 3. Migrate Student Profiles and Applications (from studentData.json)
  const studentData = readJsonFile('studentData.json', {})
  if (studentData.profiles) {
    for (const [studentId, prof] of Object.entries(studentData.profiles)) {
      results.studentProfiles.processed++
      const exists = await StudentProfile.findOne({ userId: studentId })
      if (!exists) {
        await StudentProfile.create({
          userId: studentId,
          fullName: prof.fullName || '',
          email: prof.email || '',
          phone: prof.phone || '',
          location: prof.location || '',
          college: prof.college || '',
          degree: prof.degree || '',
          classOf: prof.classOf || '',
          headline: prof.headline || '',
          about: prof.about || '',
          portfolioUrl: prof.portfolioUrl || '',
          linkedinUrl: prof.linkedinUrl || '',
          githubUrl: prof.githubUrl || '',
          openToWork: prof.openToWork !== false,
          avatarUrl: prof.avatarUrl || null,
          initials: prof.initials || 'ST',
          title: prof.title || '',
          description: prof.description || '',
          resumeUploaded: !!prof.resumeUploaded,
          resumeFileName: prof.resumeFileName || null,
          skills: Array.isArray(prof.skills) ? prof.skills : [],
          education: Array.isArray(prof.education) ? prof.education : [],
          experience: Array.isArray(prof.experience) ? prof.experience : [],
          projects: Array.isArray(prof.projects) ? prof.projects : [],
          resumes: Array.isArray(prof.resumes) ? prof.resumes : [],
          savedJobs: Array.isArray(studentData.savedJobs?.[studentId]) ? studentData.savedJobs[studentId] : [],
          profileStrength: prof.profileStrength || 20,
        })
        results.studentProfiles.inserted++
      } else {
        results.studentProfiles.skipped++
      }
    }
  }

  // Migrate Applications
  if (studentData.applications) {
    for (const [studentId, appsList] of Object.entries(studentData.applications)) {
      if (Array.isArray(appsList)) {
        for (const app of appsList) {
          results.applications.processed++
          const exists = await Application.findOne({
            $or: [{ id: app.id }, { studentId, jobId: app.jobId }],
          })
          if (!exists) {
            await Application.create({
              id: app.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              jobId: app.jobId,
              studentId,
              recruiterId: app.recruiterId || 'usr_recruiter_meera',
              studentName: app.studentName || '',
              studentEmail: app.studentEmail || '',
              studentPhone: app.phone || app.studentPhone || '',
              jobTitle: app.role || app.jobTitle || '',
              company: app.company || '',
              resumeUrl: app.resumeUrl || '',
              resumeName: app.resumeName || 'Resume.pdf',
              status: app.status === 'in-review' ? 'Applied' : (app.status || 'Applied'),
              appliedAt: app.createdAt ? new Date(app.createdAt) : new Date(),
              timeline: Array.isArray(app.timeline) ? app.timeline : [],
              notes: Array.isArray(app.notes) ? app.notes : [],
              interview: app.interview || null,
            })
            results.applications.inserted++
          } else {
            results.applications.skipped++
          }
        }
      }
    }
  }

  // 4. Migrate Recruiter Profiles (from recruiterData.json)
  const recruiterData = readJsonFile('recruiterData.json', {})
  if (recruiterData.companyProfiles) {
    for (const [recruiterId, cp] of Object.entries(recruiterData.companyProfiles)) {
      results.recruiterProfiles.processed++
      const exists = await RecruiterProfile.findOne({ userId: recruiterId })
      if (!exists) {
        await RecruiterProfile.create({
          userId: recruiterId,
          companyName: cp.companyName || 'SkillBridge Partner',
          headline: cp.headline || '',
          location: cp.headquarters || cp.location || '',
          website: cp.website || '',
          headquarters: cp.headquarters || '',
          companySize: cp.companySize || '',
          description: cp.description || '',
          industry: cp.industry || 'Technology',
          logo: cp.logo || '',
          initials: cp.initials || '',
          leadRecruiter: cp.leadRecruiter || '',
          workEmail: cp.workEmail || '',
          isVerified: !!cp.isVerified,
        })
        results.recruiterProfiles.inserted++
      } else {
        results.recruiterProfiles.skipped++
      }
    }
  }

  // 5. Migrate Notifications (from notificationsData.json)
  const notifications = readJsonFile('notificationsData.json', [])
  if (Array.isArray(notifications)) {
    for (const n of notifications) {
      results.notifications.processed++
      const exists = await Notification.findOne({ id: n.id })
      if (!exists) {
        await Notification.create({
          id: n.id,
          userId: n.userId,
          type: n.type || 'general',
          title: n.title,
          message: n.message,
          link: n.link || '',
          read: !!n.read,
          metadata: n.metadata || {},
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        })
        results.notifications.inserted++
      } else {
        results.notifications.skipped++
      }
    }
  }

  // 6. Migrate Audit Logs (from auditLogs.json)
  const auditLogs = readJsonFile('auditLogs.json', [])
  if (Array.isArray(auditLogs)) {
    for (const log of auditLogs) {
      results.auditLogs.processed++
      const exists = await AuditLog.findOne({ id: log.id })
      if (!exists) {
        await AuditLog.create({
          id: log.id,
          actorId: log.actorId,
          actorRole: log.actorRole,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId || null,
          ipAddress: log.ipAddress || null,
          metadata: log.metadata || {},
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        })
        results.auditLogs.inserted++
      } else {
        results.auditLogs.skipped++
      }
    }
  }

  // 7. Migrate Admin Settings
  const adminData = readJsonFile('adminData.json', {})
  if (adminData.settings) {
    const existing = await AdminSettings.findOne({ key: 'global_settings' })
    if (!existing) {
      await AdminSettings.create({
        key: 'global_settings',
        ...adminData.settings,
      })
      results.adminSettings.updated = true
    }
  }

  console.log('-----------------------------------------------------')
  console.log('✅ Migration Results Summary:')
  console.log(`👤 Users: ${results.users.inserted} inserted, ${results.users.skipped} existing (total: ${results.users.processed})`)
  console.log(`💼 Jobs: ${results.jobs.inserted} inserted, ${results.jobs.skipped} existing (total: ${results.jobs.processed})`)
  console.log(`🎓 Student Profiles: ${results.studentProfiles.inserted} inserted, ${results.studentProfiles.skipped} existing`)
  console.log(`🏢 Recruiter Profiles: ${results.recruiterProfiles.inserted} inserted, ${results.recruiterProfiles.skipped} existing`)
  console.log(`📝 Applications: ${results.applications.inserted} inserted, ${results.applications.skipped} existing`)
  console.log(`🔔 Notifications: ${results.notifications.inserted} inserted, ${results.notifications.skipped} existing`)
  console.log(`📜 Audit Logs: ${results.auditLogs.inserted} inserted, ${results.auditLogs.skipped} existing`)
  console.log('-----------------------------------------------------')

  await disconnectDatabase()
  console.log('Migration process completed successfully.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigration().catch((err) => {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  })
}

export default runMigration

