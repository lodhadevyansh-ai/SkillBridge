import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Clock,
  Calendar,
} from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { MetricCard } from '../../components/ui/MetricCard'

const STATUS_COLORS = {
  'Under Review': '#6366F1',
  'Shortlisted': '#8B5CF6',
  'Interview Scheduled': '#10B981',
  'Selected / Offer': '#059669',
  'Rejected': '#EF4444',
  'Withdrawn': '#64748B',
  'Applied': '#3B82F6',
}

export function StudentAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const res = await analyticsService.getStudentAnalytics()
        if (isMounted && res) {
          setData(res)
        }
      } catch (err) {
        console.error('Failed to load student analytics:', err)
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
    applicationsByStatus = [],
    mostAppliedCategories = [],
    conversionFunnel = [],
  } = data || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Application Analytics
            </h1>
            <Badge variant="indigo" className="gap-1 font-semibold text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              Live DB Records
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time conversion metrics, role distributions, and submission trajectory.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Applications"
          value={summary.totalApplications || 0}
          subtitle="Submitted across all listings"
          icon={Target}
          trend="100% verified"
        />
        <MetricCard
          title="Shortlist Rate"
          value={`${summary.shortlistRate || 0}%`}
          subtitle={`${summary.shortlistedCount || 0} applications shortlisted`}
          icon={TrendingUp}
          trend="Above platform avg"
        />
        <MetricCard
          title="Interview Rate"
          value={`${summary.interviewRate || 0}%`}
          subtitle={`${summary.interviewCount || 0} rounds confirmed`}
          icon={Calendar}
          trend="High conversion"
        />
        <MetricCard
          title="Offer Rate"
          value={`${summary.offerRate || 0}%`}
          subtitle={`${summary.selectedCount || 0} final selections`}
          icon={Award}
          trend="Direct hire"
        />
      </div>

      {/* Charts Section 1: Applications Over Time + Applications by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Over Time (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Applications Over Time"
            subtitle="Monthly submission frequency and interview invitations"
            action={
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Applications
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Interviews
                </span>
              </div>
            }
          />
          <div className="p-4 sm:p-6 pt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentAppGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="studentIntGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
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
                  name="Applications"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#studentAppGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="interviews"
                  name="Interviews"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#studentIntGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Applications by Status (1 Col) */}
        <Card>
          <CardHeader
            title="Applications by Status"
            subtitle="Current distribution across pipeline stages"
          />
          <div className="p-4 sm:p-6 pt-0 flex flex-col items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {applicationsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || STATUS_COLORS[entry.name] || '#6366F1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Status Legend with percentages */}
            <div className="w-full space-y-2 mt-2">
              {applicationsByStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <span>{item.value}</span>
                    <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section 2: Most Applied Categories & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Applied Job Categories */}
        <Card>
          <CardHeader
            title="Most Applied Job Categories"
            subtitle="Volume and concentration by professional engineering domain"
          />
          <div className="p-4 sm:p-6 pt-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mostAppliedCategories}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val} applications`, 'Volume']}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Interview Conversion Funnel */}
        <Card>
          <CardHeader
            title="Interview Conversion Funnel"
            subtitle="Stage progression rate from initial application to final offer"
          />
          <div className="p-4 sm:p-6 space-y-4">
            {summary.totalApplications === 0 && (
              <div className="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-center">
                <p className="text-xs font-medium text-violet-900 dark:text-violet-200">
                  Your application journey starts here. Apply to opportunities to see your application progress and conversion funnel.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {conversionFunnel.map((step, idx) => (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {idx + 1}
                      </span>
                      <span>{step.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white">{step.count} apps</span>
                      <Badge variant="indigo" className="text-[10px] py-0 px-1.5">
                        {step.rate}%
                      </Badge>
                    </div>
                  </div>

                  {/* Progress bar representing funnel drop-off */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${step.count > 0 && step.rate > 0 ? Math.min(100, Math.max(0, step.rate)) : 0}%`,
                        backgroundColor: step.color || '#6366F1',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Avg Recruiter Response Time:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {summary.avgResponseDays !== null && summary.avgResponseDays !== undefined
                  ? `${summary.avgResponseDays} days`
                  : 'Not available yet'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
