import { useState, useEffect } from 'react'
import { Building, Globe, MapPin, Users } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Input, PageHeader, Textarea, Alert, Skeleton } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { recruiterService } from '../../services/recruiterService'

export function RecruiterProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    headquarters: '',
    companySize: '',
    description: '',
    industry: 'Technology',
    leadRecruiter: '',
    workEmail: '',
    isVerified: false,
  })

  useEffect(() => {
    let ignore = false

    recruiterService
      .getProfile()
      .then((data) => {
        if (!ignore && data) {
          setFormData({
            companyName: data.companyName || user?.companyName || '',
            website: data.website || '',
            headquarters: data.headquarters || '',
            companySize: data.companySize || '',
            description: data.description || '',
            industry: data.industry || 'Technology',
            leadRecruiter: data.leadRecruiter || user?.fullName || '',
            workEmail: data.workEmail || user?.email || '',
            isVerified: !!data.isVerified,
          })
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load company profile:', err)
          setError(err.message || 'Unable to load company profile.')
          setFormData((prev) => ({
            ...prev,
            companyName: user?.companyName || '',
            leadRecruiter: user?.fullName || '',
            workEmail: user?.email || '',
          }))
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [user])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const updated = await recruiterService.updateProfile(formData)
      if (updated) {
        setFormData({
          companyName: updated.companyName || formData.companyName,
          website: updated.website || '',
          headquarters: updated.headquarters || '',
          companySize: updated.companySize || '',
          description: updated.description || '',
          industry: updated.industry || 'Technology',
          leadRecruiter: updated.leadRecruiter || formData.leadRecruiter,
          workEmail: updated.workEmail || formData.workEmail,
          isVerified: !!updated.isVerified,
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      console.error('Failed to save company profile:', err)
      setError(err.message || 'Failed to update company profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const companyInitial = formData.companyName.trim()
    ? formData.companyName.trim()[0].toUpperCase()
    : 'C'

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <PageHeader
          title="Company profile & branding"
          subtitle="Manage your company's public workspace, verified status, and team credentials."
        />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Company profile & branding"
        subtitle="Manage your company's public workspace, verified status, and team credentials."
      />

      {saved && (
        <Alert variant="success" title="Company Profile Updated">
          Your organization's profile changes have been successfully saved.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="space-y-4">
          <CardHeader title="Company Overview" />
          <div className="flex items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-2xl text-indigo-600 dark:text-indigo-400 select-none shadow-2xs">
              {companyInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {formData.companyName || 'Company Name'}
                </h3>
                {formData.isVerified ? (
                  <Badge variant="applied" verified>
                    Verified company
                  </Badge>
                ) : (
                  <Badge variant="neutral">
                    Hiring Partner
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.industry || 'Technology'} · {formData.headquarters || 'Location not specified'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g. NVIDIA, Linear, Stripe"
              leftIcon={Building}
              required
            />
            <Input
              label="Website URL"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourcompany.com"
              leftIcon={Globe}
            />
            <Input
              label="Headquarters"
              value={formData.headquarters}
              onChange={(e) => handleChange('headquarters', e.target.value)}
              placeholder="e.g. Bengaluru, India or San Francisco, USA"
              leftIcon={MapPin}
            />
            <Input
              label="Company Size"
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
              placeholder="e.g. 51–200 employees, 1000+ employees"
              leftIcon={Users}
            />
          </div>

          <Textarea
            label="About the Company"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Share what makes your team, engineering culture, and product vision exciting for candidates..."
            rows={4}
          />
        </Card>

        <Card className="space-y-4">
          <CardHeader title="Recruiter Lead Account" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lead Recruiter"
              value={formData.leadRecruiter}
              onChange={(e) => handleChange('leadRecruiter', e.target.value)}
              placeholder="Full name"
            />
            <Input
              label="Recruiter Work Email"
              value={formData.workEmail}
              onChange={(e) => handleChange('workEmail', e.target.value)}
              placeholder="recruiter@company.com"
              type="email"
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              recruiterService.getProfile().then((data) => {
                if (data) {
                  setFormData({
                    companyName: data.companyName || user?.companyName || '',
                    website: data.website || '',
                    headquarters: data.headquarters || '',
                    companySize: data.companySize || '',
                    description: data.description || '',
                    industry: data.industry || 'Technology',
                    leadRecruiter: data.leadRecruiter || user?.fullName || '',
                    workEmail: data.workEmail || user?.email || '',
                    isVerified: !!data.isVerified,
                  })
                }
              })
            }}
            disabled={saving}
          >
            Reset
          </Button>
          <Button variant="primary" type="submit" isLoading={saving}>
            Save Company Details
          </Button>
        </div>
      </form>
    </div>
  )
}
