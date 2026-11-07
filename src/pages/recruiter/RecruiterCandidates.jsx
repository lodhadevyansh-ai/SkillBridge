import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Calendar,
  FileText,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Download,
  Search,
  MessageSquare,
  Sparkles,
  Video,
  ThumbsUp,
  History,
  Eye,
  Send,
  Plus,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Modal,
  PageHeader,
  Select,
  Textarea,
  Input,
  Skeleton,
  EmptyState,
} from '../../components/ui'
import { recruiterService } from '../../services/recruiterService'

const STAGE_TABS = [
  { id: 'all', label: 'All Candidates' },
  { id: 'in-review', label: 'In Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
]

const INTERVIEW_MODES = [
  { value: 'Google Meet', label: 'Google Meet (Video)' },
  { value: 'Zoom', label: 'Zoom Video' },
  { value: 'Phone', label: 'Phone Interview' },
  { value: 'In-person', label: 'In-person On-site' },
]

export function RecruiterCandidates() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialJobId = searchParams.get('jobId') || 'all'

  // State
  const [candidates, setCandidates] = useState([])
  const [recruiterJobs, setRecruiterJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [selectedJobId, setSelectedJobId] = useState(initialJobId)
  const [stageFilter, setStageFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected candidate for detail pane
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    interviewDate: '05 Nov 2026',
    interviewTime: '10:30 AM',
    interviewMode: 'Google Meet',
    meetingUrl: '',
    instructions: '',
  })
  const [scheduleErrors, setScheduleErrors] = useState({})

  // Reject Modal
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)

  // Resume Viewer Modal
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)

  // New Note State
  const [newNoteText, setNewNoteText] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  // Fetch recruiter's jobs to populate the job filter dropdown
  useEffect(() => {
    let isMounted = true
    const loadJobs = async () => {
      try {
        const data = await recruiterService.getJobs({ limit: 50 })
        if (isMounted) {
          setRecruiterJobs(data.jobs || [])
        }
      } catch (err) {
        console.error('Failed to load recruiter jobs:', err)
      }
    }
    loadJobs()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch candidate applications from backend
  useEffect(() => {
    let isMounted = true

    const fetchCandidates = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await recruiterService.getCandidates({
          jobId: selectedJobId,
          stage: stageFilter,
          search: searchQuery,
        })
        if (!isMounted) return

        setCandidates(data || [])

        // Auto-select candidate from URL param, or maintain selection, or select first
        if (data && data.length > 0) {
          const targetCandidateId = searchParams.get('candidateId')
          if (targetCandidateId) {
            const target = data.find((c) => c.id === targetCandidateId)
            if (target) {
              setSelectedCandidate(target)
              return
            }
          }
          setSelectedCandidate((prev) => {
            if (!prev) return data[0]
            const existing = data.find((c) => c.id === prev.id)
            return existing || data[0]
          })
        } else {
          setSelectedCandidate(null)
        }
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load candidates:', err)
        setError(err.message || 'Unable to retrieve candidates. Please try again.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCandidates()

    return () => {
      isMounted = false
    }
  }, [selectedJobId, stageFilter, searchQuery, searchParams])

  // Sync URL query params when job filter changes
  const handleJobFilterChange = (jobId) => {
    setSelectedJobId(jobId)
    if (jobId && jobId !== 'all') {
      setSearchParams({ jobId })
    } else {
      setSearchParams({})
    }
  }

  // Calculate counts per stage tab
  const stageCounts = useMemo(() => {
    const counts = { all: candidates.length, 'in-review': 0, shortlisted: 0, interview: 0, offer: 0, rejected: 0 }
    candidates.forEach((c) => {
      const s = c.stage?.toLowerCase()
      if (counts[s] !== undefined) {
        counts[s] += 1
      }
    })
    return counts
  }, [candidates])

  // Status badge styling helper
  const getBadgeVariant = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'shortlisted':
        return 'success'
      case 'interview':
        return 'primary'
      case 'offer':
        return 'indigo'
      case 'rejected':
        return 'danger'
      default:
        return 'warning'
    }
  }

  // Quick Action: Shortlist candidate
  const handleShortlist = async (candidate) => {
    try {
      const updated = await recruiterService.updateCandidateStage(
        candidate.id,
        'shortlisted',
        'Candidate shortlisted for high potential and role fit.'
      )
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      if (selectedCandidate?.id === updated.id) {
        setSelectedCandidate(updated)
      }
      showToast(`${candidate.candidateName} moved to Shortlisted!`)
    } catch (err) {
      alert(err.message || 'Failed to shortlist candidate')
    }
  }

  // Quick Action: Open Schedule Interview Modal
  const handleOpenSchedule = (candidate) => {
    setSelectedCandidate(candidate)
    setScheduleForm({
      interviewDate: candidate.interview?.interviewDate || '05 Nov 2026',
      interviewTime: candidate.interview?.interviewTime || '10:30 AM',
      interviewMode: candidate.interview?.interviewMode || 'Google Meet',
      meetingUrl:
        candidate.interview?.meetingUrl ||
        `https://meet.google.com/sb-interview-${candidate.candidateName.toLowerCase().replace(/\s+/g, '-')}`,
      instructions: candidate.interview?.instructions || 'Please be prepared to walk through your design portfolio and past projects.',
    })
    setScheduleErrors({})
    setIsScheduleOpen(true)
  }

  // Submit Schedule Interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!scheduleForm.interviewDate.trim()) errs.interviewDate = 'Interview date is required'
    if (!scheduleForm.interviewTime.trim()) errs.interviewTime = 'Interview time is required'
    if (Object.keys(errs).length > 0) {
      setScheduleErrors(errs)
      return
    }

    try {
      setScheduleSubmitting(true)
      const updated = await recruiterService.scheduleInterview(selectedCandidate.id, scheduleForm)
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setSelectedCandidate(updated)
      setIsScheduleOpen(false)
      showToast(`Interview scheduled with ${updated.candidateName}!`)
    } catch (err) {
      alert(err.message || 'Failed to schedule interview')
    } finally {
      setScheduleSubmitting(false)
    }
  }

  // Quick Action: Open Reject Confirmation
  const handleOpenReject = (candidate) => {
    setSelectedCandidate(candidate)
    setRejectReason('')
    setIsRejectOpen(true)
  }

  // Submit Rejection
  const handleRejectConfirm = async () => {
    try {
      setRejectSubmitting(true)
      const note = rejectReason.trim() || 'Application declined after evaluation.'
      const updated = await recruiterService.updateCandidateStage(selectedCandidate.id, 'rejected', note)
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setSelectedCandidate(updated)
      setIsRejectOpen(false)
      showToast(`${selectedCandidate.candidateName} has been marked as Rejected.`)
    } catch (err) {
      alert(err.message || 'Failed to update candidate status')
    } finally {
      setRejectSubmitting(false)
    }
  }

  // Handle stage dropdown change directly from candidate details pane
  const handleStageSelectChange = async (newStage) => {
    if (!selectedCandidate) return
    try {
      const updated = await recruiterService.updateCandidateStage(selectedCandidate.id, newStage)
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setSelectedCandidate(updated)
      showToast(`Candidate status updated to ${updated.stageLabel}`)
    } catch (err) {
      alert(err.message || 'Failed to update stage')
    }
  }

  // Add Internal Recruiter Note
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNoteText.trim() || !selectedCandidate) return

    try {
      setIsAddingNote(true)
      const result = await recruiterService.addCandidateNote(selectedCandidate.id, newNoteText.trim())
      const updated = result.application || {
        ...selectedCandidate,
        notes: [result.data, ...(selectedCandidate.notes || [])],
      }
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setSelectedCandidate(updated)
      setNewNoteText('')
      showToast('Internal note added to candidate evaluation!')
    } catch (err) {
      alert(err.message || 'Failed to add note')
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Candidate Management & Evaluation"
        subtitle="Review applicants, inspect verified credentials, schedule interviews, and collaborate with internal notes."
        action={
          <div className="flex items-center gap-2">
            <Link to="/recruiter/jobs/create">
              <Button size="sm" leftIcon={Plus}>
                Post New Role
              </Button>
            </Link>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Filter Toolbar: Job Selector + Search */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Job Filter Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Job Filter:</span>
            </label>
            <div className="w-full md:w-72">
              <Select
                value={selectedJobId}
                onChange={(e) => handleJobFilterChange(e.target.value)}
                options={[
                  { value: 'all', label: 'All Active Roles & Listings' },
                  ...recruiterJobs.map((j) => ({
                    value: j.id,
                    label: `${j.title} (${j.applicantsCount || 0} applicants)`,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name, college, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 flex-wrap text-xs">
          {STAGE_TABS.map((tab) => {
            const count = stageCounts[tab.id] ?? 0
            const isSelected = stageFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStageFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Main Split-Screen Master-Detail Layout */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-32" />
              </Card>
            ))}
          </div>
          <div className="lg:col-span-7">
            <Card className="p-8 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </Card>
          </div>
        </div>
      ) : candidates.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            title="No Candidates Found"
            description={
              searchQuery || stageFilter !== 'all' || selectedJobId !== 'all'
                ? 'Try adjusting your filters or search keywords to view matching applications.'
                : 'No candidates have applied to your active job listings yet.'
            }
            actionLabel={
              recruiterJobs.length === 0 && !searchQuery && stageFilter === 'all' && selectedJobId === 'all'
                ? '+ Post a Job'
                : 'Reset All Filters'
            }
            onAction={() => {
              if (recruiterJobs.length === 0 && !searchQuery && stageFilter === 'all' && selectedJobId === 'all') {
                window.location.href = '/recruiter/jobs/create'
              } else {
                setSearchQuery('')
                setStageFilter('all')
                setSelectedJobId('all')
                setSearchParams({})
              }
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Candidates List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500">
                Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
              {candidates.map((candidate) => {
                const isSelected = selectedCandidate?.id === candidate.id
                return (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-400/40'
                        : 'bg-white dark:bg-[#161928] border-slate-200/80 dark:border-[#282D4A] hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                          {candidate.initials}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {candidate.candidateName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
                            {candidate.roleApplied}
                          </p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-800">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        {candidate.matchScore}%
                      </span>
                    </div>

                    {/* Education & Experience info */}
                    <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{candidate.college}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Applied {candidate.appliedDate}</span>
                        <span>·</span>
                        <Badge size="sm" variant={getBadgeVariant(candidate.stage)}>
                          {candidate.stageLabel || candidate.stage}
                        </Badge>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {candidate.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        {isSelected ? 'Viewing candidate profile ▾' : 'Click to inspect'}
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleShortlist(candidate)}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                          title="Shortlist candidate"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSchedule(candidate)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                          title="Schedule interview"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(candidate)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Reject candidate"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Detailed Candidate Profile Pane (7 cols) */}
          <div className="lg:col-span-7">
            {selectedCandidate ? (
              <div className="space-y-6">
                {/* Candidate Overview Card */}
                <Card className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                        {selectedCandidate.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {selectedCandidate.candidateName}
                          </h2>
                          <Badge variant={getBadgeVariant(selectedCandidate.stage)}>
                            {selectedCandidate.stageLabel || selectedCandidate.stage}
                          </Badge>
                          <Badge variant="outline">
                            {selectedCandidate.matchScore}% Match
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                          Applied for{' '}
                          <strong className="text-slate-900 dark:text-white">
                            {selectedCandidate.roleApplied}
                          </strong>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Application received on {selectedCandidate.appliedDate}
                        </p>
                      </div>
                    </div>

                    {/* Primary Stage Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={Calendar}
                        onClick={() => handleOpenSchedule(selectedCandidate)}
                      >
                        {selectedCandidate.stage === 'interview'
                          ? 'Reschedule'
                          : 'Schedule'}
                      </Button>

                      {selectedCandidate.stage !== 'shortlisted' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={ThumbsUp}
                          onClick={() => handleShortlist(selectedCandidate)}
                        >
                          Shortlist
                        </Button>
                      )}

                      {selectedCandidate.stage !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          leftIcon={XCircle}
                          onClick={() => handleOpenReject(selectedCandidate)}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Contact & Location Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{selectedCandidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{selectedCandidate.phone || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{selectedCandidate.location || 'Bengaluru, India'}</span>
                    </div>
                  </div>

                  {/* Manual Stage Selector */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500">
                      Move Application Stage:
                    </span>
                    <div className="w-48">
                      <Select
                        value={selectedCandidate.stage}
                        onChange={(e) => handleStageSelectChange(e.target.value)}
                        options={[
                          { value: 'applied', label: '1. Applied' },
                          { value: 'in-review', label: '2. Under Review' },
                          { value: 'shortlisted', label: '3. Shortlisted' },
                          { value: 'interview', label: '4. Interview Scheduled' },
                          { value: 'offer', label: '5. Offer Extended' },
                          { value: 'rejected', label: '6. Rejected' },
                        ]}
                      />
                    </div>
                  </div>
                </Card>

                {/* Resume Access Section */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Verified Resume & Credentials
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Verified Document
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedCandidate.resumeName || `${selectedCandidate.candidateName}_Resume.pdf`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          PDF document · Uploaded with application
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={Eye}
                        onClick={() => setIsResumeModalOpen(true)}
                      >
                        Inspect
                      </Button>
                      <a
                        href={selectedCandidate.resumeUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex"
                      >
                        <Button size="sm" leftIcon={Download}>
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>

                {/* Candidate Education & Skills */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Skills & Background
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium mb-1">
                        Education & College
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedCandidate.college}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Graduating Year: {selectedCandidate.graduationYear || '2026'}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-1">
                        Experience Level
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedCandidate.experience || 'Entry Level / Fresher'}
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Availability: Immediate
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block text-xs font-medium mb-2">
                      Demonstrated Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills?.map((skill) => (
                        <Badge key={skill} variant="skill">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Interview Information Banner (if scheduled) */}
                {selectedCandidate.interview && (
                  <Card className="p-6 space-y-3 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20 border-indigo-200/80 dark:border-indigo-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Scheduled Interview Round
                        </h3>
                      </div>
                      <Badge variant="primary">
                        {selectedCandidate.interview.interviewMode || 'Google Meet'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {selectedCandidate.interview.interviewDate} at{' '}
                          {selectedCandidate.interview.interviewTime}
                        </span>
                      </div>

                      {selectedCandidate.interview.meetingUrl && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-indigo-500" />
                          <a
                            href={selectedCandidate.interview.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold truncate"
                          >
                            Join Video Call ↗
                          </a>
                        </div>
                      )}
                    </div>

                    {selectedCandidate.interview.instructions && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                        <strong>Instructions:</strong> {selectedCandidate.interview.instructions}
                      </p>
                    )}
                  </Card>
                )}

                {/* Internal Recruiter Notes */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Internal Recruiter Notes ({selectedCandidate.notes?.length || 0})
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Private to your hiring team
                    </span>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <Textarea
                      placeholder="Add an internal evaluation note, feedback, or interview observations..."
                      rows={2}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newNoteText.trim() || isAddingNote}
                        leftIcon={Send}
                      >
                        {isAddingNote ? 'Saving...' : 'Add Note'}
                      </Button>
                    </div>
                  </form>

                  {/* Notes Feed */}
                  {selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {selectedCandidate.notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {note.author}
                            </span>
                            <span>{note.createdAt}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {note.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">
                      No team notes added yet. Use the field above to capture candidate insights.
                    </p>
                  )}
                </Card>

                {/* Application Status History Timeline */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Application Status History
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedCandidate.statusHistory && selectedCandidate.statusHistory.length > 0 ? (
                      selectedCandidate.statusHistory.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 text-xs">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {item.stageLabel || item.stage}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {item.changedAt}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                              Updated by <strong className="text-slate-700 dark:text-slate-300">{item.changedBy}</strong>: {item.note}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">Initial application status logged.</p>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-xs text-slate-400">Select a candidate on the left to inspect their complete profile.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => !scheduleSubmitting && setIsScheduleOpen(false)}
        title={
          selectedCandidate
            ? `Schedule Interview: ${selectedCandidate.candidateName}`
            : 'Schedule Interview'
        }
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set up an interview round. The candidate will receive details, instructions, and video meeting credentials.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Interview Date"
              placeholder="e.g. 05 Nov 2026"
              value={scheduleForm.interviewDate}
              onChange={(e) =>
                setScheduleForm((prev) => ({ ...prev, interviewDate: e.target.value }))
              }
              error={scheduleErrors.interviewDate}
              leftIcon={Calendar}
              required
            />

            <Input
              label="Interview Time"
              placeholder="e.g. 10:30 AM"
              value={scheduleForm.interviewTime}
              onChange={(e) =>
                setScheduleForm((prev) => ({ ...prev, interviewTime: e.target.value }))
              }
              error={scheduleErrors.interviewTime}
              leftIcon={Clock}
              required
            />
          </div>

          <Select
            label="Interview Mode"
            options={INTERVIEW_MODES}
            value={scheduleForm.interviewMode}
            onChange={(e) =>
              setScheduleForm((prev) => ({ ...prev, interviewMode: e.target.value }))
            }
          />

          <Input
            label="Meeting Link URL"
            placeholder="https://meet.google.com/sb-xxx"
            value={scheduleForm.meetingUrl}
            onChange={(e) =>
              setScheduleForm((prev) => ({ ...prev, meetingUrl: e.target.value }))
            }
            leftIcon={Video}
            helperText="Google Meet or Zoom room URL for the interview round."
          />

          <Textarea
            label="Additional Instructions / Agenda"
            placeholder="Introduce the interview format, topics covered, or items candidate should prepare..."
            rows={3}
            value={scheduleForm.instructions}
            onChange={(e) =>
              setScheduleForm((prev) => ({ ...prev, instructions: e.target.value }))
            }
          />

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={scheduleSubmitting}
              onClick={() => setIsScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={scheduleSubmitting} leftIcon={Calendar}>
              {scheduleSubmitting ? 'Scheduling...' : 'Confirm & Schedule Round'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => !rejectSubmitting && setIsRejectOpen(false)}
        title="Reject Candidate Application"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to decline{' '}
            <strong className="text-slate-900 dark:text-white">
              {selectedCandidate?.candidateName}
            </strong>
            ’s application for{' '}
            <strong className="text-slate-900 dark:text-white">
              {selectedCandidate?.roleApplied}
            </strong>
            ?
          </p>

          <Textarea
            label="Internal Rejection Feedback / Reason (Optional)"
            placeholder="e.g. Seeking more experience with design systems, portfolio lacked responsive case studies..."
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={rejectSubmitting}
              onClick={() => setIsRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={rejectSubmitting}
              onClick={handleRejectConfirm}
              leftIcon={XCircle}
            >
              {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resume Viewer Modal */}
      <Modal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        title={`Resume: ${selectedCandidate?.candidateName}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedCandidate?.resumeName}
              </span>
              <Badge variant="success">Verified Resume</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Candidate: {selectedCandidate?.candidateName} · {selectedCandidate?.college}
            </p>
          </div>

          <div className="h-64 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 text-center text-xs space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <FileText className="w-12 h-12 text-indigo-500" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Cloudinary Document Preview
              </p>
              <p className="text-slate-400 text-[11px] mt-1 max-w-sm">
                Full-page PDF viewer is accessible directly via verified download or browser preview tab.
              </p>
            </div>
            <a
              href={selectedCandidate?.resumeUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button size="sm" leftIcon={ExternalLink}>
                Open in Full Preview Tab
              </Button>
            </a>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsResumeModalOpen(false)}>
              Close
            </Button>
            <a href={selectedCandidate?.resumeUrl || '#'} target="_blank" rel="noreferrer">
              <Button leftIcon={Download}>Download PDF</Button>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  )
}
