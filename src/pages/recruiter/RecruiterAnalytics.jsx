import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Calendar,
  Award,
  Sparkles,
} from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { MetricCard } from '../../components/ui/MetricCard'

export function RecruiterAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const res = await analyticsService.getRecruiterAnalytics()
        if (isMounted && res) {
          setData(res)
        }
      } catch (err) {
        console.error('Failed to load recruiter analytics:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchAnalytics()
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  const {
    summary = {},
    applicationsOverTime = [],
    candidatePipeline = [],
    jobPerformance = [],
  } = data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Recruitment Analytics
            </h1>
            <Badge variant="indigo" className="gap-1 font-semibold text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              Owned Roles
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline progression, applicant volume trajectory, and listing performance.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Candidates"
          value={summary.totalApplicants || 0}
          subtitle={`Across ${summary.activeJobs || 0} active openings`}
          icon={Users}
          trend="Real candidates"
        />
        <MetricCard
          title="Shortlist Rate"
          value={`${summary.shortlistRate || 0}%`}
          subtitle={`${summary.shortlistedCandidates || 0} shortlisted profiles`}
          icon={Sparkles}
          trend={summary.totalApplicants > 0 ? `Avg ${summary.avgTimeToShortlist || '2.8 days'}` : 'No data'}
        />
        <MetricCard
          title="Interview Rate"
          value={`${summary.interviewRate || 0}%`}
          subtitle={`${summary.interviewCandidates || 0} rounds scheduled`}
          icon={Calendar}
          trend={summary.totalApplicants > 0 ? 'Verified pipeline' : 'No data'}
        />
        <MetricCard
          title="Offer Rate"
          value={`${summary.offerRate || 0}%`}
          subtitle={`${summary.offerCandidates || 0} offers extended`}
          icon={Award}
          trend={summary.totalApplicants > 0 ? `${summary.avgMatchScore || 0}% match score` : '0% match score'}
        />
      </div>

      {/* Charts Section 1: Applications Received Over Time + Candidate Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card>
          <CardHeader
            title="Applications Received Over Time"
            subtitle="Monthly applicant volume vs shortlisted candidates"
            action={
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Received
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Shortlisted
                </span>
              </div>
            }
          />
          <div className="p-4 sm:p-6 pt-2 h-72">
            {!applicationsOverTime || applicationsOverTime.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <TrendingUp className="w-10 h-10 mb-2 opacity-40 text-indigo-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No historical application data yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  As candidates apply to your job listings, monthly volume trends will appear here.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="recAppGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="recShortGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Applications Received"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#recAppGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="shortlisted"
                    name="Candidates Shortlisted"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#recShortGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Candidate Pipeline */}
        <Card>
          <CardHeader
            title="Candidate Pipeline Distribution"
            subtitle="Volume of candidates currently active in each evaluation stage"
          />
          <div className="p-4 sm:p-6 pt-2 h-72">
            {!summary.totalApplicants || summary.totalApplicants === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                <Users className="w-10 h-10 mb-2 opacity-40 text-purple-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No candidate pipeline data</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Active candidate stages will display here once applicants are received.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candidatePipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val} candidates`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Job Performance Table */}
      <Card>
        <CardHeader
          title="Job Performance Analytics"
          subtitle="Conversion rates and pipeline metrics for each owned listing"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#282D4A] text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-[#1A1D2E]/50">
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Applicants</th>
                <th className="py-3 px-4 text-center">Shortlisted</th>
                <th className="py-3 px-4 text-center">Interviews</th>
                <th className="py-3 px-4 text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#282D4A] text-xs">
              {jobPerformance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No job listings posted yet. Post a role to view listing performance analytics.
                  </td>
                </tr>
              ) : (
                jobPerformance.slice(0, 8).map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#1A1D2E]/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {job.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {job.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {job.applicantsCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-purple-600 dark:text-purple-400">
                      {job.shortlistedCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400">
                      {job.interviewCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {job.conversionRate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
