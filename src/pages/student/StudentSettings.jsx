import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button, Card, CardHeader, Input, PageHeader, Alert } from '../../components/ui'
import { DeleteAccountSection } from '../../components/settings/DeleteAccountSection'
import { useAuth } from '../../hooks/useAuth'

export function StudentSettings() {
  const { user } = useAuth()
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl pb-8">
      <PageHeader
        title="Account settings"
        subtitle="Manage your personal preferences, security settings, and account details."
      />

      {savedSuccess && (
        <Alert variant="success" title="Preferences Saved">
          Your profile settings and notification preferences have been successfully updated.
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Recruiter Visibility (Students only) */}
        {user?.role === 'student' && (
          <Card>
            <CardHeader
              title="Recruiter Visibility"
              subtitle="Control how recruiters discover your profile on SkillBridge"
            />
            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    "Open to Work" status
                  </span>
                  <span className="text-slate-500">
                    Allows verified companies to reach out to you with internship opportunities.
                  </span>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-indigo-600 w-4 h-4" />
              </label>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        <Card>
          <CardHeader
            title="Security & Password"
            subtitle="Keep your account secure with regular password updates"
          />
          <div className="space-y-4 pt-2">
            <Input
              label="Current Password"
              type="password"
              leftIcon={Lock}
              placeholder="••••••••••••"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                leftIcon={Lock}
                placeholder="At least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                leftIcon={Lock}
                placeholder="Repeat new password"
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader
            title="Notification Preferences"
            subtitle="Choose what notifications you receive via email"
          />
          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Interview schedule alerts & reminders</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Application status updates from recruiters</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Weekly digest of new matching opportunities</span>
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>

      {/* Permanent Account Deletion Section */}
      <DeleteAccountSection />
    </div>
  )
}
