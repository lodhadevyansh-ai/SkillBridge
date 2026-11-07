import { useState, useEffect } from 'react'
import { Save, CheckCircle2, Sliders, Shield } from 'lucide-react'
import { Button, Card, Input, PageHeader, Skeleton } from '../../components/ui'
import { DeleteAccountSection } from '../../components/settings/DeleteAccountSection'
import { adminService } from '../../services/adminService'

export function AdminSettings() {
  const [settings, setSettings] = useState({
    mandatoryRecruiterApproval: true,
    autoFlagUnpaidInternships: true,
    minRecommendedStipend: '₹15,000 / month',
    maxApplicationsPerStudent: 15,
    moderationEmailAlerts: true,
    auditLogRetentionDays: 90,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  useEffect(() => {
    let isMounted = true
    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await adminService.getSettings()
        if (isMounted && data) {
          setSettings(data)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadSettings()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const updated = await adminService.updateSettings(settings)
      setSettings(updated)
      showToast('Global platform parameters successfully updated and synchronized across all nodes!')
    } catch (err) {
      alert(err.message || 'Failed to update platform settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-64" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <PageHeader
        title="Global Platform Parameters"
        subtitle="Manage moderation policies, minimum fresher compensation guidelines, and security parameters."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Moderation Policies */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Listing Moderation & Verification Policies
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div className="pr-4">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Mandatory Recruiter Approval
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 block">
                  New company recruiters must be manually verified by staff before their opportunities become discoverable in student search.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.mandatoryRecruiterApproval)}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    mandatoryRecruiterApproval: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div className="pr-4">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Auto-Flag Unpaid Opportunities
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 block">
                  Automatically redirect internship listings with ₹0 or commission-only compensation to the moderation queue.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.autoFlagUnpaidInternships)}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoFlagUnpaidInternships: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div className="pr-4">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Real-time Staff Email Notifications
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 block">
                  Dispatch instant high-priority notifications to moderators when community flags or suspicious accounts are reported.
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.moderationEmailAlerts)}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    moderationEmailAlerts: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </Card>

        {/* Section 2: Platform Numerical Limits */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Platform Limits & Stipend Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Recommended Stipend"
              value={settings.minRecommendedStipend}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, minRecommendedStipend: e.target.value }))
              }
              helperText="Baseline stipend shown in the recruiter role creation form."
            />

            <Input
              label="Max Active Applications per Candidate"
              type="number"
              value={settings.maxApplicationsPerStudent}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  maxApplicationsPerStudent: Number(e.target.value),
                }))
              }
              helperText="Prevents candidate application spamming."
            />
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} leftIcon={Save}>
            {saving ? 'Saving Parameters...' : 'Save Platform Parameters'}
          </Button>
        </div>
      </form>

      {/* Permanent Account Deletion Section */}
      <DeleteAccountSection />
    </div>
  )
}
