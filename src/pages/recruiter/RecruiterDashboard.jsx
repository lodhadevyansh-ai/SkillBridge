import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Plus,
  RotateCcw,
  Sparkles,
  Users,
  Video,
  Clock,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  MetricCard,
  PageHeader,
  Skeleton,
  EmptyState,
} from '../../components/ui'
import { ApplicationTrendsChart } from '../../components/charts/ApplicationTrendsChart'
import { recruiterService } from '../../services/recruiterService'

export function RecruiterDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

  const reloadDashboard = () => {
    setLoading(true)
    recruiterService
      .getDashboard()
      .then((data) => {
        setDashboardData(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load recruiter dashboard:', err)
        setError(err.message || 'Unable to connect to recruiter services.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false
    recruiterService
      .getDashboard()
      .then((data) => {
        if (!ignore) {
          setDashboardData(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load recruiter dashboard:', err)
          setError(err.message || 'Unable to connect to recruiter services.')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <PageHeader
          title="Great teams start with potential."
          subtitle="Loading your live hiring workspace..."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-8" />
              <Skeleton className="w-32 h-3" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-full h-56 rounded-xl" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-full h-44 rounded-xl" />
          </Card>
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Hiring Workspace"
          subtitle="Manage your candidates, open roles, and interview schedules."
        />
        <Card className="p-6 border-red-200 dark:border-red-900/50 bg-red-50/20 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Unable to load recruitment data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={reloadDashboard} leftIcon={RotateCcw}>
            Try again
          </Button>
        </Card>
      </div>
    )
  }

  const {
    recruiter,
    greeting,
    subGreeting,
    stats,
    applicationTrends,
    candidatePipeline,
    openRoles = [],
    recentApplications = [],
    todaysInterviews = [],
    quickInsights,
  } = dashboardData

  const totalPipeline = Number(candidatePipeline?.applied) || 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title={greeting || 'Great teams start with potential.'}
        subtitle={
          subGreeting ||
          `Welcome back, ${recruiter.firstName}. Here’s your hiring snapshot at ${recruiter.companyName}.`
        }
        action={
          <Link to="/recruiter/jobs/create">
            <Button variant="primary" leftIcon={Plus}>
              Post a new role
            </Button>
          </Link>
        }
      />

      {/* 2. Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={stats.openRoles.label}
          value={stats.openRoles.value}
          subtitle={stats.openRoles.subtitle}
          icon={Briefcase}
        />
        <MetricCard
          title={stats.totalApplicants.label}
          value={stats.totalApplicants.value}
          trend={stats.totalApplicants.trend}
          icon={Users}
        />
        <MetricCard
          title={stats.shortlisted.label}
          value={stats.shortlisted.value}
          subtitle={stats.shortlisted.subtitle}
          icon={CheckCircle2}
        />
        <MetricCard
          title={stats.interviewsThisWeek.label}
          value={stats.interviewsThisWeek.value}
          subtitle={stats.interviewsThisWeek.subtitle}
          icon={Calendar}
        />
      </div>

      {/* 3. Trends & Candidate Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Application Trends (Figma Screenshot 001620) */}
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-[#282D4A] p-5 sm:p-6">
          <CardHeader
            title="Application trends"
            subtitle="Comparing candidate volume against previous month"
          />
          <ApplicationTrendsChart
            data={applicationTrends?.data}
            month={applicationTrends?.month}
            comparisonText={applicationTrends?.comparisonText}
          />
        </Card>

        {/* Right: Candidate Pipeline Funnel (Figma Screenshot 001620) */}
        <Card className="border-slate-200/80 dark:border-[#282D4A] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Candidate pipeline
              </h3>
              <Link
                to="/recruiter/candidates"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4 text-xs">
              {/* Applied */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Applied</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {candidatePipeline?.applied || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: totalPipeline > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>

              {/* In review */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>In review</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {candidatePipeline?.inReview || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{
                      width: totalPipeline > 0 && (candidatePipeline?.inReview || 0) > 0
                        ? `${Math.min(100, Math.max(0, ((candidatePipeline.inReview || 0) / totalPipeline) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Shortlisted */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Shortlisted</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {candidatePipeline?.shortlisted || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{
                      width: totalPipeline > 0 && (candidatePipeline?.shortlisted || 0) > 0
                        ? `${Math.min(100, Math.max(0, ((candidatePipeline.shortlisted || 0) / totalPipeline) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Interview */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Interview</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {candidatePipeline?.interview || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{
                      width: totalPipeline > 0 && (candidatePipeline?.interview || 0) > 0
                        ? `${Math.min(100, Math.max(0, ((candidatePipeline.interview || 0) / totalPipeline) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Offer */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Offer</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {candidatePipeline?.offer || 0}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: totalPipeline > 0 && (candidatePipeline?.offer || 0) > 0
                        ? `${Math.min(100, Math.max(0, ((candidatePipeline.offer || 0) / totalPipeline) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            {totalPipeline > 0
              ? 'Active pipeline progression across your open listings.'
              : 'Pipeline metrics will calculate as candidates progress through hiring stages.'}
          </div>
        </Card>
      </div>

      {/* 4. Your Open Roles Table (Figma Screenshot 001629) */}
      <Card className="border-slate-200/80 dark:border-[#282D4A] p-5 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your open roles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active positions currently open for candidates
            </p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>Manage all {openRoles.length} roles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {openRoles.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No open roles posted yet"
            description="Start attracting top candidates by posting your first role."
            actionLabel="+ Post a job"
            onAction={() => navigate('/recruiter/jobs/create')}
          />
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3 px-5 sm:px-6">Role</th>
                  <th className="py-3 px-4 text-center">Applicants</th>
                  <th className="py-3 px-4 text-center">Shortlisted</th>
                  <th className="py-3 px-4">Closes on</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {openRoles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-5 sm:px-6">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {role.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {role.type} · {role.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {role.applicantsCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {role.shortlistedCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{role.closesOn || role.deadline}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="active">{role.status || 'Active'}</Badge>
                    </td>
                    <td className="py-3.5 px-5 sm:px-6 text-right">
                      <Link
                        to={`/recruiter/jobs/${role.id}`}
                        className="p-1.5 inline-flex items-center rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View job details & candidates"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. Recent Candidate Applications */}
      <Card className="border-slate-200/80 dark:border-[#282D4A] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent applications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest candidate submissions across your open roles
            </p>
          </div>
          <Link
            to="/recruiter/candidates"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>Review all candidates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentApplications.length === 0 ? (
            <p className="text-xs text-slate-400">No candidate applications received yet.</p>
          ) : (
            recentApplications.map((cand) => (
              <div
                key={cand.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {cand.initials || cand.candidateName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {cand.candidateName}
                      </span>
                      <Badge variant="match">{cand.matchScore}% match</Badge>
                      <Badge
                        variant={
                          cand.stage === 'interview'
                            ? 'warning'
                            : cand.stage === 'shortlisted'
                            ? 'operational'
                            : 'neutral'
                        }
                      >
                        {cand.stageLabel || cand.stage}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Applied for <strong className="text-slate-700 dark:text-slate-300">{cand.roleApplied}</strong> · {cand.college}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-400 hidden md:inline">
                    {cand.appliedDate}
                  </span>
                  <Link to="/recruiter/candidates">
                    <Button size="sm" variant="outline" rightIcon={ExternalLink}>
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 6. Bottom Row: Today's Interviews & Callout Card (Figma Screenshot 001635) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's interviews */}
        <Card className="border-slate-200/80 dark:border-[#282D4A] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's interviews
            </h3>
            <Link
              to="/recruiter/candidates"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>View schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {todaysInterviews.length === 0 ? (
              <p className="text-xs text-slate-400">No interviews scheduled.</p>
            ) : (
              todaysInterviews.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      {item.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {item.candidateName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.roleApplied} · <strong>{item.interviewTime}</strong>
                      </p>
                    </div>
                  </div>

                  <a
                    href={item.meetingUrl || 'https://meet.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-transparent hover:border-indigo-200 transition-colors"
                    title="Join video interview"
                  >
                    <Video className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Pro-active Callout Card */}
        <Card className="border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/20 dark:from-[#211E48]/30 dark:to-[#171533]/20 p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>{quickInsights?.title || 'Your next great hire is waiting.'}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {quickInsights?.description ||
                '14 new candidates match your requirements. A timely response makes a great first impression.'}
            </p>
          </div>

          <div className="pt-2">
            <Link to={quickInsights?.actionHref || '/recruiter/candidates'}>
              <Button size="sm" variant="primary" className="justify-center">
                {quickInsights?.actionLabel || 'Review candidates'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
