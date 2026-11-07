import { useState, useEffect } from 'react'
import {
  Search,
  CheckCircle2,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  Select,
  Textarea,
  Skeleton,
  EmptyState,
} from '../../components/ui'
import { adminService } from '../../services/adminService'

export function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Remove Modal
  const [jobToRemove, setJobToRemove] = useState(null)
  const [removalReason, setRemovalReason] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getJobs({
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        limit: 10,
      })
      setJobs(data.jobs || [])
      setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 })
    } catch (err) {
      console.error('Failed to load admin jobs:', err)
      setError(err.message || 'Unable to retrieve job opportunities.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getJobs({
          status: statusFilter,
          search: searchQuery,
          page: currentPage,
          limit: 10,
        })
        if (!isMounted) return
        setJobs(data.jobs || [])
        setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 })
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load admin jobs:', err)
        setError(err.message || 'Unable to retrieve job opportunities.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [statusFilter, searchQuery, currentPage])

  // Handle Approve
  const handleApprove = async (job) => {
    try {
      await adminService.approveJob(job.id)
      showToast(`Role '${job.title}' approved and published to candidate feed!`)
      fetchJobs()
    } catch (err) {
      alert(err.message || 'Failed to approve listing')
    }
  }

  // Handle Remove submit
  const handleRemoveSubmit = async () => {
    if (!jobToRemove) return
    try {
      setIsRemoving(true)
      const reason = removalReason.trim() || 'Violates platform quality or compensation standards'
      await adminService.removeJob(jobToRemove.id, reason)
      showToast(`Listing '${jobToRemove.title}' removed from platform.`)
      setJobToRemove(null)
      setRemovalReason('')
      fetchJobs()
    } catch (err) {
      alert(err.message || 'Failed to remove listing')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Listing Moderation & Management"
        subtitle="Review new opportunities against SkillBridge minimum stipend policies, verify employer legitimacy, and resolve flagged listings."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search listings by title, company, or target skills..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Opportunities' },
                { value: 'draft', label: 'Draft Postings' },
                { value: 'closed', label: 'Closed Listings' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Listings Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No Listings Found"
              description="No job listings match your current search or status filter."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setCurrentPage(1)
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Listing Title</th>
                  <th className="py-3 px-5">Hiring Company</th>
                  <th className="py-3 px-5">Stipend / Comp</th>
                  <th className="py-3 px-5">Mode & Type</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map((j) => {
                  const isActive = (j.status || 'Active').toLowerCase() === 'active'
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {j.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Closes: {j.deadline || j.closesOn || 'Ongoing'}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                        {j.company}
                      </td>

                      <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-semibold">
                        {j.stipend || 'Competitive'}
                      </td>

                      <td className="py-3.5 px-5 text-slate-500">
                        {j.arrangement || 'Hybrid'} · {j.type || 'Full-time'}
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge variant={isActive ? 'success' : 'neutral'}>
                          {j.status || 'Active'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5 text-right space-x-1.5">
                        {!isActive && (
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={ShieldCheck}
                            onClick={() => handleApprove(j)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          leftIcon={Trash2}
                          onClick={() => {
                            setJobToRemove(j)
                            setRemovalReason('')
                          }}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </Button>
            <span className="text-slate-400 font-medium">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} opportunities)
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>

      {/* Remove Listing Modal */}
      <Modal
        isOpen={Boolean(jobToRemove)}
        onClose={() => !isRemoving && setJobToRemove(null)}
        title="Remove Opportunity Listing"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove{' '}
            <strong className="text-slate-900 dark:text-white">
              "{jobToRemove?.title}"
            </strong>{' '}
            by <strong className="text-slate-900 dark:text-white">{jobToRemove?.company}</strong>?
            This listing will immediately become inaccessible to students.
          </p>

          <Textarea
            label="Reason for Listing Removal"
            placeholder="e.g. Unpaid internship policy violation, non-functional application URL, duplicate post..."
            rows={3}
            value={removalReason}
            onChange={(e) => setRemovalReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={isRemoving}
              onClick={() => setJobToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isRemoving}
              onClick={handleRemoveSubmit}
              leftIcon={Trash2}
            >
              {isRemoving ? 'Removing...' : 'Confirm Removal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
