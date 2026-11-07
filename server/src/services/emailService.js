import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { emailTemplates } from '../templates/emailTemplates.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const SENT_EMAILS_FILE = path.join(DATA_DIR, 'sentEmails.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// In-memory deduplication cache: Map of idempotencyKey -> timestamp
const deduplicationCache = new Map()
const DEDUPLICATION_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

function readSentEmails() {
  try {
    if (fs.existsSync(SENT_EMAILS_FILE)) {
      return JSON.parse(fs.readFileSync(SENT_EMAILS_FILE, 'utf-8'))
    }
  } catch (err) {
    console.warn('Could not read sentEmails.json, starting empty:', err.message)
  }
  return []
}

function recordSentEmail(record) {
  try {
    const list = readSentEmails()
    list.unshift(record)
    // Keep last 200 records
    const trimmed = list.slice(0, 200)
    fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8')
  } catch (err) {
    console.warn('Could not record sent email to disk:', err.message)
  }
}

export const emailService = {
  /**
   * Send an email with Resend API with graceful fallback, deduplication, and error containment
   */
  async sendEmail({ to, subject, html, text, idempotencyKey = null, metadata = {} }) {
    if (!to || !subject || (!html && !text)) {
      return {
        success: false,
        error: 'Missing required parameters: to, subject, and body (html/text) are required.',
      }
    }

    // 1. Deduplication check
    if (idempotencyKey) {
      const now = Date.now()
      const lastSent = deduplicationCache.get(idempotencyKey)
      if (lastSent && now - lastSent < DEDUPLICATION_COOLDOWN_MS) {
        console.log(`[EmailService] Duplicate email suppressed for key: ${idempotencyKey}`)
        return {
          success: true,
          skipped: true,
          reason: 'Duplicate notification suppressed within cooldown window',
          idempotencyKey,
        }
      }
      deduplicationCache.set(idempotencyKey, now)
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.EMAIL_FROM || 'SkillBridge <notifications@skillbridge.io>'
    const recipients = Array.isArray(to) ? to : [to]

    const record = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      to: recipients,
      from: fromAddress,
      subject,
      timestamp: new Date().toISOString(),
      metadata,
    }

    // 2. Deliver via Resend if a real production API key is provided
    const isMockOrDemoKey = !apiKey || apiKey.includes('demo') || apiKey.includes('test') || apiKey.includes('dummy')
    if (apiKey && apiKey.startsWith('re_') && !isMockOrDemoKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: recipients,
            subject,
            html,
            text,
          }),
        })

        const resData = await response.json()
        if (!response.ok) {
          throw new Error(resData.message || `Resend API returned status ${response.status}`)
        }

        record.status = 'delivered'
        record.providerId = resData.id
        recordSentEmail(record)

        console.log(`[EmailService] Resend email dispatched to ${recipients.join(', ')}: "${subject}" (ID: ${resData.id})`)
        return { success: true, id: resData.id, status: 'delivered' }
      } catch (err) {
        console.error(`[EmailService] Delivery failure via Resend to ${recipients.join(', ')}:`, err.message)
        record.status = 'failed'
        record.error = err.message
        recordSentEmail(record)

        // Graceful containment: return failure object without throwing
        return {
          success: false,
          error: err.message,
          fallbackLogged: true,
        }
      }
    } else {
      // 3. Fallback / Dev Mode: Record delivery to audit log
      record.status = 'simulated_delivery'
      recordSentEmail(record)
      console.log(`[EmailService] Simulated delivery to ${recipients.join(', ')}: "${subject}"`)
      return {
        success: true,
        id: record.id,
        status: 'simulated_delivery',
      }
    }
  },

  /**
   * Helper: Send Registration Confirmation Email
   */
  async sendRegistrationConfirmation({ name, email, role }) {
    const tpl = emailTemplates.registrationConfirmation({ name, email, role })
    return this.sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      idempotencyKey: `reg-confirm-${email}`,
      metadata: { type: 'registration', role },
    })
  },

  /**
   * Helper: Send Application Submission Confirmation Email
   */
  async sendApplicationSubmissionEmail({ studentName, email, role, company, appliedDate, resumeName, applicationId }) {
    const tpl = emailTemplates.applicationSubmitted({
      studentName,
      role,
      company,
      appliedDate,
      resumeName,
      applicationId,
    })
    return this.sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      idempotencyKey: `app-submit-${applicationId}`,
      metadata: { type: 'application_submitted', applicationId, role, company },
    })
  },

  /**
   * Helper: Send Application Status Change & Shortlist Email
   */
  async sendStatusChangeEmail({ candidateName, email, role, company, newStage, stageLabel, note, applicationId }) {
    const tpl = emailTemplates.applicationStatusUpdated({
      candidateName,
      role,
      company,
      newStage,
      stageLabel,
      note,
    })
    return this.sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      idempotencyKey: `status-${applicationId}-${newStage}`,
      metadata: { type: 'status_change', applicationId, newStage },
    })
  },

  /**
   * Helper: Send Interview Scheduled Email
   */
  async sendInterviewScheduledEmail({ candidateName, email, role, company, interviewDate, interviewTime, interviewMode, meetingUrl, instructions, applicationId }) {
    const tpl = emailTemplates.interviewScheduled({
      candidateName,
      role,
      company,
      interviewDate,
      interviewTime,
      interviewMode,
      meetingUrl,
      instructions,
    })
    return this.sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      idempotencyKey: `interview-sched-${applicationId}-${interviewDate}-${interviewTime}`,
      metadata: { type: 'interview_scheduled', applicationId, interviewDate },
    })
  },

  /**
   * Helper: Send Interview Updated Email
   */
  async sendInterviewUpdatedEmail({ candidateName, email, role, company, interviewDate, interviewTime, interviewMode, meetingUrl, instructions, applicationId }) {
    const tpl = emailTemplates.interviewUpdated({
      candidateName,
      role,
      company,
      interviewDate,
      interviewTime,
      interviewMode,
      meetingUrl,
      instructions,
    })
    return this.sendEmail({
      to: email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      idempotencyKey: `interview-update-${applicationId}-${interviewDate}-${interviewTime}`,
      metadata: { type: 'interview_updated', applicationId, interviewDate },
    })
  },

  /**
   * Get delivery logs for testing / audit
   */
  getDeliveryLogs() {
    return readSentEmails()
  },

  /**
   * Clear cache for testing
   */
  clearCache() {
    deduplicationCache.clear()
  },
}
