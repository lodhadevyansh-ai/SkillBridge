import { apiClient } from './apiClient'

export const FALLBACK_JOBS = [
  {
    id: 'job-1',
    title: 'Product Design Intern',
    company: 'Linear',
    companySlug: 'linear',
    logo: 'L',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'Hybrid',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹30,000 / month',
    salaryMin: 30000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '02 Nov 2026',
    postedDaysAgo: '2 days ago',
    postedHoursAgo: 48,
    matchScore: 98,
    matchReason: 'Your Figma, UI design, and prototyping skills align with this role.',
    isVerified: true,
    isSaved: true,
    headline: 'Make software feel effortless.',
    description:
      'Linear helps teams build better products. Join our design team to shape thoughtful experiences used by ambitious product teams around the world. You’ll learn by doing, with mentorship every step of the way.',
    skills: ['Figma', 'UI design', 'Prototyping', 'Design systems'],
    perks: ['Paid internship', 'Design mentor', 'Flexible hybrid', 'Learning stipend'],
    applicantsCount: 84,
  },
  {
    id: 'job-2',
    title: 'Frontend Developer',
    company: 'Razorpay',
    companySlug: 'razorpay',
    logo: 'R',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'On-site',
    type: 'Full-time',
    duration: 'Permanent',
    stipend: '₹8–12 LPA',
    salaryMin: 66000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '10 Nov 2026',
    postedDaysAgo: '1 day ago',
    postedHoursAgo: 24,
    matchScore: 94,
    matchReason: 'Strong alignment with your React and modern JavaScript portfolio.',
    isVerified: true,
    isSaved: false,
    headline: 'Powering financial experiences for millions.',
    description:
      'Razorpay is building the financial backbone of internet businesses. We are looking for energetic frontend developers ready to build high-scale, accessible web apps.',
    skills: ['React', 'JavaScript', 'CSS', 'Tailwind CSS'],
    perks: ['Competitive CTC', 'Health coverage', 'Learning allowance'],
    applicantsCount: 126,
  },
  {
    id: 'job-3',
    title: 'UX Research Intern',
    company: 'Notion',
    companySlug: 'notion',
    logo: 'N',
    location: 'Remote · India',
    locationCategory: 'remote',
    arrangement: 'Remote',
    type: 'Internship',
    duration: '3 months',
    stipend: '₹25,000 / month',
    salaryMin: 25000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '31 Oct 2026',
    postedDaysAgo: '3 days ago',
    postedHoursAgo: 72,
    matchScore: 92,
    matchReason: 'High overlap in user research and synthesis methodology.',
    isVerified: true,
    isSaved: true,
    headline: 'Help millions organize their work and life.',
    description:
      'Work with our insights team to discover workflows and friction points for students and early-career makers adopting Notion as their primary productivity space.',
    skills: ['User research', 'Usability', 'Communication', 'Figma'],
    perks: ['100% remote', 'Home office budget', 'Notion Pro access'],
    applicantsCount: 65,
  },
  {
    id: 'job-4',
    title: 'Associate Product Designer',
    company: 'Figma',
    companySlug: 'figma',
    logo: 'F',
    location: 'Remote · India',
    locationCategory: 'remote',
    arrangement: 'Remote',
    type: 'Full-time',
    duration: 'Permanent',
    stipend: '₹10–14 LPA',
    salaryMin: 83000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '15 Nov 2026',
    postedDaysAgo: '4 days ago',
    postedHoursAgo: 96,
    matchScore: 90,
    matchReason: 'Exceptional craft alignment in design systems and interactive prototyping.',
    isVerified: true,
    isSaved: false,
    headline: 'Empowering makers to design the future.',
    description:
      'Help build tools that turn ideas into software. You will collaborate closely with engineering, research, and product management to shape intuitive experiences.',
    skills: ['Figma', 'Design systems', 'Interaction design', 'Prototyping'],
    perks: ['Global remote work', 'Wellness stipend', 'Top equipment grant'],
    applicantsCount: 194,
  },
  {
    id: 'job-5',
    title: 'Backend Engineer (Node.js)',
    company: 'Stripe',
    companySlug: 'stripe',
    logo: 'S',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'Hybrid',
    type: 'Full-time',
    duration: 'Permanent',
    stipend: '₹14–18 LPA',
    salaryMin: 116000,
    salaryPeriod: 'month',
    experience: '1-2 years',
    experienceCategory: '1-2-years',
    deadline: '20 Nov 2026',
    postedDaysAgo: '1 day ago',
    postedHoursAgo: 20,
    matchScore: 89,
    matchReason: 'Matches strong backend APIs and PostgreSQL competencies.',
    isVerified: true,
    isSaved: false,
    headline: 'Increasing the GDP of the internet.',
    description:
      'Join Stripe backend infrastructure engineering to build dependable payment processing APIs, scalable webhooks, and real-time ledger verification systems.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'System Design'],
    perks: ['Equity grant', 'Comprehensive health insurance', 'Annual education budget'],
    applicantsCount: 110,
  },
  {
    id: 'job-6',
    title: 'Full Stack Developer Intern',
    company: 'Vercel',
    companySlug: 'vercel',
    logo: 'V',
    location: 'Remote · India',
    locationCategory: 'remote',
    arrangement: 'Remote',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹35,000 / month',
    salaryMin: 35000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '05 Nov 2026',
    postedDaysAgo: 'Just now',
    postedHoursAgo: 4,
    matchScore: 96,
    matchReason: 'Exceptional fit for React 19, Next.js, and modern full-stack workflows.',
    isVerified: true,
    isSaved: true,
    headline: 'Make the web faster and more creative.',
    description:
      'Build developer-focused interfaces and edge serverless integrations for next-generation web applications. Learn directly from framework authors and web architects.',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    perks: ['Remote equipment stipend', 'Flexible hours', 'Fast-track to full time'],
    applicantsCount: 42,
  },
]

export const MOCK_JOBS = FALLBACK_JOBS

export const jobService = {
  /**
   * Fetches paginated & filtered jobs from the backend API
   */
  async getJobs(params = {}) {
    try {
      const response = await apiClient.get('/jobs', { params })
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Failed to fetch jobs')
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        console.warn('Backend job API unavailable, using high-fidelity local fallback', err.message)
        // Fallback filter
        const page = params.page || 1
        const limit = params.limit || 6
        const startIndex = (page - 1) * limit
        return {
          jobs: FALLBACK_JOBS.slice(startIndex, startIndex + limit),
          pagination: {
            total: FALLBACK_JOBS.length,
            page,
            limit,
            totalPages: Math.ceil(FALLBACK_JOBS.length / limit),
            hasPrev: page > 1,
            hasNext: startIndex + limit < FALLBACK_JOBS.length,
            startIndex: startIndex + 1,
            endIndex: Math.min(startIndex + limit, FALLBACK_JOBS.length),
          },
          counts: {
            all: 128,
            internships: 76,
            fullTime: 52,
            partTime: 18,
            remote: 42,
            hybrid: 54,
            onSite: 32,
            entryLevel: 128,
            oneToTwoYears: 64,
          },
        }
      }
      throw err
    }
  },

  /**
   * Fetches specific job by ID
   */
  async getJobById(id) {
    try {
      const response = await apiClient.get(`/jobs/${id}`)
      if (response.data && response.data.success) {
        return response.data.data
      }
      throw new Error(response.data?.message || 'Job not found')
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const found = FALLBACK_JOBS.find((j) => j.id === id) || FALLBACK_JOBS[0]
        return found
      }
      throw err
    }
  },

  /**
   * Toggles bookmark / saved status for a job
   */
  async toggleSaveJob(id) {
    try {
      const response = await apiClient.post(`/jobs/${id}/save`)
      return response.data
    } catch (err) {
      console.error('Error saving job:', err)
      throw err
    }
  },

  /**
   * Submits student application for a job
   */
  async applyToJob(id, applicationData) {
    try {
      const response = await apiClient.post(`/jobs/${id}/apply`, applicationData)
      return response.data
    } catch (err) {
      console.error('Error applying to job:', err)
      throw err
    }
  },

  /**
   * Retrieves application status for current student on this job
   */
  async getApplicationStatus(id) {
    try {
      const response = await apiClient.get(`/jobs/${id}/application-status`)
      return response.data?.data || { hasApplied: false }
    } catch (err) {
      console.warn('Unable to retrieve application status:', err.message)
      return { hasApplied: false }
    }
  },

  /**
   * Legacy compatibility method
   */
  async getAllJobs() {
    const res = await this.getJobs({ limit: 100 })
    return res.jobs || FALLBACK_JOBS
  },

  /**
   * Legacy compatibility method
   */
  async getSavedJobs() {
    const res = await this.getJobs({ limit: 100 })
    return (res.jobs || FALLBACK_JOBS).filter((j) => j.isSaved)
  },
}
