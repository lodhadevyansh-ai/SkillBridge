import { useState, useEffect } from 'react'
import {
  Search,
  UserCheck,
  UserX,
  CheckCircle2,
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

export function AdminUsers({ defaultRole = 'all' }) {
  const [users, setUsers] = useState([])
  const [counts, setCounts] = useState({ all: 0, students: 0, recruiters: 0, admins: 0, suspended: 0 })
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [roleFilter, setRoleFilter] = useState(defaultRole)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Suspend Modal
  const [userToSuspend, setUserToSuspend] = useState(null)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [isSuspending, setIsSuspending] = useState(false)

  // Load Users from backend
  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getUsers({
          role: roleFilter,
          status: statusFilter,
          search: searchQuery,
          page: currentPage,
          limit: 10,
        })
        if (!isMounted) return
        setUsers(data.users || [])
        setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 })
        if (data.counts) setCounts(data.counts)
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to load users:', err)
        setError(err.message || 'Failed to retrieve platform users.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [roleFilter, statusFilter, searchQuery, currentPage])

  // Handle Suspend submit
  const handleSuspendSubmit = async () => {
    if (!userToSuspend) return
    try {
      setIsSuspending(true)
      const reason = suspensionReason.trim() || 'Violation of platform terms and conditions'
      await adminService.suspendUser(userToSuspend.id, reason)
      showToast(`Account for ${userToSuspend.fullName} has been suspended.`)
      setUserToSuspend(null)
      setSuspensionReason('')

      // Refresh list
      const refreshed = await adminService.getUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        limit: 10,
      })
      setUsers(refreshed.users || [])
      if (refreshed.counts) setCounts(refreshed.counts)
    } catch (err) {
      alert(err.message || 'Failed to suspend account')
    } finally {
      setIsSuspending(false)
    }
  }

  // Handle Reactivate
  const handleActivate = async (user) => {
    try {
      await adminService.activateUser(user.id)
      showToast(`Account for ${user.fullName} has been successfully reactivated!`)

      // Refresh list
      const refreshed = await adminService.getUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchQuery,
        page: currentPage,
        limit: 10,
      })
      setUsers(refreshed.users || [])
      if (refreshed.counts) setCounts(refreshed.counts)
    } catch (err) {
      alert(err.message || 'Failed to reactivate account')
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
        title="User & Account Management"
        subtitle="Inspect registered student accounts, manage verified recruiter organizations, and handle account suspension."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-400 block">Total Users</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
            {counts.all || users.length}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-400 block">Students</span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
            {counts.students || 0}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-400 block">Recruiters</span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
            {counts.recruiters || 0}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-medium text-slate-400 block">Suspended Accounts</span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5 block">
            {counts.suspended || 0}
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, company, or college..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Role Filter & Status Filter */}
          <div className="flex items-center gap-2.5">
            <div className="w-36">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'student', label: 'Students' },
                  { value: 'recruiter', label: 'Recruiters' },
                  { value: 'admin', label: 'Admins' },
                ]}
              />
            </div>

            <div className="w-36">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No Users Match Query"
              description="Try adjusting your role or status filter, or clear your search term."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('')
                setRoleFilter('all')
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
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Role</th>
                  <th className="py-3 px-5">Organization / College</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isSuspended = u.status === 'Suspended'
                  const isAdmin = u.role === 'admin'
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.initials || 'SB'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {u.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge
                          variant={
                            u.role === 'admin'
                              ? 'primary'
                              : u.role === 'recruiter'
                              ? 'indigo'
                              : 'neutral'
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 font-medium">
                        {u.companyName || u.college || 'Individual'}
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge variant={isSuspended ? 'danger' : 'success'}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5 text-right space-x-2">
                        {!isAdmin && (
                          isSuspended ? (
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={UserCheck}
                              onClick={() => handleActivate(u)}
                            >
                              Activate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              leftIcon={UserX}
                              onClick={() => {
                                setUserToSuspend(u)
                                setSuspensionReason('')
                              }}
                            >
                              Suspend
                            </Button>
                          )
                        )}
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
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

      {/* Suspend Confirmation Modal */}
      <Modal
        isOpen={Boolean(userToSuspend)}
        onClose={() => !isSuspending && setUserToSuspend(null)}
        title="Suspend User Account"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to suspend the account for{' '}
            <strong className="text-slate-900 dark:text-white">
              {userToSuspend?.fullName}
            </strong>{' '}
            ({userToSuspend?.email})? This user will immediately lose access to their workspace.
          </p>

          <Textarea
            label="Suspension Reason / Violation Notes"
            placeholder="e.g. Repeated spam listings, fraudulent credentials, harassment..."
            rows={3}
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={isSuspending}
              onClick={() => setUserToSuspend(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isSuspending}
              onClick={handleSuspendSubmit}
              leftIcon={UserX}
            >
              {isSuspending ? 'Suspending...' : 'Confirm Suspension'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
