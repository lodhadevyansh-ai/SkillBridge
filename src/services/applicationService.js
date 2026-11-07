import { apiClient } from './apiClient'

export const MOCK_APPLICATIONS = [
  {
    id: 'app-1',
    jobId: 'job-3',
    role: 'UX Research Intern',
    company: 'Notion',
    logo: 'N',
    appliedOn: '22 Oct 2026',
    status: 'interview',
    statusLabel: 'Interview Scheduled',
    latestUpdate: 'Interview scheduled: 28 Oct · 11:00 AM IST',
    matchScore: 92,
    stipend: '₹25,000 / month',
    meetingLink: 'https://meet.google.com/sb-notion-priya',
    interviewer: 'Priya',
    resumeName: 'Resume.pdf',
    timeline: [
      { step: 'Applied', date: '22 Oct 2026', done: true },
      { step: 'In review', date: '23 Oct 2026', done: true },
      { step: 'Interview', date: '28 Oct 2026', done: true, current: true },
      { step: 'Decision', date: 'Pending', done: false },
    ],
    history: [
      { status: 'Applied', date: '22 Oct 2026', note: 'Application submitted with verified resume' },
      { status: 'Under Review', date: '23 Oct 2026', note: 'Recruiter reviewed candidate portfolio' },
      { status: 'Interview Scheduled', date: '26 Oct 2026', note: 'Video call confirmed for 28 Oct' },
    ],
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    role: 'Frontend Developer',
    company: 'Razorpay',
    logo: 'R',
    appliedOn: '20 Oct 2026',
    status: 'in-review',
    statusLabel: 'Under Review',
    latestUpdate: 'Recruiter viewed profile',
    matchScore: 94,
    stipend: '₹8–12 LPA',
    resumeName: 'Resume.pdf',
    timeline: [
      { step: 'Applied', date: '20 Oct 2026', done: true },
      { step: 'In review', date: '21 Oct 2026', done: true, current: true },
      { step: 'Interview', date: 'Pending', done: false },
      { step: 'Decision', date: 'Pending', done: false },
    ],
    history: [
      { status: 'Applied', date: '20 Oct 2026', note: 'Application submitted' },
      { status: 'Under Review', date: '21 Oct 2026', note: 'Application passed automated technical filter' },
    ],
  },
  {
    id: 'app-3',
    jobId: 'job-4',
    role: 'Associate Product Designer',
    company: 'Figma',
    logo: 'F',
    appliedOn: '18 Oct 2026',
    status: 'shortlisted',
    statusLabel: 'Shortlisted',
    latestUpdate: 'Shortlisted for hiring manager review',
    matchScore: 90,
    stipend: '₹10–14 LPA',
    resumeName: 'Resume.pdf',
    timeline: [
      { step: 'Applied', date: '18 Oct 2026', done: true },
      { step: 'In review', date: '19 Oct 2026', done: true },
      { step: 'Shortlisted', date: '20 Oct 2026', done: true, current: true },
      { step: 'Decision', date: 'Pending', done: false },
    ],
    history: [
      { status: 'Applied', date: '18 Oct 2026', note: 'Application submitted' },
      { status: 'Under Review', date: '19 Oct 2026', note: 'Design leads reviewed case studies' },
      { status: 'Shortlisted', date: '20 Oct 2026', note: 'Selected for hiring team shortlist' },
    ],
  },
  {
    id: 'app-4',
    jobId: 'job-5',
    role: 'Design Systems Intern',
    company: 'Linear',
    logo: 'L',
    appliedOn: '12 Oct 2026',
    status: 'selected',
    statusLabel: 'Selected',
    latestUpdate: 'Formal offer extended · Respond by 30 Oct',
    matchScore: 98,
    stipend: '₹35,000 / month',
    resumeName: 'Resume.pdf',
    timeline: [
      { step: 'Applied', date: '12 Oct 2026', done: true },
      { step: 'In review', date: '14 Oct 2026', done: true },
      { step: 'Interview', date: '18 Oct 2026', done: true },
      { step: 'Decision', date: '25 Oct 2026', done: true, current: true },
    ],
    history: [
      { status: 'Applied', date: '12 Oct 2026', note: 'Application submitted' },
      { status: 'Under Review', date: '14 Oct 2026', note: 'Portfolio screened by design team' },
      { status: 'Interview Scheduled', date: '16 Oct 2026', note: 'Interview with Design Director' },
      { status: 'Selected', date: '25 Oct 2026', note: 'Formal internship offer extended' },
    ],
  },
  {
    id: 'app-5',
    jobId: 'job-1',
    role: 'Product Design Intern',
    company: 'Linear',
    logo: 'L',
    appliedOn: '24 Oct 2026',
    status: 'applied',
    statusLabel: 'Applied',
    latestUpdate: 'Application received and queued for review',
    matchScore: 98,
    stipend: '₹30,000 / month',
    resumeName: 'Resume.pdf',
    timeline: [
      { step: 'Applied', date: '24 Oct 2026', done: true, current: true },
      { step: 'In review', date: 'Pending', done: false },
      { step: 'Interview', date: 'Pending', done: false },
      { step: 'Decision', date: 'Pending', done: false },
    ],
    history: [
      { status: 'Applied', date: '24 Oct 2026', note: 'Application submitted directly via SkillBridge' },
    ],
  },
  {
    id: 'app-6',
    jobId: 'job-7',
    role: 'Product Operations Intern',
    company: 'CRED',
    logo: 'C',
    appliedOn: '08 Oct 2026',
    status: 'rejected',
    statusLabel: 'Rejected',
    latestUpdate: 'Position filled by earlier candidate',
    matchScore: 86,
    stipend: '₹28,000 / month',
    resumeName: 'Resume.pdf',
    timeline: [
      { step: 'Applied', date: '08 Oct 2026', done: true },
      { step: 'In review', date: '10 Oct 2026', done: true },
      { step: 'Decision', date: '15 Oct 2026', done: true, current: true },
    ],
    history: [
      { status: 'Applied', date: '08 Oct 2026', note: 'Application submitted' },
      { status: 'Under Review', date: '10 Oct 2026', note: 'Reviewed by recruitment coordinator' },
      { status: 'Rejected', date: '15 Oct 2026', note: 'Position filled by an earlier cohort' },
    ],
  },
  {
    id: 'app-7',
    jobId: 'job-8',
    role: 'Mobile App Developer',
    company: 'Swiggy',
    logo: 'S',
    appliedOn: '05 Oct 2026',
    status: 'withdrawn',
    statusLabel: 'Withdrawn',
    latestUpdate: 'Withdrawn by candidate: Accepted another internship',
    matchScore: 88,
    stipend: '₹10–14 LPA',
    resumeName: 'Resume.pdf',
    withdrawnAt: '10 Oct 2026',
    withdrawnReason: 'Accepted another internship',
    timeline: [
      { step: 'Applied', date: '05 Oct 2026', done: true },
      { step: 'Withdrawn', date: '10 Oct 2026', done: true, current: true },
    ],
    history: [
      { status: 'Applied', date: '05 Oct 2026', note: 'Application submitted' },
      { status: 'Withdrawn', date: '10 Oct 2026', note: 'Withdrawn by candidate' },
    ],
  },
]

export const applicationService = {
  /**
   * Fetches applications with optional status filter and search query
   */
  async getApplications(params = {}) {
    try {
      const res = await apiClient.get('/applications', { params })
      if (res.data && res.data.success) {
        return res.data.data
      }
      throw new Error(res.data?.message || 'Failed to fetch applications')
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        console.warn('Backend applications API unavailable, using local fallback:', err.message)
        return {
          applications: [],
          stats: {
            total: 0,
            underReview: 0,
            shortlisted: 0,
            interviews: 0,
            selected: 0,
            rejected: 0,
            withdrawn: 0,
          },
        }
      }
      throw err
    }
  },

  /**
   * Fetches specific application details including status history
   */
  async getApplicationDetails(id) {
    try {
      const res = await apiClient.get(`/applications/${id}`)
      if (res.data && res.data.success) {
        return res.data.data
      }
      throw new Error(res.data?.message || 'Application not found')
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const found = MOCK_APPLICATIONS.find((a) => a.id === id) || MOCK_APPLICATIONS[0]
        return found
      }
      throw err
    }
  },

  /**
   * Submits candidate application withdrawal
   */
  async withdrawApplication(id, reason = '') {
    try {
      const res = await apiClient.post(`/applications/${id}/withdraw`, { reason })
      return res.data
    } catch (err) {
      console.error('Error withdrawing application:', err)
      throw err
    }
  },

  /**
   * Legacy compatibility method
   */
  async getAllApplications() {
    const data = await this.getApplications()
    return data.applications || MOCK_APPLICATIONS
  },

  /**
   * Legacy compatibility method
   */
  async getApplicationById(id) {
    return this.getApplicationDetails(id)
  },
}
