import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  Send,
  Video,
  Eye,
  AlertCircle,
} from 'lucide-react'
import {
  Badge,
  BannerCard,
  Button,
  Card,
  CardHeader,
  MetricCard,
  Modal,
  PageHeader,
  Skeleton,
  SkeletonCard,
  EmptyState,
} from '../../components/ui'
import { CareerActivityChart } from '../../components/charts/CareerActivityChart'
import { studentService } from '../../services/studentService'
import { useAuth } from '../../hooks/useAuth'

// Fallback seed data if backend is starting up or temporarily offline
const FALLBACK_DASHBOARD = {
  greeting: 'Good morning, Candidate ☼',
  subGreeting: "A little progress every day adds up. Here's where you stand.",
  stats: {
    applicationsSent: {
      value: 0,
      trend: 'Start applying today',
      trendDirection: 'up',
      label: 'Applications sent',
    },
    inReview: {
      value: 0,
      subtitle: 'No pending reviews',
      label: 'In review',
    },
    interviews: {
      value: 0,
      subtitle: 'No upcoming interviews',
      label: 'Interviews',
    },
    savedJobs: {
      value: 0,
      subtitle: 'Save jobs to track them',
      label: 'Saved opportunities',
    },
  },
  profile: {
    profileStrength: 20,
    resumeUploaded: false,
    resumeFileName: null,
    resumeUpdatedAt: null,
    title: "Welcome to your career workspace.",
    description: 'Complete your profile and upload a resume to stand out to verified recruiters.',
  },
  careerActivity: [
    { date: 'Day 1', applications: 0, profileViews: 0 },
    { date: 'Day 5', applications: 0, profileViews: 0 },
    { date: 'Day 10', applications: 0, profileViews: 0 },
  ],
  upcomingInterview: null,
  recommendedJobs: [],
  recentApplications: [],
  learningResource: {
    tag: 'CAREER GUIDE',
    title: 'Stand out in your applications',
    description: 'A practical path from your first application to your offer letter.',
    badges: ['Free guide', '3 min read'],
    actionText: 'Explore opportunities →',
    href: '/student/jobs',
  },
}

export function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [bookmarkingId, setBookmarkingId] = useState(null)

  // Fetch dashboard data from backend API
  const refreshDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const responseData = await studentService.getDashboard()
      setData(responseData)
    } catch (err) {
      console.warn('Backend API connection warning, utilizing local fallback:', err.message)
      setData(FALLBACK_DASHBOARD)
      if (err.response?.status !== 401 && err.code !== 'ERR_NETWORK') {
        setError(err.message || 'Unable to connect with backend service')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    studentService
      .getDashboard()
      .then((res) => {
        if (isMounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Backend API connection warning, utilizing local fallback:', err.message)
          setData(FALLBACK_DASHBOARD)
          if (err.response?.status !== 401 && err.code !== 'ERR_NETWORK') {
            setError(err.message || 'Unable to connect with backend service')
          }
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Handle bookmarking job
  const handleToggleBookmark = async (e, jobId) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarkingId(jobId)
    try {
      await studentService.toggleSaveJob(jobId)
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev
        const updatedJobs = prev.recommendedJobs.map((job) =>
          job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
        )
        const currentSavedCount = prev.stats.savedJobs.value
        const isNowSaved = !prev.recommendedJobs.find((j) => j.id === jobId)?.isSaved
        return {
          ...prev,
          recommendedJobs: updatedJobs,
          stats: {
            ...prev.stats,
            savedJobs: {
              ...prev.stats.savedJobs,
              value: isNowSaved ? currentSavedCount + 1 : Math.max(0, currentSavedCount - 1),
            },
          },
        }
      })
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    } finally {
      setBookmarkingId(null)
    }
  }

  // Loading skeleton screen
  if (loading && !data) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>

        {/* Banner skeleton */}
        <div className="rounded-2xl p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Skeleton className="h-16 w-full" />
        </div>

        {/* 4 Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Chart & Up next skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-80" />
          <div className="rounded-2xl p-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-80" />
        </div>
      </div>
    )
  }

  // Error state screen if completely broken
  if (error && !data) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-[#161928] rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Failed to load dashboard data
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {error}. Please verify that the backend API server is running on port 5000.
        </p>
        <Button onClick={refreshDashboard} leftIcon={RefreshCw} size="sm">
          Retry connection
        </Button>
      </div>
    )
  }

  const currentData = data || FALLBACK_DASHBOARD
  const firstName = user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Student'
  const greetingText = currentData.greeting || `Good morning, ${firstName} ☼`
  const subGreeting = currentData.subGreeting || "A little progress every day adds up. Here's where you stand."

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Personalized Greeting & Primary Action Button */}
      <PageHeader
        title={greetingText}
        subtitle={subGreeting}
        action={
          <Link to="/student/jobs">
            <Button rightIcon={Compass}>
              Explore opportunities ↗
            </Button>
          </Link>
        }
      />

      {/* 2. Profile Completion & Resume Upload Reminder */}
      <BannerCard
        title={currentData.profile.title || "You're closer to your next chapter."}
        description={currentData.profile.description || "Your profile is 85% complete. Add a project to stand out to recruiters."}
        progress={currentData.profile.profileStrength || 85}
        progressLabel="Profile strength"
        actionLabel="Finish your profile"
        onAction={() => navigate('/student/profile')}
      />

      {/* 3. Four Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={currentData.stats.applicationsSent.label || "Applications sent"}
          value={currentData.stats.applicationsSent.value}
          trend={currentData.stats.applicationsSent.trend}
          trendDirection={currentData.stats.applicationsSent.trendDirection || 'up'}
          icon={Send}
        />
        <MetricCard
          title={currentData.stats.inReview.label || "In review"}
          value={currentData.stats.inReview.value}
          subtitle={currentData.stats.inReview.subtitle}
          icon={Eye}
        />
        <MetricCard
          title={currentData.stats.interviews.label || "Interviews"}
          value={currentData.stats.interviews.value}
          subtitle={currentData.stats.interviews.subtitle}
          icon={Video}
        />
        <MetricCard
          title={currentData.stats.savedJobs.label || "Saved opportunities"}
          value={currentData.stats.savedJobs.value}
          subtitle={currentData.stats.savedJobs.subtitle}
          icon={Bookmark}
        />
      </div>

      {/* 4. Career Activity Chart & Up Next Interview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Career Activity Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Your career activity"
            subtitle="Application progression and profile views"
            action={
              <Link
                to="/student/applications"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View report →
              </Link>
            }
          />
          <div className="pt-2">
            <CareerActivityChart data={currentData.careerActivity} />
          </div>
        </Card>

        {/* Up Next Interview Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Up next
              </span>
              <Badge variant="interview">
                Interview scheduled
              </Badge>
            </div>

            {currentData.upcomingInterview ? (
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {currentData.upcomingInterview.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    {currentData.upcomingInterview.roleSubtitle}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {currentData.upcomingInterview.interviewer}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {currentData.upcomingInterview.date} · {currentData.upcomingInterview.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Video className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {currentData.upcomingInterview.platform} · {currentData.upcomingInterview.duration}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6">
                No upcoming interviews scheduled. Keep applying!
              </p>
            )}
          </div>

          <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => setIsInterviewModalOpen(true)}
            >
              View interview details
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. Recommended Jobs ("Picked for your potential") & Keep Growing Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Picked for your potential
          </h3>
          <Link
            to="/student/jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Recommendation Cards (2 Cols) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentData.recommendedJobs?.length > 0 ? (
              currentData.recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/student/jobs/${job.id}`)}
                  className="bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center text-sm border border-slate-200/60 dark:border-slate-700/60">
                          {job.logo || job.company[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {job.company} · {job.location}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, job.id)}
                        disabled={bookmarkingId === job.id}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          job.isSaved
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={job.isSaved ? 'Remove from saved' : 'Save opportunity'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${job.isSaved ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/60 dark:border-indigo-900/40">
                        {job.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {job.level || 'Entry level'}
                      </span>
                      {job.matchScore && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100/80 dark:border-emerald-900/40">
                          {job.matchScore}% match
                        </span>
                      )}
                    </div>

                    {/* Skill tags */}
                    {job.skills && (
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {job.skills.map((skill) => (
                          <span key={skill} className="bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Stipend and Posted Date */}
                  <div className="flex items-center justify-between text-xs pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {job.stipend}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {job.postedDaysAgo}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2">
                <EmptyState
                  title="No job recommendations yet"
                  description="Complete more details in your profile to receive precision-matched opportunities."
                  actionLabel="Explore all opportunities"
                  onAction={() => navigate('/student/jobs')}
                />
              </div>
            )}
          </div>

          {/* Keep Growing Learning Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-indigo-50/40 dark:from-[#1D1936] dark:via-[#191630] dark:to-[#131126] border border-indigo-100 dark:border-indigo-900/40 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{currentData.learningResource?.tag || 'KEEP GROWING'}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {currentData.learningResource?.title || 'Build your design edge'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentData.learningResource?.description ||
                  'A practical path from your first wireframe to a portfolio-ready project.'}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {currentData.learningResource?.badges?.map((badge, idx) => (
                  <span
                    key={badge}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                      idx === 0
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/student/jobs"
              className="mt-6 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{currentData.learningResource?.actionText || 'Explore learning resources →'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Recent Application Activity Table / List */}
      <Card>
        <CardHeader
          title="Recent application activity"
          subtitle="Real-time updates on your active submissions and interview invitations"
          action={
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All applications ({currentData.stats.applicationsSent.value}) →
            </Link>
          }
        />

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {currentData.recentApplications?.length > 0 ? (
            currentData.recentApplications.map((app) => (
              <div
                key={app.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                    {app.logo || app.company[0]}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-white">
                      {app.role}
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {app.company} · Applied on {app.appliedOn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="text-right hidden md:block">
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                      {app.latestUpdate}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      {app.stipend}
                    </p>
                  </div>

                  <Badge
                    variant={
                      app.status === 'interview'
                        ? 'interview'
                        : app.status === 'offer'
                        ? 'verified'
                        : app.status === 'in-review'
                        ? 'in-review'
                        : 'operational'
                    }
                  >
                    {app.statusLabel || app.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8">
              <EmptyState
                title="No recent applications"
                description="Start browsing and applying to discover top internships and entry-level positions."
                actionLabel="Explore opportunities"
                onAction={() => navigate('/student/jobs')}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Interactive Interview Details Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Upcoming Interview Details"
        subtitle="Notion · UX Research Intern"
        size="md"
      >
        {currentData.upcomingInterview && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">
                  {currentData.upcomingInterview.title}
                </span>
                <Badge variant="interview">Scheduled</Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                {currentData.upcomingInterview.interviewer}
              </p>
            </div>

            <div className="space-y-2.5 py-1">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span><strong>Date:</strong> {currentData.upcomingInterview.date}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span><strong>Time:</strong> {currentData.upcomingInterview.time} ({currentData.upcomingInterview.duration})</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span><strong>Format:</strong> {currentData.upcomingInterview.platform}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              💡 <strong>Interview Tip:</strong> Have your portfolio slides ready and prepare to walk through the problem statement, user testing observations, and key design decisions.
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInterviewModalOpen(false)}
              >
                Close
              </Button>
              <a
                href={currentData.upcomingInterview.meetingUrl || 'https://meet.google.com'}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" rightIcon={ExternalLink}>
                  Join Google Meet
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
