import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  FileUp,
  Globe,
  GraduationCap,
  Phone,
  Send,
  Sparkles,
  User,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Modal,
  Skeleton,
} from '../../components/ui'
import { jobService } from '../../services/jobService'
import { profileService } from '../../services/profileService'
import { useAuth } from '../../hooks/useAuth'
import { SkillMatchWidget } from '../../components/jobs/SkillMatchWidget'

export function StudentJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isStudent } = useAuth()

  // Data & loading states
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [savingBookmark, setSavingBookmark] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)

  // Application Modal & Form states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [resumeOption, setResumeOption] = useState('upload') // 'saved' | 'upload'
  const [selectedSavedResume, setSelectedSavedResume] = useState('')
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submittedApplication, setSubmittedApplication] = useState(null)

  // Fetch job details, application status, and student profile
  useEffect(() => {
    let isMounted = true

    Promise.all([
      jobService.getJobById(id),
      jobService.getApplicationStatus(id),
      profileService.getProfile().catch(() => null),
    ])
      .then(([jobData, statusData, profileData]) => {
        if (isMounted) {
          setJob(jobData)
          setIsSaved(Boolean(jobData.isSaved))
          if (statusData && statusData.hasApplied) {
            setHasApplied(true)
          } else if (jobData.hasApplied) {
            setHasApplied(true)
          }
          if (profileData) {
            setStudentProfile(profileData)
            if (profileData.phone) setPhone(profileData.phone)
            if (profileData.portfolioUrl) setPortfolioUrl(profileData.portfolioUrl)
            if (profileData.resumes && profileData.resumes.length > 0) {
              setResumeOption('saved')
              const defaultRes = profileData.resumes.find((r) => r.isDefault) || profileData.resumes[0]
              setSelectedSavedResume(defaultRes.name)
            }
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load opportunity details')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Toggle Bookmark
  const handleToggleSave = async () => {
    if (!job) return
    setSavingBookmark(true)
    try {
      await jobService.toggleSaveJob(job.id)
      setIsSaved((prev) => !prev)
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    } finally {
      setSavingBookmark(false)
    }
  }

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('File size exceeds 5MB limit. Please upload a smaller file.')
        return
      }
      setUploadedResumeFile(file)
      setSubmitError(null)
    }
  }

  // Open apply workflow with authentication verification
  const handleOpenApplyModal = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!isStudent) {
      setSubmitError('Only student accounts are authorized to submit applications.')
      return
    }
    setIsApplyModalOpen(true)
  }

  // Submit Application Form to Backend API
  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    // Determine final resume file name
    const finalResumeName =
      resumeOption === 'saved'
        ? selectedSavedResume
        : uploadedResumeFile?.name || 'Uploaded_Resume.pdf'

    if (resumeOption === 'upload' && !uploadedResumeFile) {
      setSubmitError('Please select a resume file to upload.')
      setSubmitting(false)
      return
    }

    if (!agreedTerms) {
      setSubmitError('Please confirm the accuracy of your submitted details.')
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        resumeName: finalResumeName,
        coverLetter: coverLetter.trim(),
        portfolioUrl: portfolioUrl.trim(),
        phone: phone.trim(),
      }

      const res = await jobService.applyToJob(job.id, payload)
      if (res && res.success) {
        setHasApplied(true)
        setSubmittedApplication(res.data)
        setIsApplyModalOpen(false)
        setIsSuccessModalOpen(true)
      } else {
        setSubmitError(res.message || 'Application submission failed.')
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to submit application to backend.'
      setSubmitError(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-4 w-36" />
        <Card className="p-6 space-y-6">
          <div className="flex gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </Card>
      </div>
    )
  }

  // Error screen
  if (error || !job) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#161928] rounded-2xl border border-red-200 dark:border-red-900/50 shadow-xs space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Opportunity Not Found
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {error || `We couldn't locate opportunity with ID ${id}.`}
        </p>
        <Link to="/student/jobs">
          <Button size="sm" leftIcon={ArrowLeft}>
            Back to all opportunities
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Back Navigation Link */}
      <Link
        to="/student/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to opportunities</span>
      </Link>

      {/* 2. Main Job Card Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            {/* Company Logo Square */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xl flex items-center justify-center shrink-0 shadow-2xs">
              {job.logo || job.company[0]}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {job.company}
                </span>
                {job.isVerified && (
                  <Badge variant="applied" verified>
                    Verified company
                  </Badge>
                )}
                {hasApplied && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                    <Check className="w-3 h-3" />
                    Applied
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {job.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {job.location} · {job.arrangement} · Posted {job.postedDaysAgo}
              </p>
            </div>
          </div>

          {/* Action Buttons: Save Job & Apply Now */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={Bookmark}
              disabled={savingBookmark}
              onClick={handleToggleSave}
              className={isSaved ? 'text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40' : ''}
            >
              {isSaved ? 'Saved' : 'Save opportunity'}
            </Button>

            {hasApplied ? (
              <Button
                variant="primary"
                disabled
                className="bg-emerald-600 dark:bg-emerald-700 text-white cursor-default opacity-90"
                leftIcon={CheckCircle2}
              >
                Applied · Under Review
              </Button>
            ) : (
              <Button
                variant="primary"
                rightIcon={Send}
                onClick={handleOpenApplyModal}
              >
                Apply now ↗
              </Button>
            )}
          </div>
        </div>

        {/* 4 Attributes Row: Type, Stipend, Experience, Apply Deadline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Type / Duration</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {job.type} {job.duration ? `(${job.duration})` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Stipend / Salary</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {job.stipend}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Experience</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {job.experience}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Apply by</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {job.deadline || 'Rolling basis'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Skill Match Banner Callout */}
      {job.matchScore && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              A strong match for your skills · {job.matchScore}%
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              {job.matchReason ||
                'Your Figma, UI design, and prototyping skills align directly with this position.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Two-Column Layout (Job Specifications + Quick Apply Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Responsibilities, Qualifications, Skills, Perks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            {/* Job Headline & Overview */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {job.headline || `Make software feel effortless at ${job.company}`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5">
                What you&apos;ll work on
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Turn product concepts into intuitive wireframes and interactive prototypes.</li>
                <li>Participate in design critiques and collaborate closely with frontend engineers.</li>
                <li>Partner with product mentors to solve real usability hurdles for thousands of active makers.</li>
                <li>Contribute to the ongoing evolution of our core design systems and token libraries.</li>
              </ul>
            </div>

            {/* Required Qualifications */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5">
                Required qualifications
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Currently enrolled in or recently graduated with a degree in Design, Computer Science, HCI, or related field.</li>
                <li>Demonstrated portfolio or project work showcasing problem exploration, visual craftsmanship, and user-centric design.</li>
                <li>Curious mindset with proactive communication and enthusiasm for continuous craft improvement.</li>
              </ul>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5">
                  Skills you&apos;ll use
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="skill">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Perks & Benefits ("A good place to grow") */}
            {job.perks && job.perks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2.5">
                  A good place to grow
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((perk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      • {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Quick Apply Widget & Company Profile */}
        <div className="space-y-6">
          {/* Quick Apply Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Ready to take the leap?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your default SkillBridge profile and verified resume will be securely transmitted to {job.company}.
            </p>

            {/* Resume Card Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {studentProfile?.resumeFileName || 'Default Resume'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {studentProfile?.resumeUpdatedAt || 'Verified student credentials'}
                  </div>
                </div>
              </div>
              <Link
                to="/student/profile"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {studentProfile?.resumeFileName ? 'Change' : 'Manage'}
              </Link>
            </div>

            {/* Apply Button */}
            {hasApplied ? (
              <div className="space-y-2">
                <Button
                  className="w-full justify-center bg-emerald-600 dark:bg-emerald-700 text-white text-xs font-semibold"
                  size="lg"
                  disabled
                  leftIcon={CheckCircle2}
                >
                  Application Submitted ✓
                </Button>
                <Link
                  to="/student/applications"
                  className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Track progress in My Applications →
                </Link>
              </div>
            ) : (
              <Button
                className="w-full justify-center text-xs font-semibold"
                size="lg"
                rightIcon={Send}
                onClick={handleOpenApplyModal}
              >
                Apply now ↗
              </Button>
            )}

            <p className="text-[11px] text-center text-slate-400">
              Applications close in 7 days
            </p>
          </Card>

          {/* Transparent Rule-Based Skill Compatibility Matcher */}
          <SkillMatchWidget skillMatch={job.skillMatch} />

          {/* About Company Widget */}
          <Card className="p-6 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-sm border border-slate-200/60 dark:border-slate-700/60">
                {job.logo || job.company[0]}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  About {job.company}
                </h4>
                <p className="text-[11px] text-slate-400">Software & Internet · 51–250 employees</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {job.company} builds next-generation productivity and engineering tools designed to help high-growth technology companies ship better products faster.
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Verified Employer
              </span>
              <a
                href={`https://${job.companySlug || 'company'}.com`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Complete Application Submission Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => {
          if (!submitting) setIsApplyModalOpen(false)
        }}
        title={`Apply to ${job.company}`}
        subtitle={`${job.title} · ${job.location}`}
        size="lg"
      >
        <form onSubmit={handleSubmitApplication} className="space-y-5 text-xs">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">{submitError}</div>
            </div>
          )}

          {/* Section 1: Resume Selection & Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Resume / CV <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Saved Resume */}
              <label
                onClick={() => setResumeOption('saved')}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                  resumeOption === 'saved'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-900 dark:text-white text-xs">
                      Saved Resume
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="resumeOption"
                    checked={resumeOption === 'saved'}
                    onChange={() => setResumeOption('saved')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <select
                    value={selectedSavedResume}
                    onChange={(e) => setSelectedSavedResume(e.target.value)}
                    disabled={resumeOption !== 'saved'}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {studentProfile?.resumes && studentProfile.resumes.length > 0 ? (
                      studentProfile.resumes.map((r) => (
                        <option key={r.id || r.name} value={r.name}>
                          {r.name} ({r.fileSizeFormatted || 'PDF'})
                        </option>
                      ))
                    ) : (
                      <option value="">No saved resumes (Please upload a file below)</option>
                    )}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Pre-parsed with your verified skills and education.
                  </p>
                </div>
              </label>

              {/* Option B: Upload New Resume */}
              <label
                onClick={() => setResumeOption('upload')}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                  resumeOption === 'upload'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-900 dark:text-white text-xs">
                      Upload New File
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="resumeOption"
                    checked={resumeOption === 'upload'}
                    onChange={() => setResumeOption('upload')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    disabled={resumeOption !== 'upload'}
                    className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {uploadedResumeFile
                      ? `Selected: ${uploadedResumeFile.name} (${(uploadedResumeFile.size / 1024).toFixed(0)} KB)`
                      : 'PDF or DOCX (max 5MB)'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Contact & Links
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={user?.name || user?.fullName || 'Aanya Sharma'}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Portfolio / GitHub / Work Sample URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Section 3: Optional Cover Letter */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Note to Hiring Team <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400">{coverLetter.length}/500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={`Hi ${job.company} team, I am eager to contribute my design systems and prototyping background to this role...`}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Section 4: Accuracy Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 pt-1 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
            />
            <span className="text-[11px] leading-snug">
              I certify that all provided details and project portfolios are accurate. I agree to share my verified SkillBridge profile with {job.company}.
            </span>
          </label>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              rightIcon={Send}
            >
              {submitting ? 'Submitting Application...' : 'Confirm & Submit Application →'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Application Submitted Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Application Submitted!"
        subtitle={`${job.company} has received your submission`}
        size="md"
      >
        <div className="py-4 text-center space-y-4 text-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              You&apos;re in the running for {job.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your application has been logged into the hiring pipeline at {job.company}. The team will review your profile and reach out via email.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Application ID:</span>
              <strong className="text-slate-900 dark:text-white font-mono">
                {submittedApplication?.id || 'APP-2026-SUBMITTED'}
              </strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Position:</span>
              <span className="font-semibold">{job.title} · {job.company}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Current Status:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                In Review (Initial Screening)
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Attached Resume:</span>
              <span>{submittedApplication?.resumeName || selectedSavedResume}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link to="/student/applications" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
              >
                View in My Applications →
              </Button>
            </Link>
            <Link to="/student/jobs" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Explore more opportunities
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  )
}
