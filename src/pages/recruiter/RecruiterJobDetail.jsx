import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit3,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Modal,
  EmptyState,
} from '../../components/ui'
import { recruiterService } from '../../services/recruiterService'

export function RecruiterJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  useEffect(() => {
    let isMounted = true

    const loadJob = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await recruiterService.getJobById(id)
        if (isMounted) {
          setJob(data)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load job details:', err)
          setError(err.message || 'Job listing could not be found or access is restricted.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadJob()

    return () => {
      isMounted = false
    }
  }, [id])

  // Handle Publish
  const handlePublish = async () => {
    try {
      setActionLoading(true)
      const updated = await recruiterService.publishJob(id)
      setJob(updated)
      showToast(`Listing '${updated.title}' is now Active and visible to candidates.`)
    } catch (err) {
      alert(err.message || 'Failed to publish job')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Close
  const handleClose = async () => {
    try {
      setActionLoading(true)
      const updated = await recruiterService.closeJob(id)
      setJob(updated)
      showToast(`Listing '${updated.title}' has been closed.`)
    } catch (err) {
      alert(err.message || 'Failed to close job')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true)
      await recruiterService.deleteJob(id)
      setShowDeleteModal(false)
      navigate('/recruiter/jobs', {
        state: { message: `Role '${job.title}' was successfully deleted.` },
      })
    } catch (err) {
      alert(err.message || 'Failed to delete listing')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-6 w-36" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-6 max-w-3xl py-12">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to my job listings</span>
        </Link>

        <EmptyState
          title="Listing Not Found"
          description={error || "The requested job listing doesn't exist or you don't have permission to manage it."}
          actionLabel="Return to My Roles"
          onAction={() => navigate('/recruiter/jobs')}
        />
      </div>
    )
  }

  const isDraft = job.status?.toLowerCase() === 'draft'
  const isActive = job.status?.toLowerCase() === 'active'

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top back navigation */}
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to my job listings</span>
      </Link>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {job.title}
            </h1>
            <Badge
              variant={
                isActive
                  ? 'success'
                  : isDraft
                  ? 'neutral'
                  : 'warning'
              }
            >
              {job.status}
            </Badge>
            {job.arrangement && (
              <Badge variant="outline">{job.arrangement}</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {job.company}
            </span>
            <span>·</span>
            <span>{job.location}</span>
            <span>·</span>
            <span>Posted {job.postedDaysAgo || 'recently'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/recruiter/candidates?jobId=${job.id}`}>
            <Button leftIcon={Users}>
              Candidates ({job.applicantsCount || 0})
            </Button>
          </Link>

          <Link to={`/recruiter/jobs/${job.id}/edit`}>
            <Button variant="outline" leftIcon={Edit3}>
              Edit Role
            </Button>
          </Link>

          {/* Publish / Close toggle */}
          {isActive ? (
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={handleClose}
              leftIcon={XCircle}
              className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              Close Role
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={handlePublish}
              leftIcon={CheckCircle2}
              className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              Publish Role
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2.5"
            title="Delete this role"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card className="space-y-4 p-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Role Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </Card>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card className="space-y-4 p-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Key Responsibilities
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {(Array.isArray(job.responsibilities)
                  ? job.responsibilities
                  : [job.responsibilities]
                ).map((resp, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <Card className="space-y-4 p-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Qualifications & Expectations
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {(Array.isArray(job.qualifications)
                  ? job.qualifications
                  : [job.qualifications]
                ).map((qual, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Target Skills */}
          {job.skills && job.skills.length > 0 && (
            <Card className="space-y-4 p-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Target Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="skill">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Listing Snapshot & Metrics */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Listing Snapshot
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Total Applicants</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {job.applicantsCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Shortlisted</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {job.shortlistedCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <Badge
                  variant={
                    isActive
                      ? 'success'
                      : isDraft
                      ? 'neutral'
                      : 'warning'
                  }
                >
                  {job.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Compensation</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {job.stipend || 'Competitive'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Employment Type</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {job.type || 'Full-time'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Work Mode</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {job.arrangement || 'Hybrid'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Experience</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {job.experience || 'Entry level'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Closes On</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {job.deadline || job.closesOn || 'Ongoing'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link to={`/recruiter/candidates?jobId=${job.id}`} className="block w-full">
                <Button className="w-full" leftIcon={Users}>
                  Review All Candidates
                </Button>
              </Link>
            </div>
          </Card>

          {/* Hiring Company Info Card */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Hiring Organization
              </h3>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {job.company}
            </p>
            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Visit company site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SkillBridge Verified Recruiter</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Job Opportunity"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 dark:text-white">"{job.title}"</strong>?
            This will remove the listing and cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              leftIcon={Trash2}
            >
              {isDeleting ? 'Deleting...' : 'Delete Listing'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
