import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Briefcase,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import {
  Badge,
  Card,
  PageHeader,
  EmptyState,
  Button,
  SearchInput,
  Skeleton,
} from '../../components/ui'
import { recruiterService } from '../../services/recruiterService'

const STAGE_FILTERS = [
  { id: 'all', label: 'All Applications' },
  { id: 'in-review', label: 'In Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
]

export function RecruiterApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stageFilter, setStageFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const reloadApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await recruiterService.getCandidates({
        stage: stageFilter !== 'all' ? stageFilter : undefined,
        search: searchQuery.trim() || undefined,
      })
      setApplications(data || [])
    } catch (err) {
      console.error('Failed to load applications:', err)
      setError(err.message || 'Unable to retrieve applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [stageFilter, searchQuery])

  useEffect(() => {
    let ignore = false
    recruiterService
      .getCandidates({
        stage: stageFilter !== 'all' ? stageFilter : undefined,
        search: searchQuery.trim() || undefined,
      })
      .then((data) => {
        if (!ignore) {
          setApplications(data || [])
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load applications:', err)
          setError(err.message || 'Unable to retrieve applications. Please try again.')
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [stageFilter, searchQuery])

  const filteredApplications = applications

  return (
    <div className="space-y-6">
      <PageHeader
        title="All received applications"
        subtitle="Manage and evaluate live applicant submissions across your published roles."
        action={
          <Button
            variant="primary"
            leftIcon={Briefcase}
            onClick={() => navigate('/recruiter/jobs/create')}
          >
            Post a new role
          </Button>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STAGE_FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStageFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                stageFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-[#161928] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role..."
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </Card>
      ) : error ? (
        <Card className="p-8 text-center space-y-4 border-red-200 dark:border-red-900/50 bg-red-50/20">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Unable to load applications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={reloadApplications} leftIcon={RotateCcw}>
            Try again
          </Button>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={FileText}
            title={
              searchQuery || stageFilter !== 'all'
                ? 'No matching applications found'
                : 'No candidate applications received yet'
            }
            description={
              searchQuery || stageFilter !== 'all'
                ? 'Try adjusting your search query or filter tab to view applications.'
                : 'When candidates apply to your published job openings, their profiles and resumes will appear here for evaluation.'
            }
            actionLabel={
              searchQuery || stageFilter !== 'all' ? 'Reset Filters' : '+ Post a job'
            }
            onAction={() => {
              if (searchQuery || stageFilter !== 'all') {
                setSearchQuery('')
                setStageFilter('all')
              } else {
                navigate('/recruiter/jobs/create')
              }
            }}
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Candidate</th>
                  <th className="py-3 px-5">Position</th>
                  <th className="py-3 px-5">Submitted</th>
                  <th className="py-3 px-5">Match Rating</th>
                  <th className="py-3 px-5">Stage</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {app.initials || (app.candidateName ? app.candidateName[0] : 'C')}
                        </div>
                        <div>
                          <div>{app.candidateName}</div>
                          {app.college && (
                            <div className="text-[10px] text-slate-400 font-normal">
                              {app.college}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-200 font-medium">
                      {app.roleApplied}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">{app.appliedDate}</td>
                    <td className="py-3.5 px-5">
                      <Badge variant="match">{app.matchScore}%</Badge>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge
                        variant={
                          app.stage === 'interview'
                            ? 'warning'
                            : app.stage === 'shortlisted'
                            ? 'operational'
                            : app.stage === 'offer'
                            ? 'success'
                            : app.stage === 'rejected'
                            ? 'error'
                            : 'neutral'
                        }
                      >
                        {app.stageLabel || app.stage}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/recruiter/candidates?candidateId=${app.id}${app.jobId ? `&jobId=${app.jobId}` : ''}`}
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        <span>Evaluate candidate</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
