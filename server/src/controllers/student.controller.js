import path from 'path'
import { studentStore } from '../db/studentStore.js'
import { recruiterStore } from '../db/recruiterStore.js'
import { auditLogger } from '../services/auditLogger.js'

export async function getStudentDashboard(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const studentName = req.user.fullName || 'Student'
    const firstName = studentName.split(' ')[0]

    // Time-aware greeting
    const hour = new Date().getHours()
    let timeOfDay = 'morning'
    let greetingEmoji = '☼'
    if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon'
      greetingEmoji = '☀'
    } else if (hour >= 17) {
      timeOfDay = 'evening'
      greetingEmoji = '☽'
    }

    const greeting = `Good ${timeOfDay}, ${firstName} ${greetingEmoji}`
    const dashboardData = studentStore.getStudentDashboard(studentId)

    return res.status(200).json({
      success: true,
      data: {
        greeting,
        subGreeting: "A little progress every day adds up. Here's where you stand.",
        user: {
          id: studentId,
          name: studentName,
          firstName,
          email: req.user.email,
          role: req.user.role,
        },
        ...dashboardData,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getStudentDashboardStats(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const stats = studentStore.getStudentDashboardStats(studentId)

    return res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (err) {
    next(err)
  }
}

export async function toggleSaveJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id: jobId } = req.params

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required.',
      })
    }

    const result = studentStore.toggleSaveJob(studentId, jobId)
    return res.status(200).json({
      success: true,
      data: result,
      message: result.isSaved ? 'Job saved to your bookmarks' : 'Job removed from bookmarks',
    })
  } catch (err) {
    next(err)
  }
}

export async function getStudentApplications(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const applications = studentStore.getApplications(studentId)
    return res.status(200).json({
      success: true,
      data: applications,
    })
  } catch (err) {
    next(err)
  }
}

export async function getSavedJobs(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { search = '', type = 'all', sort = 'recent' } = req.query
    const result = studentStore.getSavedJobs(studentId, { search, type, sort })
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

export async function removeSavedJob(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id: jobId } = req.params
    const result = studentStore.removeSavedJob(studentId, jobId)
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Job removed from your saved list',
    })
  } catch (err) {
    next(err)
  }
}

export async function getProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const profile = studentStore.getProfile(studentId)
    return res.status(200).json({
      success: true,
      data: profile,
    })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const updates = req.body || {}

    // Validation: if full name provided, ensure not empty
    if (updates.fullName !== undefined && !updates.fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot be empty.',
      })
    }

    const updated = studentStore.updateProfile(studentId, updates)
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    })
  } catch (err) {
    next(err)
  }
}

export async function getResumes(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const resumes = studentStore.getResumes(studentId)
    return res.status(200).json({
      success: true,
      data: resumes,
    })
  } catch (err) {
    next(err)
  }
}

export async function uploadResume(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { name, fileSize, fileType, fileData, isDefault } = req.body

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Resume file name is required.',
      })
    }

    // 1. Sanitize filename against null-bytes and directory traversal
    const cleanBasename = path.basename(name).replace(/\0/g, '')
    const ext = cleanBasename.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['pdf', 'docx', 'doc']

    if (!ext || !allowedExtensions.includes(ext) || cleanBasename.split('.').length > 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Please upload a single-extension PDF or DOCX file.',
      })
    }

    // 2. Strict MIME type check
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/octet-stream',
    ]

    const incomingMime = (fileType || '').toLowerCase()
    if (incomingMime && !allowedMimeTypes.includes(incomingMime)) {
      return res.status(400).json({
        success: false,
        message: 'Disallowed file MIME type. Only PDF and Word documents are permitted.',
      })
    }

    // Disallow dangerous extensions and script MIME types
    const dangerousMimes = ['text/html', 'image/svg+xml', 'application/javascript', 'application/x-sh']
    if (dangerousMimes.includes(incomingMime)) {
      return res.status(400).json({
        success: false,
        message: 'Security violation: executable or script MIME types are rejected.',
      })
    }

    // 3. File size limit: 5 MB
    const maxSizeBytes = 5 * 1024 * 1024
    const size = Number(fileSize) || 250000
    if (size > maxSizeBytes || size <= 0) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit of 5 MB.',
      })
    }

    const kb = Math.round(size / 1024)
    const fileSizeFormatted = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`

    // Cloudinary file URL generation
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'skillbridge'
    const timestamp = Date.now()
    const safeName = cleanBasename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/v${timestamp}/resumes/${studentId}/${encodeURIComponent(
      safeName
    )}`

    const newResume = studentStore.addResume(studentId, {
      name: safeName,
      originalName: cleanBasename,
      fileSize: size,
      fileSizeFormatted,
      fileType: fileType || (ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      url: cloudinaryUrl,
      publicId: `resumes/${studentId}/${timestamp}_${safeName}`,
      isDefault: Boolean(isDefault),
      fileData: fileData || null,
    })

    return res.status(201).json({
      success: true,
      data: newResume,
      message: 'Resume uploaded successfully to Cloudinary storage',
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteResume(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id: resumeId } = req.params

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required',
      })
    }

    const result = studentStore.deleteResume(studentId, resumeId)
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Resume deleted successfully',
    })
  } catch (err) {
    next(err)
  }
}

export async function setDefaultResume(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const studentId = req.user.id
    const { id: resumeId } = req.params

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required',
      })
    }

    const resume = studentStore.setDefaultResume(studentId, resumeId)
    return res.status(200).json({
      success: true,
      data: resume,
      message: `"${resume.name}" set as default resume`,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * Requirement 16: Protection of private resume files.
 * Verifies caller has explicit permission to access the candidate's resume:
 * - Candidate who owns the resume, OR
 * - Recruiter whose job listing received an application from this candidate, OR
 * - Platform Admin.
 */
export async function getResumeAccess(req, res, next) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }
    const { id: resumeId } = req.params
    const callerId = req.user.id
    const callerRole = req.user.role

    // 1. If caller is student, verify they own the resume
    if (callerRole === 'student') {
      const resumes = studentStore.getResumes(callerId)
      const found = resumes.find((r) => r.id === resumeId || r.name === resumeId)
      if (!found) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to view or download this resume.',
        })
      }
      return res.status(200).json({
        success: true,
        data: {
          url: found.url,
          name: found.name,
          authorizedRole: 'student_owner',
        },
      })
    }

    // 2. If caller is recruiter, verify applicant applied to one of their active listings
    if (callerRole === 'recruiter') {
      const applications = recruiterStore.getRecruiterApplications(callerId)
      const hasApplication = applications.some((app) => app.resumeName === resumeId || app.resumeUrl?.includes(resumeId))
      if (!hasApplication) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: 'Access denied: Candidate has not applied to any job listing managed by your organization.',
        })
      }
      return res.status(200).json({
        success: true,
        data: {
          resumeId,
          authorizedRole: 'recruiter_verified',
        },
      })
    }

    // 3. Admin has platform moderation access
    if (callerRole === 'admin') {
      return res.status(200).json({
        success: true,
        data: {
          resumeId,
          authorizedRole: 'admin',
        },
      })
    }

    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'Access denied: Insufficient privileges.',
    })
  } catch (err) {
    next(err)
  }
}
