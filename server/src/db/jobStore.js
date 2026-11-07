import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { studentStore } from './studentStore.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const SEED_JOBS = [
  {
    id: 'job-1',
    title: 'Product Design Intern',
    company: 'Linear',
    companySlug: 'linear',
    logo: 'L',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'Hybrid', // Remote | Hybrid | On-site
    type: 'Internship', // Internship | Full-time | Part-time
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
    headline: 'Make the web faster and more creative.',
    description:
      'Build developer-focused interfaces and edge serverless integrations for next-generation web applications. Learn directly from framework authors and web architects.',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    perks: ['Remote equipment stipend', 'Flexible hours', 'Fast-track to full time'],
    applicantsCount: 42,
  },
  {
    id: 'job-7',
    title: 'Product Operations Intern',
    company: 'CRED',
    companySlug: 'cred',
    logo: 'C',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'On-site',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹28,000 / month',
    salaryMin: 28000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '08 Nov 2026',
    postedDaysAgo: '2 days ago',
    postedHoursAgo: 44,
    matchScore: 86,
    matchReason: 'Aligns with your analytical problem solving and customer research background.',
    isVerified: true,
    headline: 'Delivering exceptional rewards and commerce.',
    description:
      'Collaborate with product designers and operations leads to optimize member onboarding, transaction issue resolution, and reward partner workflows.',
    skills: ['SQL', 'Product Ops', 'Analytics', 'Figma'],
    perks: ['Free gourmet meals', 'Clubhouse amenities', 'Mentorship from founders'],
    applicantsCount: 78,
  },
  {
    id: 'job-8',
    title: 'Mobile App Developer (React Native)',
    company: 'Swiggy',
    companySlug: 'swiggy',
    logo: 'S',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'Hybrid',
    type: 'Full-time',
    duration: 'Permanent',
    stipend: '₹10–14 LPA',
    salaryMin: 85000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '18 Nov 2026',
    postedDaysAgo: '3 days ago',
    postedHoursAgo: 60,
    matchScore: 88,
    matchReason: 'Solid match for cross-platform app engineering and performant mobile animations.',
    isVerified: true,
    headline: 'Delivering convenience at unprecedented scale.',
    description:
      'Work on Swiggy main consumer app used by over 50 million monthly active diners and shoppers. Optimize bundle size, 60fps checkout transitions, and live order tracking.',
    skills: ['React Native', 'TypeScript', 'Mobile UI', 'Redux'],
    perks: ['Flexible hybrid model', 'Food credits', 'Continuous learning reimbursement'],
    applicantsCount: 95,
  },
  {
    id: 'job-9',
    title: 'Data Analyst Intern',
    company: 'Zerodha',
    companySlug: 'zerodha',
    logo: 'Z',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'Hybrid',
    type: 'Internship',
    duration: '4 months',
    stipend: '₹32,000 / month',
    salaryMin: 32000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '12 Nov 2026',
    postedDaysAgo: '1 day ago',
    postedHoursAgo: 22,
    matchScore: 91,
    matchReason: 'Matches structured SQL querying, data cleaning, and visualization expertise.',
    isVerified: true,
    headline: 'Simplifying investing for 12+ million Indians.',
    description:
      'Dig deep into trading behavior datasets to find friction points and produce actionable visualizations for product managers and compliance leaders.',
    skills: ['Python', 'SQL', 'Tableau', 'Pandas'],
    perks: ['No micromanagement culture', 'Generous book allowance', 'Gym reimbursement'],
    applicantsCount: 140,
  },
  {
    id: 'job-10',
    title: 'Junior DevOps Engineer',
    company: 'Postman',
    companySlug: 'postman',
    logo: 'P',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'Hybrid',
    type: 'Full-time',
    duration: 'Permanent',
    stipend: '₹9–13 LPA',
    salaryMin: 75000,
    salaryPeriod: 'month',
    experience: '1-2 years',
    experienceCategory: '1-2-years',
    deadline: '22 Nov 2026',
    postedDaysAgo: '5 days ago',
    postedHoursAgo: 110,
    matchScore: 85,
    matchReason: 'Strong alignment with automated deployment pipelines and container technologies.',
    isVerified: true,
    headline: 'Building the global API platform.',
    description:
      'Ensure high availability of our cloud runners and CI/CD pipelines. Automate Terraform scripts, manage Kubernetes pods, and build monitoring dashboards.',
    skills: ['Docker', 'AWS', 'CI/CD', 'Linux', 'Kubernetes'],
    perks: ['Home office setup grant', 'Flexible paid time off', 'Stock options'],
    applicantsCount: 52,
  },
  {
    id: 'job-11',
    title: 'Design Systems Intern',
    company: 'Airbnb',
    companySlug: 'airbnb',
    logo: 'A',
    location: 'Remote · India',
    locationCategory: 'remote',
    arrangement: 'Remote',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹40,000 / month',
    salaryMin: 40000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '03 Nov 2026',
    postedDaysAgo: '2 days ago',
    postedHoursAgo: 36,
    matchScore: 97,
    matchReason: 'Flawless synergy with design token architecture and accessible UI component design.',
    isVerified: true,
    headline: 'Belong anywhere.',
    description:
      'Collaborate with our core systems guild to maintain Figma component libraries, verify WCAG AAA color contrast compliance, and craft documentation for hundreds of designers.',
    skills: ['Design Systems', 'Figma', 'Tokens', 'Accessibility'],
    perks: ['Airbnb travel coupons', 'Remote allowance', 'Global design mentor'],
    applicantsCount: 168,
  },
  {
    id: 'job-12',
    title: 'Machine Learning Intern',
    company: 'Atlassian',
    companySlug: 'atlassian',
    logo: 'A',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'On-site',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹45,000 / month',
    salaryMin: 45000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '16 Nov 2026',
    postedDaysAgo: '4 days ago',
    postedHoursAgo: 90,
    matchScore: 93,
    matchReason: 'Strong alignment with semantic search, vector embeddings, and LLM fine-tuning.',
    isVerified: true,
    headline: 'Unleash the potential of every team.',
    description:
      'Explore RAG architectures and automated ticket clustering algorithms within Jira and Confluence to help teams resolve blockers faster.',
    skills: ['Python', 'PyTorch', 'NLP', 'Scikit-Learn'],
    perks: ['Top-tier stipend', 'Subsidized transport', 'Dedicated research mentor'],
    applicantsCount: 88,
  },
  {
    id: 'job-13',
    title: 'Content & Community Intern',
    company: 'Notion',
    companySlug: 'notion',
    logo: 'N',
    location: 'Delhi NCR, India',
    locationCategory: 'delhi',
    arrangement: 'Part-time',
    type: 'Part-time',
    duration: '3 months',
    stipend: '₹18,000 / month',
    salaryMin: 18000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '30 Oct 2026',
    postedDaysAgo: '6 days ago',
    postedHoursAgo: 130,
    matchScore: 84,
    matchReason: 'Solid communication, social media moderation, and template design background.',
    isVerified: true,
    headline: 'Empower student campus ambassadors across India.',
    description:
      'Host campus workshops, curate student study templates, and engage with our Discord community to introduce Notion to first-year university cohorts.',
    skills: ['Copywriting', 'Community', 'Figma', 'Social Media'],
    perks: ['Part-time flexible hours', 'Exclusive Notion swag', 'Letter of recommendation'],
    applicantsCount: 112,
  },
  {
    id: 'job-14',
    title: 'QA Automation Engineer',
    company: 'Razorpay',
    companySlug: 'razorpay',
    logo: 'R',
    location: 'Bengaluru, Karnataka',
    locationCategory: 'bengaluru',
    arrangement: 'On-site',
    type: 'Full-time',
    duration: 'Permanent',
    stipend: '₹7–10 LPA',
    salaryMin: 60000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '14 Nov 2026',
    postedDaysAgo: '3 days ago',
    postedHoursAgo: 65,
    matchScore: 87,
    matchReason: 'Strong knowledge of end-to-end web testing and JavaScript test harnesses.',
    isVerified: true,
    headline: 'Ensuring zero defects on critical financial rails.',
    description:
      'Write robust Cypress and Playwright integration tests across checkout modals, payment gateway redirects, and subscription webhooks.',
    skills: ['Cypress', 'Playwright', 'JavaScript', 'Jest'],
    perks: ['Relocation allowance', 'Comprehensive health cover', 'Wellness reimbursements'],
    applicantsCount: 64,
  },
  {
    id: 'job-15',
    title: 'Cybersecurity Analyst Intern',
    company: 'CRED',
    companySlug: 'cred',
    logo: 'C',
    location: 'Delhi NCR, India',
    locationCategory: 'delhi',
    arrangement: 'Hybrid',
    type: 'Internship',
    duration: '6 months',
    stipend: '₹30,000 / month',
    salaryMin: 30000,
    salaryPeriod: 'month',
    experience: 'Entry level / fresher',
    experienceCategory: 'entry-level',
    deadline: '09 Nov 2026',
    postedDaysAgo: '1 day ago',
    postedHoursAgo: 18,
    matchScore: 89,
    matchReason: 'Strong fundamentals in network analysis, threat modeling, and Linux administration.',
    isVerified: true,
    headline: 'Protecting the financial identities of high-trust individuals.',
    description:
      'Assist our info-sec team in conducting vulnerability scans, reviewing IAM roles, and triaging suspicious intrusion alerts on production VPC networks.',
    skills: ['Network Security', 'Linux', 'Python', 'Wireshark'],
    perks: ['Security lab stipend', 'Free catered breakfast and lunch', 'Mentorship from CISO'],
    applicantsCount: 50,
  },
  {
    id: 'job-16',
    title: 'Cloud Infrastructure Intern',
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
    deadline: '07 Nov 2026',
    postedDaysAgo: '2 days ago',
    postedHoursAgo: 40,
    matchScore: 91,
    matchReason: 'Solid grounding in DNS, CDN edge caching, and serverless compute primitives.',
    isVerified: true,
    headline: 'Powering frontend cloud deployments worldwide.',
    description:
      'Help build telemetry monitors and auto-scaling rules for serverless edge functions handling millions of requests every minute.',
    skills: ['AWS', 'Terraform', 'DNS', 'Serverless', 'TypeScript'],
    perks: ['Remote office grant', 'Flexible work-life balance', 'Full team retreats'],
    applicantsCount: 74,
  },
]

function readJobs() {
  try {
    if (!fs.existsSync(JOBS_FILE)) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify(SEED_JOBS, null, 2), 'utf-8')
      return [...SEED_JOBS]
    }
    const raw = fs.readFileSync(JOBS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading jobs file:', err)
    return [...SEED_JOBS]
  }
}

export const jobStore = {
  getAllJobs() {
    return readJobs()
  },

  getJobById(id, studentId = null) {
    const jobs = readJobs()
    const job = jobs.find((j) => j.id === id)
    if (!job) return null

    // Check if saved by student
    const isSaved = studentId ? studentStore.hasSavedJob(studentId, id) : false
    const hasApplied = studentId ? studentStore.hasApplied(studentId, id) : false

    return {
      ...job,
      isSaved,
      hasApplied,
    }
  },

  /**
   * Search, filter, sort, and paginate jobs
   */
  filterJobs({
    search = '',
    location = 'all',
    type = 'all', // all | internship | full-time | part-time (can be comma-separated)
    arrangement = 'all', // all | remote | hybrid | on-site (can be comma-separated)
    experience = 'all', // all | entry-level | 1-2-years (can be comma-separated)
    minSalary = 0,
    postedWithin = 'all', // all | 24h | week
    sort = 'recommended', // recommended | recent | salary_high | match
    page = 1,
    limit = 6,
    studentId = null,
  }) {
    const allJobs = readJobs()

    // Retrieve student's saved job IDs
    const savedJobIds = studentId && studentStore.getSavedJobIds
      ? new Set(studentStore.getSavedJobIds(studentId))
      : new Set()

    // Calculate total counts for filter facet badges before global filter
    const counts = {
      all: allJobs.length,
      internships: allJobs.filter((j) => j.type.toLowerCase().includes('intern')).length,
      fullTime: allJobs.filter((j) => j.type.toLowerCase().includes('full-time')).length,
      partTime: allJobs.filter((j) => j.type.toLowerCase().includes('part-time')).length,
      remote: allJobs.filter((j) => j.arrangement.toLowerCase() === 'remote').length,
      hybrid: allJobs.filter((j) => j.arrangement.toLowerCase() === 'hybrid').length,
      onSite: allJobs.filter((j) => j.arrangement.toLowerCase().includes('on-site') || j.arrangement.toLowerCase().includes('onsite')).length,
      entryLevel: allJobs.filter((j) => j.experienceCategory === 'entry-level').length,
      oneToTwoYears: allJobs.filter((j) => j.experienceCategory === '1-2-years').length,
    }

    // Apply Filters
    let filtered = allJobs.filter((job) => {
      // 1. Text Search (Debounced on client)
      if (search && search.trim() !== '') {
        const query = search.trim().toLowerCase()
        const matchesTitle = job.title.toLowerCase().includes(query)
        const matchesCompany = job.company.toLowerCase().includes(query)
        const matchesSkills = job.skills.some((s) => s.toLowerCase().includes(query))
        const matchesLocation = job.location.toLowerCase().includes(query)
        const matchesDescription = (job.description || '').toLowerCase().includes(query)
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesLocation && !matchesDescription) {
          return false
        }
      }

      // 2. Location
      if (location && location !== 'all') {
        const loc = location.toLowerCase()
        if (loc === 'remote') {
          if (job.arrangement.toLowerCase() !== 'remote' && !job.location.toLowerCase().includes('remote')) {
            return false
          }
        } else if (!job.location.toLowerCase().includes(loc) && job.locationCategory !== loc) {
          return false
        }
      }

      // 3. Job Type (Supports comma-separated or single)
      if (type && type !== 'all') {
        const types = type.toLowerCase().split(',').map((t) => t.trim())
        const matchesType = types.some((t) => {
          if (t === 'internship' || t === 'internships') return job.type.toLowerCase().includes('intern')
          if (t === 'full-time' || t === 'fulltime' || t === 'jobs') return job.type.toLowerCase().includes('full')
          if (t === 'part-time' || t === 'parttime') return job.type.toLowerCase().includes('part')
          return false
        })
        if (!matchesType) return false
      }

      // 4. Work Arrangement (Supports comma-separated or single)
      if (arrangement && arrangement !== 'all') {
        const arrangements = arrangement.toLowerCase().split(',').map((a) => a.trim())
        const matchesArrangement = arrangements.some((a) => {
          if (a === 'remote') return job.arrangement.toLowerCase() === 'remote'
          if (a === 'hybrid') return job.arrangement.toLowerCase() === 'hybrid'
          if (a === 'on-site' || a === 'onsite') return job.arrangement.toLowerCase().includes('on-site') || job.arrangement.toLowerCase().includes('onsite')
          return false
        })
        if (!matchesArrangement) return false
      }

      // 5. Experience Level (Supports comma-separated or single)
      if (experience && experience !== 'all') {
        const experiences = experience.toLowerCase().split(',').map((e) => e.trim())
        const matchesExp = experiences.some((e) => {
          if (e === 'entry-level' || e === 'fresher' || e.includes('entry')) return job.experienceCategory === 'entry-level'
          if (e === '1-2-years' || e.includes('1-2')) return job.experienceCategory === '1-2-years'
          return false
        })
        if (!matchesExp) return false
      }

      // 6. Minimum Salary / Stipend
      const parsedMinSalary = Number(minSalary) || 0
      if (parsedMinSalary > 0) {
        if (job.salaryMin < parsedMinSalary) return false
      }

      // 7. Date Posted Within
      if (postedWithin && postedWithin !== 'all') {
        if (postedWithin === '24h' && job.postedHoursAgo > 24) return false
        if (postedWithin === 'week' && job.postedHoursAgo > 168) return false
      }

      return true
    })

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sort === 'recent') {
        return (a.postedHoursAgo || 0) - (b.postedHoursAgo || 0)
      }
      if (sort === 'salary_high') {
        return (b.salaryMin || 0) - (a.salaryMin || 0)
      }
      if (sort === 'match') {
        return (b.matchScore || 0) - (a.matchScore || 0)
      }
      // 'recommended' is default (combines match score & freshness)
      return (b.matchScore || 0) - (a.matchScore || 0)
    })

    // Apply Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 6)
    const total = filtered.length
    const totalPages = Math.ceil(total / limitNum) || 1
    const startIndex = (pageNum - 1) * limitNum
    const paginated = filtered.slice(startIndex, startIndex + limitNum)

    // Map `isSaved` status
    const resultJobs = paginated.map((j) => ({
      ...j,
      isSaved: savedJobIds.has(j.id) || Boolean(j.isSaved),
    }))

    return {
      jobs: resultJobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
        startIndex: total === 0 ? 0 : startIndex + 1,
        endIndex: Math.min(startIndex + limitNum, total),
      },
      counts,
    }
  },
}

