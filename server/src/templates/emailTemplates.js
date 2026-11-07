/**
 * Professional SkillBridge Responsive HTML Email Templates
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1E293B;
  background-color: #F8FAFC;
  margin: 0;
  padding: 0;
`

function wrapInEmailLayout(title, contentHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { ${BASE_STYLES} }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0B0D14; padding: 28px 32px; text-align: left; border-bottom: 3px solid #4F46E5; }
    .logo { font-size: 20px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: -0.5px; }
    .logo span { color: #818CF8; }
    .content { padding: 32px; }
    .title { font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; }
    .body-text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
    .info-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #E2E8F0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748B; font-weight: 500; }
    .info-value { color: #0F172A; font-weight: 600; }
    .btn { display: inline-block; background: #4F46E5; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin: 16px 0; text-align: center; }
    .footer { background: #F1F5F9; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
    .footer a { color: #4F46E5; text-decoration: none; }
  </style>
</head>
<body style="${BASE_STYLES}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 24px 0;">
    <tr>
      <td align="center">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <a href="https://skillbridge.io" class="logo">
              Skill<span>Bridge</span>
            </a>
          </div>
          <!-- Body Content -->
          <div class="content">
            ${contentHtml}
          </div>
          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0;">This email was sent by SkillBridge Career & Talent Platform.</p>
            <p style="margin: 0;">© 2026 SkillBridge Inc. · <a href="https://skillbridge.io/privacy">Privacy Policy</a> · <a href="https://skillbridge.io/settings">Notification Preferences</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export const emailTemplates = {
  /**
   * 1. Registration Confirmation
   */
  registrationConfirmation({ name, email, role, loginUrl = 'http://localhost:5173/login' }) {
    const title = 'Welcome to SkillBridge - Account Confirmed'
    const roleLabel = role === 'recruiter' ? 'Talent Recruiter' : 'Student Candidate'

    const html = wrapInEmailLayout(
      title,
      `
      <h1 class="title">Welcome aboard, ${name}! 🎉</h1>
      <p class="body-text">
        Your SkillBridge account has been verified successfully. You now have full access to explore verified tech opportunities, manage applications, and connect with top teams.
      </p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Account Name</span><span class="info-value">${name}</span></div>
        <div class="info-row"><span class="info-label">Email Address</span><span class="info-value">${email}</span></div>
        <div class="info-row"><span class="info-label">Assigned Role</span><span class="info-value">${roleLabel}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color: #10B981;">Active & Verified</span></div>
      </div>
      <p class="body-text">
        Get started right away by visiting your personalized dashboard:
      </p>
      <a href="${loginUrl}" class="btn">Launch Your Dashboard →</a>
      `
    )

    const text = `Welcome to SkillBridge, ${name}!
Your ${roleLabel} account (${email}) is verified and active.
Login to your workspace here: ${loginUrl}
- SkillBridge Team`

    return { subject: `Welcome to SkillBridge, ${name}!`, html, text }
  },

  /**
   * 2. Application Submission Confirmation
   */
  applicationSubmitted({
    studentName,
    role,
    company,
    appliedDate,
    resumeName,
    applicationId,
    trackingUrl = 'http://localhost:5173/student/applications',
  }) {
    const title = `Application Submitted: ${role} at ${company}`

    const html = wrapInEmailLayout(
      title,
      `
      <h1 class="title">Application Received! 🚀</h1>
      <p class="body-text">
        Hi ${studentName}, your application for <strong>${role}</strong> at <strong>${company}</strong> has been transmitted successfully to the recruiting team.
      </p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Position</span><span class="info-value">${role}</span></div>
        <div class="info-row"><span class="info-label">Company</span><span class="info-value">${company}</span></div>
        <div class="info-row"><span class="info-label">Submission Date</span><span class="info-value">${appliedDate}</span></div>
        <div class="info-row"><span class="info-label">Attached Resume</span><span class="info-value">${resumeName || 'Verified Resume.pdf'}</span></div>
        <div class="info-row"><span class="info-label">Application ID</span><span class="info-value">${applicationId}</span></div>
      </div>
      <p class="body-text">
        You will receive real-time notifications when the recruiting team reviews your credentials or updates your status.
      </p>
      <a href="${trackingUrl}" class="btn">Track Application Status →</a>
      `
    )

    const text = `Hi ${studentName},
Your application for ${role} at ${company} was submitted on ${appliedDate}.
Application ID: ${applicationId}
Track status: ${trackingUrl}
- SkillBridge Team`

    return { subject: `Application Submitted: ${role} at ${company}`, html, text }
  },

  /**
   * 3. Application Status Changes & Shortlisting
   */
  applicationStatusUpdated({
    candidateName,
    role,
    company,
    newStage,
    stageLabel,
    note,
    trackingUrl = 'http://localhost:5173/student/applications',
  }) {
    const isShortlist = newStage === 'shortlisted'
    const subject = isShortlist
      ? `🎉 Congratulations! You've been shortlisted for ${role} at ${company}`
      : `Application Status Update: ${role} at ${company}`

    const heading = isShortlist
      ? `Great news, ${candidateName}! You're Shortlisted! 🎉`
      : `Application Update: ${stageLabel}`

    const html = wrapInEmailLayout(
      subject,
      `
      <h1 class="title">${heading}</h1>
      <p class="body-text">
        The hiring team at <strong>${company}</strong> has updated the status of your application for <strong>${role}</strong>.
      </p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Role</span><span class="info-value">${role}</span></div>
        <div class="info-row"><span class="info-label">Company</span><span class="info-value">${company}</span></div>
        <div class="info-row"><span class="info-label">Current Stage</span><span class="info-value" style="color: ${isShortlist ? '#8B5CF6' : '#4F46E5'};">${stageLabel}</span></div>
        ${note ? `<div class="info-row"><span class="info-label">Recruiter Note</span><span class="info-value">${note}</span></div>` : ''}
      </div>
      <p class="body-text">
        Visit your candidate workspace for the full timeline and next steps:
      </p>
      <a href="${trackingUrl}" class="btn">View Application Details →</a>
      `
    )

    const text = `Hi ${candidateName},
Your application for ${role} at ${company} has been updated to "${stageLabel}".
${note ? `Note from Recruiter: ${note}\n` : ''}
View application: ${trackingUrl}
- SkillBridge Team`

    return { subject, html, text }
  },

  /**
   * 4. Interview Scheduling
   */
  interviewScheduled({
    candidateName,
    role,
    company,
    interviewDate,
    interviewTime,
    interviewMode = 'Google Meet',
    meetingUrl,
    instructions,
    trackingUrl = 'http://localhost:5173/student/applications',
  }) {
    const subject = `📅 Interview Scheduled: ${role} with ${company}`

    const html = wrapInEmailLayout(
      subject,
      `
      <h1 class="title">Interview Scheduled! 📅</h1>
      <p class="body-text">
        Hi ${candidateName}, an interview round has been confirmed with <strong>${company}</strong> for the <strong>${role}</strong> position.
      </p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Date</span><span class="info-value">${interviewDate}</span></div>
        <div class="info-row"><span class="info-label">Time</span><span class="info-value">${interviewTime}</span></div>
        <div class="info-row"><span class="info-label">Format</span><span class="info-value">${interviewMode}</span></div>
        ${meetingUrl ? `<div class="info-row"><span class="info-label">Meeting Room</span><span class="info-value"><a href="${meetingUrl}" style="color: #4F46E5;">Join Video Call</a></span></div>` : ''}
        ${instructions ? `<div class="info-row"><span class="info-label">Preparation Instructions</span><span class="info-value">${instructions}</span></div>` : ''}
      </div>
      <p class="body-text">
        Please ensure you join 5 minutes early in a quiet setting with a working microphone and webcam.
      </p>
      <a href="${meetingUrl || trackingUrl}" class="btn">Join Interview Room →</a>
      `
    )

    const text = `Hi ${candidateName},
An interview has been scheduled for ${role} with ${company}.
Date: ${interviewDate}
Time: ${interviewTime}
Format: ${interviewMode}
Meeting Link: ${meetingUrl || 'See application dashboard'}
${instructions ? `Instructions: ${instructions}\n` : ''}
Track: ${trackingUrl}
- SkillBridge Team`

    return { subject, html, text }
  },

  /**
   * 5. Interview Updates
   */
  interviewUpdated({
    candidateName,
    role,
    company,
    interviewDate,
    interviewTime,
    interviewMode = 'Google Meet',
    meetingUrl,
    instructions,
    trackingUrl = 'http://localhost:5173/student/applications',
  }) {
    const subject = `🔄 Interview Details Updated: ${role} at ${company}`

    const html = wrapInEmailLayout(
      subject,
      `
      <h1 class="title">Interview Details Updated 🔄</h1>
      <p class="body-text">
        Hi ${candidateName}, the scheduling details for your upcoming interview for <strong>${role}</strong> with <strong>${company}</strong> have been revised.
      </p>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Revised Date</span><span class="info-value">${interviewDate}</span></div>
        <div class="info-row"><span class="info-label">Revised Time</span><span class="info-value">${interviewTime}</span></div>
        <div class="info-row"><span class="info-label">Format</span><span class="info-value">${interviewMode}</span></div>
        ${meetingUrl ? `<div class="info-row"><span class="info-label">Meeting URL</span><span class="info-value"><a href="${meetingUrl}" style="color: #4F46E5;">Join Meeting</a></span></div>` : ''}
        ${instructions ? `<div class="info-row"><span class="info-label">Updated Notes</span><span class="info-value">${instructions}</span></div>` : ''}
      </div>
      <a href="${meetingUrl || trackingUrl}" class="btn">View Updated Interview →</a>
      `
    )

    const text = `Hi ${candidateName},
Your interview for ${role} at ${company} was updated to ${interviewDate} at ${interviewTime} (${interviewMode}).
Meeting Link: ${meetingUrl || trackingUrl}
- SkillBridge Team`

    return { subject, html, text }
  },
}

