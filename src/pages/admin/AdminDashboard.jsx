import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Download,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  MetricCard,
  PageHeader,
  Skeleton,
} from '../../components/ui'
import { adminService } from '../../services/adminService'

// Custom tooltip for user growth chart
function GrowthTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#11131F]/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[140px]">
        <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1">{label}</div>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-slate-300">{item.name}</span>
            </div>
            <span className="font-bold text-white text-xs">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getDashboard()
      setDashboardData(data)
    } catch (err) {
      console.error('Failed to load admin dashboard:', err)
      setError(err.message || 'Unable to connect to administration service.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchDash = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getDashboard()
        if (isMounted) setDashboardData(data)
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load admin dashboard:', err)
          setError(err.message || 'Unable to connect to administration service.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDash()

    return () => {
      isMounted = false
    }
  }, [])

  const handleApprove = async (jobId, title) => {
    try {
      await adminService.approveJob(jobId)
      showToast(`Listing '${title}' approved and published!`)
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to approve listing')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const charts = dashboardData?.charts || {}
  const moderationQueue = dashboardData?.moderationQueue || []
  const recentActivity = dashboardData?.recentActivity || []

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Platform Operations & Health"
        subtitle="Real-time administration, user growth monitoring, listing moderation, and system safety."
        action={
          <div className="flex items-center gap-3">
            <Badge variant="operational">All systems operational</Badge>
            <Link to="/admin/reports">
              <Button variant="outline" leftIcon={Download}>
                Analytics Report
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

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total registered users"
          value={stats.totalUsers?.displayValue || '25,482'}
          trend="↑ 12.4% this month"
          icon={Users}
        />
        <MetricCard
          title="Active job listings"
          value={stats.activeJobs?.displayValue || '1,284'}
          subtitle={`${stats.totalJobs?.displayValue || '1,420'} total opportunities`}
          icon={Briefcase}
        />
        <MetricCard
          title="Applications submitted"
          value={stats.totalApplications?.displayValue || '18,642'}
          trend="↑ 21.8% this month"
          icon={Send}
        />
        <MetricCard
          title="Pending moderation"
          value={stats.pendingReview?.displayValue || '4'}
          subtitle="Listings & community flags"
          icon={ShieldAlert}
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Breakdown Strip: Students, Recruiters, Verification */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Students & Freshers</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {stats.totalStudents?.displayValue || '24,100'}
              </span>
            </div>
          </div>
          <Link to="/admin/users?role=student">
            <Button size="sm" variant="ghost">View →</Button>
          </Link>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Hiring Recruiters</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {stats.totalRecruiters?.displayValue || '1,382'}
              </span>
            </div>
          </div>
          <Link to="/admin/users?role=recruiter">
            <Button size="sm" variant="ghost">View →</Button>
          </Link>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Trust & Moderation</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                100% Verified
              </span>
            </div>
          </div>
          <Link to="/admin/jobs">
            <Button size="sm" variant="ghost">Queue →</Button>
          </Link>
        </Card>
      </div>

      {/* Charts Section: User Growth & Application Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Growth Chart (7 cols) */}
        <Card className="lg:col-span-7 p-6">
          <CardHeader
            title="User Base Growth"
            subtitle="Registered Students vs Recruiter Organizations (Last 6 Months)"
            action={
              <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Manage users →
              </Link>
            }
          />

          <div className="flex items-center gap-4 text-xs mb-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Students & Freshers
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Recruiters
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.userGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<GrowthTooltip />} />
                <Bar dataKey="students" name="Students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recruiters" name="Recruiters" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Application & Interview Volume (5 cols) */}
        <Card className="lg:col-span-5 p-6">
          <CardHeader
            title="Application & Interview Trends"
            subtitle="Applications Submitted vs Interview Rounds"
            action={
              <Link to="/admin/reports" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Full analytics →
              </Link>
            }
          />

          <div className="flex items-center gap-4 text-xs mb-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Applications
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Interviews
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.applicationTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<GrowthTooltip />} />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#10b981" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} />
                <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#6366f1" fillOpacity={1} fill="url(#colorInt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Moderation Queue & Recent Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Listing Moderation Queue (7 cols) */}
        <Card className="lg:col-span-7 p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Listing Moderation Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                New listings and community flags awaiting staff review
              </p>
            </div>
            <Link
              to="/admin/jobs"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Opportunity</th>
                  <th className="py-3 px-5">Company</th>
                  <th className="py-3 px-5">Stipend</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {moderationQueue.slice(0, 4).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                      {row.title}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {row.company}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 font-medium">
                      {row.stipend}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={row.status?.toLowerCase().includes('flag') ? 'danger' : 'warning'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(row.id, row.title)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/admin/jobs')}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Platform Audit Trail (5 cols) */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Platform Activity
              </h3>
            </div>
            <Link to="/admin/reports" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Full audit log
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>By {log.adminName}</span>
                  <span className="uppercase text-[10px] tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                    {log.targetType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
