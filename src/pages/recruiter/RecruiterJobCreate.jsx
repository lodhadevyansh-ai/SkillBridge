import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  X,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Globe,
  Tag,
} from 'lucide-react'
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Alert,
  Badge,
  Skeleton,
} from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { recruiterService } from '../../services/recruiterService'

const WORK_MODES = [
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'On-site', label: 'On-site' },
]

const JOB_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
]

const EXPERIENCE_LEVELS = [
  { value: 'Entry level', label: 'Entry level (0–2 years)' },
  { value: 'Mid level', label: 'Mid level (2–5 years)' },
  { value: 'Senior level', label: 'Senior level (5+ years)' },
]

const SALARY_PERIODS = [
  { value: 'year', label: 'Per Year (LPA / Annual)' },
  { value: 'month', label: 'Per Month (Stipend)' },
]

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Figma',
  'UI/UX',
  'Tailwind CSS',
  'SQL',
  'PostgreSQL',
  'GraphQL',
  'Next.js',
  'Git',
  'Docker',
]

export function RecruiterJobCreate() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    company: user?.companyName || 'Linear',
    companyLogo: '',
    companyWebsite: 'https://linear.app',
    location: 'Bengaluru · Hybrid',
    arrangement: 'Hybrid',
    type: 'Full-time',
    experience: 'Entry level',
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'year',
    stipend: '',
    deadline: '30 Nov 2026',
    description: '',
    responsibilitiesText: '',
    qualificationsText: '',
    skills: [],
    status: 'Active',
  })

  // Skill input temporary state
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState({})

  // Load existing job if in edit mode
  useEffect(() => {
    if (!isEdit) return

    let isMounted = true
    const fetchJob = async () => {
      try {
        setLoading(true)
        setGeneralError(null)
        const job = await recruiterService.getJobById(id)
        if (!isMounted) return

        const respText = Array.isArray(job.responsibilities)
          ? job.responsibilities.join('\n')
          : job.responsibilities || ''

        const qualText = Array.isArray(job.qualifications)
          ? job.qualifications.join('\n')
          : job.qualifications || ''

        setFormData({
          title: job.title || '',
          company: job.company || user?.companyName || '',
          companyLogo: job.companyLogo || '',
          companyWebsite: job.companyWebsite || '',
          location: job.location || '',
          arrangement: job.arrangement || 'Hybrid',
          type: job.type || 'Full-time',
          experience: job.experience || 'Entry level',
          salaryMin: job.salaryMin || '',
          salaryMax: job.salaryMax || '',
          salaryPeriod: job.salaryPeriod || 'year',
          stipend: job.stipend || '',
          deadline: job.deadline || job.closesOn || '',
          description: job.description || '',
          responsibilitiesText: respText,
          qualificationsText: qualText,
          skills: Array.isArray(job.skills) ? job.skills : [],
          status: job.status || 'Active',
        })
      } catch (err) {
        if (!isMounted) return
        setGeneralError(err.message || 'Unable to load job listing details.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchJob()
    return () => {
      isMounted = false
    }
  }, [id, isEdit, user])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Skills Tag Management
  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim()
    if (!trimmed) return
    if (!formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }))
      if (errors.skills) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next.skills
          return next
        })
      }
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }))
  }

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  // Validate form
  const validateForm = (isDraft = false) => {
    const errs = {}
    if (!formData.title.trim()) {
      errs.title = 'Job title is required'
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Job title must be at least 3 characters'
    }

    if (!formData.company.trim()) {
      errs.company = 'Company name is required'
    }

    if (!isDraft) {
      if (!formData.location.trim()) {
        errs.location = 'Job location is required'
      }
      if (!formData.description.trim()) {
        errs.description = 'Job description is required'
      } else if (formData.description.trim().length < 30) {
        errs.description = 'Description should be at least 30 characters'
      }
      if (formData.skills.length === 0) {
        errs.skills = 'Please add at least one required skill tag'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Submit Handler
  const handleSubmit = async (targetStatus) => {
    setGeneralError(null)
    const isDraft = targetStatus === 'Draft'

    if (!validateForm(isDraft)) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Auto format stipend/salary display string if empty
    let computedStipend = formData.stipend.trim()
    if (!computedStipend && (formData.salaryMin || formData.salaryMax)) {
      const min = formData.salaryMin ? `₹${formData.salaryMin}` : ''
      const max = formData.salaryMax ? `₹${formData.salaryMax}` : ''
      const unit = formData.salaryPeriod === 'year' ? 'LPA' : '/ month'
      computedStipend = min && max ? `${min}–${max} ${unit}` : `${min || max} ${unit}`
    }

    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      companyLogo: formData.companyLogo.trim(),
      companyWebsite: formData.companyWebsite.trim(),
      location: formData.location.trim(),
      arrangement: formData.arrangement,
      type: formData.type,
      experience: formData.experience,
      salaryMin: formData.salaryMin,
      salaryMax: formData.salaryMax,
      salaryPeriod: formData.salaryPeriod,
      stipend: computedStipend || 'Competitive',
      deadline: formData.deadline.trim(),
      description: formData.description.trim(),
      responsibilities: formData.responsibilitiesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      qualifications: formData.qualificationsText
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
      skills: formData.skills,
      status: targetStatus,
    }

    try {
      setSubmitting(true)
      if (isEdit) {
        await recruiterService.updateJob(id, payload)
        setSuccessMessage(`Role '${payload.title}' was successfully updated.`)
      } else {
        const created = await recruiterService.createJob(payload)
        setSuccessMessage(
          targetStatus === 'Draft'
            ? `Role '${created.title}' has been saved as a draft.`
            : `Role '${created.title}' has been successfully published!`
        )
      }

      setTimeout(() => {
        navigate('/recruiter/jobs')
      }, 1400)
    } catch (err) {
      console.error('Failed to save job:', err)
      setGeneralError(
        err.message || 'An error occurred while saving the role. Please check your inputs and try again.'
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-72" />
        <Card className="p-8 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top back navigation */}
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to my job listings</span>
      </Link>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Edit Role Opportunity' : 'Post a New Opportunity'}
            </h1>
            {isEdit && (
              <Badge
                variant={
                  formData.status === 'Active'
                    ? 'success'
                    : formData.status === 'Draft'
                    ? 'neutral'
                    : 'warning'
                }
              >
                {formData.status}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEdit
              ? 'Update the requirements, compensation, and qualifications for this role.'
              : 'Create a detailed listing to attract top early-career talent and aspiring builders.'}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleSubmit('Draft')}
            leftIcon={Save}
          >
            {submitting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('Active')}
            leftIcon={isEdit ? Send : Sparkles}
          >
            {submitting
              ? 'Processing...'
              : isEdit
              ? formData.status === 'Draft'
                ? 'Publish Role'
                : 'Save Changes'
              : 'Publish Listing'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {generalError && (
        <Alert variant="danger" title="Unable to Save Opportunity">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Success">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMessage} Redirecting to your listings...</span>
          </div>
        </Alert>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Section 1: Basic Role Information */}
        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Role & Company Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Job Title"
                placeholder="e.g. Associate Product Designer, Junior Frontend Developer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                required
              />
            </div>

            <Input
              label="Hiring Company"
              placeholder="e.g. Linear, Vercel, Razorpay"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              error={errors.company}
              leftIcon={Building2}
              required
            />

            <Input
              label="Company Website or Careers URL"
              placeholder="https://yourcompany.com"
              value={formData.companyWebsite}
              onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
              leftIcon={Globe}
            />

            <Input
              label="Location"
              placeholder="e.g. Bengaluru, India or Remote"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              error={errors.location}
              leftIcon={MapPin}
              required
            />

            <Select
              label="Work Mode"
              options={WORK_MODES}
              value={formData.arrangement}
              onChange={(e) => handleInputChange('arrangement', e.target.value)}
            />

            <Select
              label="Employment Type"
              options={JOB_TYPES}
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            />

            <Select
              label="Experience Level"
              options={EXPERIENCE_LEVELS}
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
            />
          </div>
        </Card>

        {/* Section 2: Compensation & Schedule */}
        <Card className="space-y-5 p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Compensation & Application Timeline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Compensation"
              placeholder="e.g. 14 (in Lakhs or ₹k)"
              value={formData.salaryMin}
              onChange={(e) => handleInputChange('salaryMin', e.target.value)}
            />

            <Input
              label="Max Compensation"
              placeholder="e.g. 22 (in Lakhs or ₹k)"
              value={formData.salaryMax}
              onChange={(e) => handleInputChange('salaryMax', e.target.value)}
            />

            <Select
              label="Compensation Frequency"
              options={SALARY_PERIODS}
              value={formData.salaryPeriod}
              onChange={(e) => handleInputChange('salaryPeriod', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Display Stipend / Salary Badge"
              placeholder="e.g. ₹14–22 LPA or ₹35,000 / month"
              value={formData.stipend}
              onChange={(e) => handleInputChange('stipend', e.target.value)}
              helperText="Shown on candidate job search cards. If left blank, it will be auto-formatted."
            />

            <Input
              label="Application Deadline"
              placeholder="e.g. 30 Nov 2026"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              leftIcon={Calendar}
              helperText="Date after which new applications are paused."
            />
          </div>
        </Card>

        {/* Section 3: Job Description & Overview */}
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Role Overview & Responsibilities
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Markdown supported</span>
          </div>

          <Textarea
            label="Role Overview / Summary"
            placeholder="Introduce the mission of the team, the scope of the position, and what the candidate will be building..."
            rows={5}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Key Responsibilities (one per line)"
              placeholder={`Collaborate with designers and backend teams\nBuild responsive components in React\nParticipate in code reviews and sprint planning`}
              rows={5}
              value={formData.responsibilitiesText}
              onChange={(e) => handleInputChange('responsibilitiesText', e.target.value)}
              helperText="Each line will appear as a bullet point on the listing."
            />

            <Textarea
              label="Required Qualifications (one per line)"
              placeholder={`B.Tech, B.Des, or related degree graduating 2025–2027\nProficiency with modern JavaScript/TypeScript\nDemonstrated side project or portfolio`}
              rows={5}
              value={formData.qualificationsText}
              onChange={(e) => handleInputChange('qualificationsText', e.target.value)}
              helperText="Each line will appear as a bullet point on the listing."
            />
          </div>
        </Card>

        {/* Section 4: Skills & Matching Tags */}
        <Card className="space-y-5 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Skills & Matching Tags
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Used by SkillBridge match algorithm
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter or comma (e.g. React, Docker, Python)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                  className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddSkill()}
                leftIcon={Plus}
              >
                Add
              </Button>
            </div>
            {errors.skills && (
              <p className="mt-1.5 text-xs text-red-500">{errors.skills}</p>
            )}
          </div>

          {/* Active Skills List */}
          {formData.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Skills ({formData.skills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-200/60 dark:border-indigo-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 dark:hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Quick Add Skills */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Popular Skill Suggestions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.filter(
                (ps) => !formData.skills.some((s) => s.toLowerCase() === ps.toLowerCase())
              ).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>{skill}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link to="/recruiter/jobs">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSubmit('Draft')}
              leftIcon={Save}
            >
              {submitting ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('Active')}
              leftIcon={isEdit ? Send : Sparkles}
            >
              {submitting
                ? 'Saving...'
                : isEdit
                ? formData.status === 'Draft'
                  ? 'Publish Role'
                  : 'Update Listing'
                : 'Publish Opportunity'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
