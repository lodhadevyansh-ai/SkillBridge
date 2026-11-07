import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Users,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Eye,
  Check,
  XCircle,
  Building,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  PageHeader,
  Skeleton,
  EmptyState,
  Modal,
} from '../../components/ui'
import { recruiterService } from '../../services/recruiterService'

export function RecruiterJobs() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [jobsData, setJobsData] = useState({
    jobs: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    counts: { all: 0, active: 0, draft: 0, closed: 0 },
  })

  // Filters
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastMessage, setToastMessage] = useState(null)

  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const reloadJobs = () => {
    setLoading(true)
    recruiterService
      .getJobs({
        search: searchQuery,
        status: activeTab,
        page: currentPage,
        limit: 10,
      })
      .then((data) => {
        setJobsData(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load recruiter jobs:', err)
        setError(err.message || 'Unable to connect to job service')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false
    recruiterService
      .getJobs({
        search: searchQuery,
        status: activeTab,
        page: currentPage,
        limit: 10,
      })
      .then((data) => {
        if (!ignore) {
          setJobsData(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load recruiter jobs:', err)
          setError(err.message || 'Unable to connect to job service')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [searchQuery, activeTab, currentPage])

  // Handle Publish
  const handlePublish = async (jobId, jobTitle) => {
    try {
      await recruiterService.publishJob(jobId)
      showToast(`'${jobTitle}' has been published and is now Active.`)
      reloadJobs()
    } catch (err) {
      showToast(err.message || 'Failed to publish job')
    }
  }

  // Handle Close
  const handleClose = async (jobId, jobTitle) => {
    try {
      await recruiterService.closeJob(jobId)
      showToast(`'${jobTitle}' has been closed for new applications.`)
      reloadJobs()
    } catch (err) {
      showToast(err.message || 'Failed to close job')
    }
  }

  // Handle Delete
  const confirmDelete = async () => {
    if (!jobToDelete) return
    try {
      setIsDeleting(true)
      await recruiterService.deleteJob(jobToDelete.id)
      showToast(`'${jobToDelete.title}' was deleted.`)
      setJobToDelete(null)
      reloadJobs()
    } catch (err) {
      showToast(err.message || 'Failed to delete job')
    } finally {
      setIsDeleting(false)
    }
  }

  const jobsList = useMemo(() => jobsData.jobs || [], [jobsData.jobs])

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-medium border border-slate-700 dark:border-slate-200 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Manage open roles"
        subtitle="Manage your company's active listings, track candidate volume, and publish new openings."
        action={
          <Link to="/recruiter/jobs/create">
            <Button variant="primary" leftIcon={Plus}>
              Post a new role
            </Button>
          </Link>
        }
      />

      {/* Controls Bar: Tabs + Search */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] space-y-3 shadow-xs">
        {/* Top row: Tab pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All roles ({jobsData.counts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('active')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active ({jobsData.counts.active})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('draft')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'draft'
                  ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Drafts ({jobsData.counts.draft})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('closed')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'closed'
                  ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Closed ({jobsData.counts.closed})
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {jobsList.length} of {jobsData.pagination.total} positions
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search your jobs by title, skills, or location..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50/30 text-red-700 dark:text-red-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={reloadJobs} leftIcon={RotateCcw}>
            Retry
          </Button>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="w-48 h-5" />
                  <Skeleton className="w-36 h-3" />
                </div>
                <Skeleton className="w-16 h-6 rounded-md" />
              </div>
              <Skeleton className="w-full h-12 rounded-xl" />
              <div className="flex justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobsList.length === 0 && (
        <Card className="p-8 text-center">
          <EmptyState
            icon={Building}
            title="No job listings found"
            description={
              searchQuery
                ? `No job listings matching "${searchQuery}". Try a different keyword.`
                : activeTab !== 'all'
                ? `You have no ${activeTab} job listings.`
                : 'You have not created any job listings yet. Start finding exceptional candidates by posting a new role.'
            }
            actionLabel="+ Post a new role"
            onAction={() => navigate('/recruiter/jobs/create')}
          />
        </Card>
      )}

      {/* Job Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobsList.map((job) => {
            const isDraft = (job.status || '').toLowerCase() === 'draft'
            const isClosed = (job.status || '').toLowerCase() === 'closed'
            const isActive = !isDraft && !isClosed

            return (
              <Card
                key={job.id}
                className="flex flex-col justify-between p-5 border-slate-200/80 dark:border-[#282D4A] hover:border-indigo-300 dark:hover:border-indigo-900 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                        <Link to={`/recruiter/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {job.location} · {job.arrangement} · {job.type}
                      </p>
                    </div>

                    <Badge
                      variant={
                        isActive ? 'active' : isDraft ? 'warning' : 'neutral'
                      }
                    >
                      {job.status || 'Active'}
                    </Badge>
                  </div>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Applicants
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {job.applicantsCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Shortlisted
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {job.shortlistedCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Deadline
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-xs truncate block">
                        {job.closesOn || job.deadline || 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Link to={`/recruiter/jobs/${job.id}`}>
                      <Button size="sm" variant="outline" leftIcon={Eye}>
                        Details
                      </Button>
                    </Link>
                    <Link to={`/recruiter/jobs/${job.id}/edit`}>
                      <Button size="sm" variant="ghost" leftIcon={Edit3}>
                        Edit
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Publish toggle (if Draft or Closed) */}
                    {(isDraft || isClosed) && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={Check}
                        onClick={() => handlePublish(job.id, job.title)}
                      >
                        Publish
                      </Button>
                    )}

                    {/* Close listing (if Active) */}
                    {isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={XCircle}
                        onClick={() => handleClose(job.id, job.title)}
                        className="text-slate-600 hover:text-amber-600"
                      >
                        Close
                      </Button>
                    )}

                    {/* Candidates Link */}
                    <Link to={`/recruiter/candidates?jobId=${job.id}`}>
                      <Button size="sm" variant="secondary" leftIcon={Users}>
                        Candidates ({job.applicantsCount || 0})
                      </Button>
                    </Link>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setJobToDelete(job)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete job listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {jobsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] text-xs">
          <Button
            size="sm"
            variant="outline"
            disabled={!jobsData.pagination.hasPrev}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Page {jobsData.pagination.page} of {jobsData.pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!jobsData.pagination.hasNext}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        title="Delete Job Listing"
        subtitle="This action cannot be undone."
      >
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900 dark:text-white">
              "{jobToDelete?.title}"
            </strong>
            ? This will remove the listing from candidate discovery and archive any associated
            applicant metrics.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
