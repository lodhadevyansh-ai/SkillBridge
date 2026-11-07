import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  PartyPopper,
  RefreshCw,
  Send,
  Sparkles,
  Video,
  X,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MetricCard,
  Modal,
  PageHeader,
  SearchInput,
  Skeleton,
} from '../../components/ui'
import { applicationService } from '../../services/applicationService'
import { useDebounce } from '../../hooks/useDebounce'

export function StudentApplications() {
  // State
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
    rejected: 0,
    withdrawn: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter & Search
  const [activeStatusFilter, setActiveStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Interactive selection & modal states
  const [selectedApp, setSelectedApp] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [appToWithdraw, setAppToWithdraw] = useState(null)
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null)

  // Fetch applications from backend
  const loadApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await applicationService.getApplications({
        status: activeStatusFilter !== 'all' ? activeStatusFilter : undefined,
        search: debouncedSearch.trim() || undefined,
      })
      setApplications(data.applications || [])
      if (data.stats) {
        setStats(data.stats)
      }
      if (data.applications?.length > 0 && !selectedApp) {
        setSelectedApp(data.applications[0])
      }
    } catch (err) {
      console.warn('Backend applications error:', err.message)
      setApplications([])
      setSelectedApp(null)
      setError('Unable to load applications at this time.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount or filter/search changes
  useEffect(() => {
    let isMounted = true
    applicationService
      .getApplications({
        status: activeStatusFilter !== 'all' ? activeStatusFilter : undefined,
        search: debouncedSearch.trim() || undefined,
      })
      .then((data) => {
        if (isMounted) {
          setApplications(data.applications || [])
          if (data.stats) setStats(data.stats)
          if (data.applications?.length > 0) {
            setSelectedApp((prev) =>
              prev ? data.applications.find((a) => a.id === prev.id) || data.applications[0] : data.applications[0]
            )
          } else {
            setSelectedApp(null)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Backend applications error:', err.message)
          setApplications([])
          setSelectedApp(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [activeStatusFilter, debouncedSearch])

  // Open Withdraw Dialog
  const handleOpenWithdraw = (e, app) => {
    e.stopPropagation()
    setAppToWithdraw(app)
    setWithdrawalReason('')
    setIsWithdrawModalOpen(true)
  }

  // Submit Withdrawal to Backend API
  const handleConfirmWithdraw = async () => {
    if (!appToWithdraw) return
    setWithdrawing(true)
    try {
      const res = await applicationService.withdrawApplication(
        appToWithdraw.id,
        withdrawalReason.trim() || 'Withdrawn by candidate'
      )
      if (res && res.success) {
        setActionSuccessMessage(`Application for ${appToWithdraw.role} at ${appToWithdraw.company} was withdrawn.`)
        // Optimistic state update
        setApplications((prev) =>
          prev.map((a) =>
            a.id === appToWithdraw.id
              ? {
                  ...a,
                  status: 'withdrawn',
                  statusLabel: 'Withdrawn',
                  latestUpdate: 'Withdrawn by candidate',
                }
              : a
          )
        )
        if (selectedApp?.id === appToWithdraw.id) {
          setSelectedApp((prev) => ({
            ...prev,
            status: 'withdrawn',
            statusLabel: 'Withdrawn',
            latestUpdate: 'Withdrawn by candidate',
          }))
        }
        setIsWithdrawModalOpen(false)
        setAppToWithdraw(null)
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to withdraw application')
    } finally {
      setWithdrawing(false)
    }
  }

  // Check if an application is withdrawable
  const isWithdrawable = (status) => {
    const s = (status || '').toLowerCase()
    return s === 'applied' || s === 'in-review' || s === 'shortlisted'
  }

  // Helper for status badge styling
  const getStatusBadge = (status, label) => {
    const s = (status || '').toLowerCase()
    if (s === 'interview' || s.includes('interview')) {
      return <Badge variant="interview">{label || 'Interview Scheduled'}</Badge>
    }
    if (s === 'selected' || s === 'offer') {
      return <Badge variant="verified">{label || 'Selected'}</Badge>
    }
    if (s === 'in-review' || s.includes('review')) {
      return <Badge variant="in-review">{label || 'Under Review'}</Badge>
    }
    if (s === 'shortlisted') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/60">
          Shortlisted
        </span>
      )
    }
    if (s === 'rejected') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/60">
          Rejected
        </span>
      )
    }
    if (s === 'withdrawn') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          Withdrawn
        </span>
      )
    }
    return <Badge variant="operational">{label || 'Applied'}</Badge>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Page Header */}
      <PageHeader
        title="Every application. One clear view."
        subtitle="Follow your progress, prepare for what's next, and keep your momentum."
        action={
          <Button
            variant="outline"
            leftIcon={Download}
            onClick={() => {
              const json = JSON.stringify(applications, null, 2)
              const blob = new Blob([json], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `SkillBridge_Applications_${new Date().toISOString().slice(0, 10)}.json`
              a.click()
            }}
          >
            Export applications
          </Button>
        }
      />

      {/* Action Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Five Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <MetricCard
          title="Total applications"
          value={stats.total}
          subtitle="Across 18 companies"
          icon={Send}
        />
        <MetricCard
          title="Under review"
          value={stats.underReview}
          subtitle="Screening in progress"
          icon={Eye}
        />
        <MetricCard
          title="Shortlisted"
          value={stats.shortlisted}
          subtitle="Passed initial criteria"
          icon={Sparkles}
        />
        <MetricCard
          title="Interviews"
          value={stats.interviews}
          subtitle="Next on 28 Oct"
          icon={Video}
        />
        <MetricCard
          title="Selected"
          value={stats.selected}
          subtitle="Offers extended"
          icon={PartyPopper}
        />
      </div>

      {/* 3. Upcoming Interview Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-[#1E1B4B]/50 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-center flex flex-col justify-center shrink-0 shadow-2xs">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
              OCT
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white leading-none">
              28
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              You have an interview coming up.
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              UX Research Intern at Notion · 11:00 AM IST · Google Meet
            </p>
          </div>
        </div>
        <a
          href="https://meet.google.com/sb-notion-priya"
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
        >
          <Button size="sm">Prepare for interview →</Button>
        </a>
      </div>

      {/* 4. Applications Table Card */}
      <Card className="p-0 overflow-hidden shadow-xs">
        {/* Card Header & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your applications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live statuses and history synced with employer review systems
              </p>
            </div>
            <div className="w-full sm:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search by company or role..."
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: `All (${stats.total})` },
              { id: 'applied', label: 'Applied' },
              { id: 'in-review', label: `Under Review (${stats.underReview})` },
              { id: 'shortlisted', label: `Shortlisted (${stats.shortlisted})` },
              { id: 'interview', label: `Interview Scheduled (${stats.interviews})` },
              { id: 'selected', label: `Selected (${stats.selected})` },
              { id: 'rejected', label: `Rejected (${stats.rejected})` },
              { id: 'withdrawn', label: `Withdrawn (${stats.withdrawn})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeStatusFilter === tab.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body / Loading / Empty State */}
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-300">{error}</p>
            <Button size="sm" leftIcon={RefreshCw} onClick={loadApplications}>
              Retry
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No applications found"
              description="No submissions match your active filter criteria. Try adjusting your search query or status filter."
              actionLabel="Clear filters"
              onAction={() => {
                setActiveStatusFilter('all')
                setSearchQuery('')
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Opportunity</th>
                  <th className="py-3 px-5">Applied On</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Latest Update</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app)
                      setIsDetailModalOpen(true)
                    }}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      selectedApp?.id === app.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-xs border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                          {app.logo || app.company[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {app.role}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {app.company} · {app.stipend || 'Competitive'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {app.appliedOn}
                    </td>

                    <td className="py-3.5 px-5">
                      {getStatusBadge(app.status, app.statusLabel)}
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {app.latestUpdate}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app)
                            setIsDetailModalOpen(true)
                          }}
                          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          View details →
                        </button>

                        {isWithdrawable(app.status) && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenWithdraw(e, app)}
                            className="text-[11px] text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors px-1.5 py-0.5 rounded cursor-pointer"
                            title="Withdraw application"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. "Your Journey with [Company]" Bottom Card */}
      {selectedApp && (
        <Card className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Application Progression
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Your journey with {selectedApp.company}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedApp.role} · Applied on {selectedApp.appliedOn}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge(selectedApp.status, selectedApp.statusLabel)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(true)}
              >
                Full details
              </Button>
            </div>
          </div>

          {/* Stepper Timeline Progression */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              {
                step: 'Applied',
                date: selectedApp.appliedOn,
                done: true,
                note: 'Application received',
              },
              {
                step: 'Under review',
                date: selectedApp.status !== 'applied' ? 'Completed' : 'In Progress',
                done: selectedApp.status !== 'applied',
                current: selectedApp.status === 'in-review',
                note: 'Recruiter review',
              },
              {
                step: 'Interview',
                date: selectedApp.status === 'interview' || selectedApp.status === 'selected' ? 'Scheduled' : 'Pending',
                done: selectedApp.status === 'interview' || selectedApp.status === 'selected',
                current: selectedApp.status === 'interview',
                note: 'Technical assessment',
              },
              {
                step: selectedApp.status === 'selected' ? 'Selected' : selectedApp.status === 'rejected' ? 'Concluded' : selectedApp.status === 'withdrawn' ? 'Withdrawn' : 'Decision',
                date: selectedApp.status === 'selected' || selectedApp.status === 'rejected' || selectedApp.status === 'withdrawn' ? 'Completed' : 'Pending',
                done: selectedApp.status === 'selected' || selectedApp.status === 'rejected' || selectedApp.status === 'withdrawn',
                current: selectedApp.status === 'selected',
                note: selectedApp.status === 'selected' ? 'Offer extended' : 'Final decision',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  step.done
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{step.step}</span>
                  </div>
                  {step.current && (
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{step.date}</div>
                <div className="text-[10px] text-slate-400 mt-1">{step.note}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Detailed Application Modal with Status History */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedApp.role}
          subtitle={`${selectedApp.company} · Application Overview`}
          size="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Header Information Strip */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 font-bold flex items-center justify-center text-sm border border-slate-200 dark:border-slate-700">
                  {selectedApp.logo || selectedApp.company[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedApp.company}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Applied on {selectedApp.appliedOn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedApp.status, selectedApp.statusLabel)}
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Attached Resume
                </span>
                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200 mt-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate">{selectedApp.resumeName || 'Resume.pdf'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Match Rating
                </span>
                <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedApp.matchScore || 90}% Profile Synergy</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Compensation
                </span>
                <div className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                  {selectedApp.stipend || 'Competitive'}
                </div>
              </div>
            </div>

            {/* Application Status History Log */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                Status History & Activity Logs
              </h5>
              <div className="space-y-2">
                {(selectedApp.history || [
                  {
                    status: 'Applied',
                    date: selectedApp.appliedOn,
                    note: 'Application submitted directly via SkillBridge',
                  },
                  {
                    status: selectedApp.statusLabel || selectedApp.status,
                    date: selectedApp.appliedOn,
                    note: selectedApp.latestUpdate || 'Status update logged',
                  },
                ]).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-[11px]"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.status}
                      </span>
                      <p className="text-slate-500 dark:text-slate-400">{item.note}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Cover Letter Note (if exists) */}
            {selectedApp.coverLetter && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                  Your Note to Hiring Team
                </h5>
                <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 text-[11px] italic leading-relaxed">
                  &ldquo;{selectedApp.coverLetter}&rdquo;
                </p>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                {isWithdrawable(selectedApp.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      handleOpenWithdraw(null, selectedApp)
                    }}
                  >
                    Withdraw Application
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/student/jobs/${selectedApp.jobId}`}>
                  <Button variant="outline" size="sm" rightIcon={ExternalLink}>
                    View Job Posting
                  </Button>
                </Link>
                <Button size="sm" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Confirm Withdrawal Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          if (!withdrawing) setIsWithdrawModalOpen(false)
        }}
        title="Withdraw Application"
        subtitle={`Confirm withdrawal for ${appToWithdraw?.role} at ${appToWithdraw?.company}`}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to withdraw this application? Once withdrawn, the employer will be notified and your submission will be archived.
          </p>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
              Reason for withdrawal (Optional)
            </label>
            <input
              type="text"
              value={withdrawalReason}
              onChange={(e) => setWithdrawalReason(e.target.value)}
              placeholder="e.g. Accepted another offer, scheduling conflict..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              disabled={withdrawing}
              onClick={() => setIsWithdrawModalOpen(false)}
            >
              Keep Application
            </Button>
            <Button
              size="sm"
              disabled={withdrawing}
              onClick={handleConfirmWithdraw}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {withdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
