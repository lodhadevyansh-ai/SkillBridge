import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  RotateCcw,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  MetricCard,
  PageHeader,
  EmptyState,
  Skeleton,
} from '../../components/ui'
import { profileService } from '../../services/profileService'

export function StudentSavedJobs() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedData, setSavedData] = useState({
    jobs: [],
    stats: { total: 0, newSinceLastVisit: 3, closingThisWeek: 2 },
    counts: { all: 0, internships: 0, jobs: 0 },
  })

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    let ignore = false
    profileService
      .getSavedJobs({
        search: searchQuery,
        type: activeTab,
        sort: sortBy,
      })
      .then((data) => {
        if (!ignore) {
          setSavedData(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Unable to load saved jobs from server.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [searchQuery, activeTab, sortBy])

  const reloadSavedJobs = () => {
    setLoading(true)
    profileService
      .getSavedJobs({ search: searchQuery, type: activeTab, sort: sortBy })
      .then((data) => {
        setSavedData(data)
        setError(null)
      })
      .catch((err) => setError(err.message || 'Unable to load saved jobs from server.'))
      .finally(() => setLoading(false))
  }

  // Handle bookmark toggle / removal
  const handleRemove = async (jobId, jobTitle) => {
    // Optimistic UI update
    setSavedData((prev) => {
      const updatedJobs = prev.jobs.filter((j) => j.id !== jobId)
      return {
        ...prev,
        jobs: updatedJobs,
        counts: {
          ...prev.counts,
          all: Math.max(0, prev.counts.all - 1),
        },
      }
    })

    setToastMessage(`Removed "${jobTitle}" from your shortlist.`)
    setTimeout(() => setToastMessage(null), 4000)

    try {
      await profileService.removeSavedJob(jobId)
    } catch (err) {
      console.error('Failed to persist bookmark removal:', err)
      // Rollback on error
      reloadSavedJobs()
    }
  }

  // Filtered list
  const jobsList = useMemo(() => savedData.jobs || [], [savedData.jobs])

  // Deadline notice job (e.g. Linear)
  const urgentJob = useMemo(() => {
    return (
      jobsList.find((j) => j.isClosingSoon) ||
      jobsList.find((j) => j.id === 'job-1') || {
        id: 'job-1',
        title: 'Product Design Intern',
        company: 'Linear',
        deadline: '02 Nov 2026',
      }
    )
  }, [jobsList])

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-medium border border-slate-700 dark:border-slate-200 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Good things, kept close."
        subtitle="Your shortlist of possibilities. Come back when you're ready to take the next step."
        action={
          <Link to="/student/jobs">
            <Button variant="primary">+ Explore more</Button>
          </Link>
        }
      />

      {/* 3 Metric Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Saved opportunities"
          value={loading ? '–' : savedData.stats.total}
          subtitle="In your shortlist"
          icon={Bookmark}
        />
        <MetricCard
          title="New since your last visit"
          value={loading ? '–' : savedData.stats.newSinceLastVisit}
          subtitle="Added to shortlist"
          icon={Sparkles}
        />
        <MetricCard
          title="Closing this week"
          value={loading ? '–' : savedData.stats.closingThisWeek}
          subtitle="Apply before window closes"
          icon={Clock}
        />
      </div>

      {/* Main Grid: Left 2 Cols (List + Filters), Right 1 Col (Side Callouts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Controls Bar: Tabs + Search + Sort */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] space-y-3 shadow-xs">
            {/* Top row: Tab pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All saved ({savedData.counts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('internships')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'internships'
                      ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Internships ({savedData.counts.internships})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'jobs'
                      ? 'bg-white dark:bg-[#161928] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Jobs ({savedData.counts.jobs})
                </button>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161928] text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="recent">Recently saved</option>
                  <option value="deadline">Deadline approaching</option>
                  <option value="match">Highest match score</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved jobs by title, company, or skills..."
                className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-red-700 dark:text-red-400 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={reloadSavedJobs} leftIcon={RotateCcw}>
                Retry
              </Button>
            </Card>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-11 h-11 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="w-40 h-4" />
                        <Skeleton className="w-56 h-3" />
                      </div>
                    </div>
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="w-20 h-5 rounded-md" />
                    <Skeleton className="w-24 h-5 rounded-md" />
                  </div>
                  <Skeleton className="w-full h-8 rounded-lg" />
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && jobsList.length === 0 && (
            <Card className="p-8 text-center">
              <EmptyState
                icon={Bookmark}
                title="No saved opportunities found"
                description={
                  searchQuery
                    ? `No bookmarks matching "${searchQuery}". Try adjusting your search query.`
                    : 'You haven’t short-listed any roles yet. Explore curated opportunities tailored to your profile.'
                }
                actionLabel="Explore opportunities"
                onAction={() => {
                  window.location.href = '/student/jobs'
                }}
              />
            </Card>
          )}

          {/* Saved Job Cards List */}
          {!loading &&
            jobsList.map((job) => {
              const isClosed = job.isExpired || job.deadlineStatus === 'closed'
              const isClosing = job.isClosingSoon || job.deadlineStatus === 'closing-soon'

              return (
                <Card
                  key={job.id}
                  hoverable
                  className="flex flex-col justify-between transition-all duration-200 border-slate-200/80 dark:border-[#282D4A] p-5"
                >
                  <div>
                    {/* Header: Company, Title, Bookmark Toggle */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                          {job.logo || <Building className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                              {job.title}
                            </h3>
                            {isClosing && (
                              <Badge variant="warning">
                                <Clock className="w-3 h-3 mr-1" /> Closing soon
                              </Badge>
                            )}
                            {isClosed && (
                              <Badge variant="neutral">Applications closed</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {job.company}
                            </span>{' '}
                            · {job.location} · {job.arrangement}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(job.id, job.title)}
                        className="p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:border-red-900 dark:hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Remove from saved shortlist"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Metadata & Skill Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 my-3">
                      <Badge variant={job.type === 'Internship' ? 'internship' : 'active'}>
                        {job.type}
                      </Badge>
                      <Badge variant="entry-level">{job.experience || job.level}</Badge>
                      <Badge variant="match">{job.matchScore || 92}% match</Badge>
                      {job.skills &&
                        job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Card Bottom: Stipend, Deadline & View details */}
                  <div className="flex items-center justify-between pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {job.stipend || 'Competitive'}
                      </span>
                      {job.deadline && (
                        <span className="block text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Deadline: {job.deadline}
                        </span>
                      )}
                    </div>

                    <Link to={`/student/jobs/${job.id}`}>
                      <Button size="sm" variant={isClosed ? 'outline' : 'primary'} rightIcon={ExternalLink}>
                        {isClosed ? 'View archived' : 'View details →'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
        </div>

        {/* Right Sidebar: Strategic Cards & Pro-tips */}
        <div className="space-y-5">
          {/* Don't miss your window card */}
          <Card className="space-y-3.5 border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/10 p-5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Don't miss your window</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>{urgentJob.title}</strong> at <strong>{urgentJob.company}</strong> closes
              applications on <strong>{urgentJob.deadline}</strong>.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Applications are reviewed on a rolling basis. Applying earlier significantly improves
              shortlisting rates.
            </p>
            <Link to={`/student/jobs/${urgentJob.id}`} className="block">
              <Button size="sm" variant="primary" className="w-full justify-center">
                Review & Apply Now →
              </Button>
            </Link>
          </Card>

          {/* Make your shortlist count card */}
          <Card className="space-y-3.5 p-5 border-slate-200 dark:border-[#282D4A]">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Make your shortlist count</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>Tailor your resume headline specifically for the role's core responsibilities.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>Ensure your GitHub or design portfolio link is updated and public.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>Include a short personal note in the optional cover letter when applying.</span>
              </li>
            </ul>
          </Card>

          {/* Quick Profile Booster Link */}
          <Card className="p-4 bg-slate-50 dark:bg-slate-900/60 border-dashed border-slate-200 dark:border-slate-800 text-xs text-center space-y-2">
            <p className="text-slate-500 dark:text-slate-400">
              Keep your profile up to date to get matched with higher precision.
            </p>
            <Link to="/student/profile" className="inline-block">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Update your student profile →
              </span>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
