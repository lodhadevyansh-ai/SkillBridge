import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  GraduationCap,
  Link2,
  Mail,
  Phone,
  Plus,
  UploadCloud,
  Trash2,
  Star,
  Briefcase,
  FolderGit2,
  Globe,
  AlertCircle,
  RotateCcw,
  Camera,
} from 'lucide-react'

function GithubIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}
import {
  Badge,
  Button,
  Card,
  CardHeader,
  PageHeader,
  Modal,
  Input,
  Skeleton,
} from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { profileService } from '../../services/profileService'

export function StudentProfile() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Profile Data State
  const [profile, setProfile] = useState(() => ({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    college: user?.college || '',
    degree: '',
    classOf: '',
    headline: user?.headline || 'SkillBridge Candidate',
    about: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    openToWork: true,
    avatarUrl: null,
    initials: user?.initials || (user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
    profileStrength: 20,
    skills: [],
    education: [],
    experience: [],
    projects: [],
    resumes: [],
  }))

  // Skills input state
  const [newSkill, setNewSkill] = useState('')
  const [isAddingSkill, setIsAddingSkill] = useState(false)

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isEditAboutOpen, setIsEditAboutOpen] = useState(false)
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false)
  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Edit Forms state
  const [profileForm, setProfileForm] = useState({})
  const [aboutForm, setAboutForm] = useState({})
  const [educationForm, setEducationForm] = useState({
    degree: '',
    institution: '',
    startYear: '',
    endYear: '',
    cgpa: '',
    description: '',
  })
  const [experienceForm, setExperienceForm] = useState({
    role: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  })
  const [projectForm, setProjectForm] = useState({
    title: '',
    role: '',
    description: '',
    skills: '',
    githubUrl: '',
    liveUrl: '',
    date: '',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load profile from server
  const reloadProfile = async () => {
    try {
      const data = await profileService.getProfile()
      setProfile(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(err.message || 'Unable to connect to profile service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    profileService
      .getProfile()
      .then((data) => {
        if (!ignore) {
          setProfile(data)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Unable to connect to profile service')
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  // Save profile updates
  const handleUpdateProfile = async (updates) => {
    try {
      setSaving(true)
      const updated = await profileService.updateProfile(updates)
      setProfile(updated)
      showToast('Profile updated successfully.')
      return true
    } catch (err) {
      console.error('Update failed:', err)
      showToast(err.message || 'Failed to update profile.')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Handle skill addition
  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      const updatedSkills = [...profile.skills, newSkill.trim()]
      setNewSkill('')
      setIsAddingSkill(false)
      await handleUpdateProfile({ skills: updatedSkills })
    }
  }

  // Handle skill removal
  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = profile.skills.filter((s) => s !== skillToRemove)
    await handleUpdateProfile({ skills: updatedSkills })
  }

  // Resume Upload Handler (Cloudinary simulation / upload)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5 MB limit. Please upload a smaller PDF or DOCX document.')
      return
    }

    // Validate type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    const validExtensions = ['.pdf', '.docx', '.doc']
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!validTypes.includes(file.type) && !hasValidExt) {
      alert('Invalid file format. Please upload a PDF or DOCX file.')
      return
    }

    try {
      setUploadingResume(true)
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const fileData = reader.result
          await profileService.uploadResume({
            name: file.name,
            fileSize: file.size,
            fileType: file.type || 'application/pdf',
            fileData,
            isDefault: profile.resumes.length === 0,
          })
          showToast(`Resume "${file.name}" uploaded to Cloudinary storage.`)
          await reloadProfile()
        } catch (uploadErr) {
          showToast(uploadErr.message || 'Resume upload failed')
        } finally {
          setUploadingResume(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setUploadingResume(false)
      showToast(err.message || 'Error processing file')
    }
  }

  // Delete Resume
  const handleDeleteResume = async (resumeId, resumeName) => {
    if (!window.confirm(`Are you sure you want to delete "${resumeName}"?`)) return
    try {
      await profileService.deleteResume(resumeId)
      showToast('Resume removed successfully.')
      await reloadProfile()
    } catch (err) {
      showToast(err.message || 'Failed to delete resume')
    }
  }

  // Set Default Resume
  const handleSetDefaultResume = async (resumeId) => {
    try {
      await profileService.setDefaultResume(resumeId)
      showToast('Default resume updated.')
      await reloadProfile()
    } catch (err) {
      showToast(err.message || 'Failed to set default resume')
    }
  }

  // Open Edit Profile Modal
  const openEditProfile = () => {
    setProfileForm({
      fullName: profile.fullName || '',
      headline: profile.headline || '',
      college: profile.college || '',
      degree: profile.degree || '',
      classOf: profile.classOf || '',
      location: profile.location || '',
      openToWork: profile.openToWork ?? true,
    })
    setIsEditProfileOpen(true)
  }

  // Open Edit About Modal
  const openEditAbout = () => {
    setAboutForm({
      about: profile.about || '',
      phone: profile.phone || '',
      portfolioUrl: profile.portfolioUrl || '',
      linkedinUrl: profile.linkedinUrl || '',
      githubUrl: profile.githubUrl || '',
    })
    setIsEditAboutOpen(true)
  }

  // Submit Edit Profile
  const submitEditProfile = async (e) => {
    e.preventDefault()
    const success = await handleUpdateProfile(profileForm)
    if (success) setIsEditProfileOpen(false)
  }

  // Submit Edit About
  const submitEditAbout = async (e) => {
    e.preventDefault()
    const success = await handleUpdateProfile(aboutForm)
    if (success) setIsEditAboutOpen(false)
  }

  // Submit Add Education
  const submitAddEducation = async (e) => {
    e.preventDefault()
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: educationForm.degree,
      institution: educationForm.institution,
      startYear: educationForm.startYear,
      endYear: educationForm.endYear,
      cgpa: educationForm.cgpa,
      description: educationForm.description,
    }
    const updatedEdu = [...(profile.education || []), newEdu]
    const success = await handleUpdateProfile({ education: updatedEdu })
    if (success) {
      setIsAddEducationOpen(false)
      setEducationForm({
        degree: '',
        institution: '',
        startYear: '',
        endYear: '',
        cgpa: '',
        description: '',
      })
    }
  }

  // Submit Add Experience
  const submitAddExperience = async (e) => {
    e.preventDefault()
    const newExp = {
      id: `exp-${Date.now()}`,
      role: experienceForm.role,
      company: experienceForm.company,
      location: experienceForm.location,
      startDate: experienceForm.startDate,
      endDate: experienceForm.isCurrent ? 'Present' : experienceForm.endDate,
      isCurrent: experienceForm.isCurrent,
      description: experienceForm.description,
    }
    const updatedExp = [...(profile.experience || []), newExp]
    const success = await handleUpdateProfile({ experience: updatedExp })
    if (success) {
      setIsAddExperienceOpen(false)
      setExperienceForm({
        role: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
      })
    }
  }

  // Submit Add Project
  const submitAddProject = async (e) => {
    e.preventDefault()
    const skillsArray = projectForm.skills
      ? projectForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const newProj = {
      id: `proj-${Date.now()}`,
      title: projectForm.title,
      role: projectForm.role || 'Contributor',
      description: projectForm.description,
      skills: skillsArray,
      githubUrl: projectForm.githubUrl,
      liveUrl: projectForm.liveUrl,
      date: projectForm.date || 'Recent',
    }
    const updatedProjects = [...(profile.projects || []), newProj]
    const success = await handleUpdateProfile({ projects: updatedProjects })
    if (success) {
      setIsAddProjectOpen(false)
      setProjectForm({
        title: '',
        role: '',
        description: '',
        skills: '',
        githubUrl: '',
        liveUrl: '',
        date: '',
      })
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-medium border border-slate-700 dark:border-slate-200 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Your story, professionally told."
        subtitle="Help the right opportunities find you. Keep your profile current and true to you."
        action={
          <Button
            variant="outline"
            rightIcon={ExternalLink}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview public profile ↗
          </Button>
        }
      />

      {/* Error state */}
      {error && (
        <Card className="p-4 border-red-200 dark:border-red-900/50 bg-red-50/30 text-red-700 dark:text-red-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={reloadProfile} leftIcon={RotateCcw}>
            Retry
          </Button>
        </Card>
      )}

      {/* Profile Header Hero Card */}
      {loading ? (
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-80 h-4" />
              <Skeleton className="w-64 h-3" />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-slate-200/80 dark:border-[#282D4A] shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar circle */}
              <div className="relative group">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-md ring-4 ring-indigo-50 dark:ring-indigo-950/40">
                  {profile.initials || user?.initials || 'AS'}
                </div>
                <button
                  type="button"
                  onClick={openEditProfile}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Update profile details"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {profile.fullName || user?.fullName || user?.name || 'Student'}
                  </h2>
                  {profile.openToWork && <Badge variant="active">Open to work</Badge>}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium leading-snug">
                  {profile.headline}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {profile.location} · {profile.college} · {profile.classOf}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              leftIcon={Edit3}
              onClick={openEditProfile}
              className="shrink-0"
            >
              Edit profile
            </Button>
          </div>
        </Card>
      )}

      {/* 2-Column Profile Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bio, Skills, Education, Experience, Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* About You */}
          <Card className="border-slate-200/80 dark:border-[#282D4A]">
            <CardHeader
              title="About you"
              action={
                <button
                  type="button"
                  onClick={openEditAbout}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Edit →
                </button>
              }
            />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {profile.about}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Email address</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Phone number</span>
                <div className="flex items-center gap-2 mt-1 font-semibold text-slate-800 dark:text-slate-200">
                  <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Portfolio</span>
                <a
                  href={profile.portfolioUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 mt-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.portfolioUrl || 'Add portfolio'}</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">LinkedIn</span>
                <a
                  href={profile.linkedinUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 mt-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.linkedinUrl || 'Add LinkedIn'}</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">GitHub Profile</span>
                <a
                  href={profile.githubUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 mt-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                >
                  <GithubIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.githubUrl || 'Add GitHub'}</span>
                </a>
              </div>
            </div>
          </Card>

          {/* Skills & Interests */}
          <Card className="border-slate-200/80 dark:border-[#282D4A]">
            <CardHeader
              title="Skills & interests"
              subtitle="These skills help us calculate match scores and recommend opportunities that fit you."
              action={
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add skill</span>
                </button>
              }
            />

            {isAddingSkill && (
              <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js, Design Systems, TypeScript"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <Button size="sm" type="submit" disabled={saving}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                >
                  Cancel
                </Button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill) => (
                <Badge
                  key={skill}
                  variant="skill"
                  removable
                  onRemove={() => handleRemoveSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="border-slate-200/80 dark:border-[#282D4A]">
            <CardHeader
              title="Education"
              action={
                <button
                  type="button"
                  onClick={() => setIsAddEducationOpen(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Add education →
                </button>
              }
            />

            <div className="space-y-3">
              {profile.education?.length === 0 ? (
                <p className="text-xs text-slate-400">No education records added yet.</p>
              ) : (
                profile.education?.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {edu.degree}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {edu.institution}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {edu.startYear} – {edu.endYear} · Current CGPA: {edu.cgpa}
                      </p>
                      {edu.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="border-slate-200/80 dark:border-[#282D4A]">
            <CardHeader
              title="Work experience"
              action={
                <button
                  type="button"
                  onClick={() => setIsAddExperienceOpen(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Add experience →
                </button>
              }
            />

            <div className="space-y-3">
              {profile.experience?.length === 0 ? (
                <p className="text-xs text-slate-400">No work experience entries added yet.</p>
              ) : (
                profile.experience?.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {exp.role}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {exp.company} · {exp.location}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {exp.startDate} – {exp.endDate}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Featured Projects */}
          <Card className="border-slate-200/80 dark:border-[#282D4A]">
            <CardHeader
              title="Featured projects"
              subtitle="Showcase your strongest work, portfolio case studies, or GitHub repositories."
              action={
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Add project →
                </button>
              }
            />

            <div className="space-y-3">
              {profile.projects?.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No projects added yet. Adding projects increases your recruiter match rate by 40%.
                </p>
              ) : (
                profile.projects?.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-indigo-500 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {proj.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">{proj.date}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex flex-wrap gap-1.5">
                        {proj.skills?.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>Code</span>
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live preview</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Resume Management & Profile Strength */}
        <div className="space-y-6">
          {/* Resume Upload & Management Card */}
          <Card className="space-y-4 border-slate-200/80 dark:border-[#282D4A]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your resume</h3>
              <span className="text-xs text-slate-400">
                {profile.resumes?.length || 0} uploaded
              </span>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-center space-y-2 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
            >
              <UploadCloud
                className={`w-8 h-8 mx-auto text-indigo-500 ${
                  uploadingResume ? 'animate-bounce' : ''
                }`}
              />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {uploadingResume ? 'Uploading to Cloudinary...' : 'Drop your resume here'}
              </div>
              <p className="text-[11px] text-slate-400">PDF or DOCX · Up to 5 MB</p>
              <Button
                size="sm"
                variant="outline"
                type="button"
                className="mt-1"
                disabled={uploadingResume}
              >
                Browse files
              </Button>
            </div>

            {/* Uploaded Resumes List */}
            <div className="space-y-2.5">
              {profile.resumes?.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    resume.isDefault
                      ? 'border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {resume.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {resume.fileSizeFormatted} · Uploaded {resume.uploadedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Set as default button */}
                      {!resume.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultResume(resume.id)}
                          className="p-1 rounded text-slate-400 hover:text-amber-500 transition-colors"
                          title="Set as default resume"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Download link / direct file URL */}
                      <a
                        href={resume.fileData || resume.url}
                        download={resume.name}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Download / View resume"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteResume(resume.id, resume.name)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {resume.isDefault && (
                    <div className="mt-2">
                      <Badge variant="operational">Default resume · Ready to share</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Profile Strength Checklist */}
          <Card className="space-y-4 border-slate-200/80 dark:border-[#282D4A]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile strength</h3>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {profile.profileStrength || 85}%
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${profile.profileStrength || 85}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Basic information completed</span>
              </div>

              <div
                className={`flex items-center gap-2 font-medium ${
                  profile.resumes?.length > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {profile.resumes?.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                <span>Primary resume uploaded</span>
              </div>

              <div
                className={`flex items-center gap-2 font-medium ${
                  profile.skills?.length >= 3 && profile.education?.length > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {profile.skills?.length >= 3 && profile.education?.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                <span>Skills & education records</span>
              </div>

              <div
                className={`flex items-center gap-2 font-medium ${
                  (profile.projects?.length || 0) >= 2
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {(profile.projects?.length || 0) >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                <span>
                  {(profile.projects?.length || 0) >= 2
                    ? 'Featured projects added'
                    : 'Add one more featured project (to reach 100%)'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Edit Main Profile Details */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile Information"
        subtitle="Update your headline, university, location, and recruitment status."
      >
        <form onSubmit={submitEditProfile} className="space-y-4 p-5 sm:p-6 text-xs">
          <Input
            label="Full Name"
            value={profileForm.fullName || ''}
            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            required
          />

          <Input
            label="Professional Headline"
            value={profileForm.headline || ''}
            onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
            placeholder="e.g. Aspiring Product Designer · Turning curiosity into thoughtful experiences"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="College / University"
              value={profileForm.college || ''}
              onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
              placeholder="e.g. NIFT Bengaluru"
            />
            <Input
              label="Degree / Major"
              value={profileForm.degree || ''}
              onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
              placeholder="e.g. Bachelor of Design"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Class / Graduation Year"
              value={profileForm.classOf || ''}
              onChange={(e) => setProfileForm({ ...profileForm, classOf: e.target.value })}
              placeholder="e.g. Class of 2027"
            />
            <Input
              label="Location"
              value={profileForm.location || ''}
              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
              placeholder="e.g. Bengaluru, India"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="openToWork"
              checked={profileForm.openToWork ?? true}
              onChange={(e) => setProfileForm({ ...profileForm, openToWork: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="openToWork" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              Show "Open to work" badge to recruiters
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit About & Links */}
      <Modal
        isOpen={isEditAboutOpen}
        onClose={() => setIsEditAboutOpen(false)}
        title="Edit About & Contact Links"
        subtitle="Tell recruiters about yourself and where they can find your work."
      >
        <form onSubmit={submitEditAbout} className="space-y-4 p-5 sm:p-6 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              About you (Bio)
            </label>
            <textarea
              rows={4}
              value={aboutForm.about || ''}
              onChange={(e) => setAboutForm({ ...aboutForm, about: e.target.value })}
              placeholder="Describe your design philosophy, passions, and what you're looking for..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <Input
            label="Phone Number"
            value={aboutForm.phone || ''}
            onChange={(e) => setAboutForm({ ...aboutForm, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />

          <Input
            label="Portfolio Website URL"
            value={aboutForm.portfolioUrl || ''}
            onChange={(e) => setAboutForm({ ...aboutForm, portfolioUrl: e.target.value })}
            placeholder="https://yourportfolio.design"
          />

          <Input
            label="LinkedIn Profile URL"
            value={aboutForm.linkedinUrl || ''}
            onChange={(e) => setAboutForm({ ...aboutForm, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />

          <Input
            label="GitHub Profile URL"
            value={aboutForm.githubUrl || ''}
            onChange={(e) => setAboutForm({ ...aboutForm, githubUrl: e.target.value })}
            placeholder="https://github.com/yourhandle"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsEditAboutOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Add Education */}
      <Modal
        isOpen={isAddEducationOpen}
        onClose={() => setIsAddEducationOpen(false)}
        title="Add Education Record"
        subtitle="Add degrees, diplomas, or certifications to your academic history."
      >
        <form onSubmit={submitAddEducation} className="space-y-4 p-5 sm:p-6 text-xs">
          <Input
            label="Degree & Field of Study"
            value={educationForm.degree}
            onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
            placeholder="e.g. Bachelor of Design · Communication Design"
            required
          />

          <Input
            label="Institution / University"
            value={educationForm.institution}
            onChange={(e) => setEducationForm({ ...educationForm, institution: e.target.value })}
            placeholder="e.g. National Institute of Fashion Technology"
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Year"
              value={educationForm.startYear}
              onChange={(e) => setEducationForm({ ...educationForm, startYear: e.target.value })}
              placeholder="2023"
              required
            />
            <Input
              label="End Year"
              value={educationForm.endYear}
              onChange={(e) => setEducationForm({ ...educationForm, endYear: e.target.value })}
              placeholder="2027"
              required
            />
            <Input
              label="CGPA / Grade"
              value={educationForm.cgpa}
              onChange={(e) => setEducationForm({ ...educationForm, cgpa: e.target.value })}
              placeholder="8.6 / 10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Coursework & Highlights (Optional)
            </label>
            <textarea
              rows={2}
              value={educationForm.description}
              onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
              placeholder="Relevant coursework, honors, or leadership activities..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddEducationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              Add Education
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Add Experience */}
      <Modal
        isOpen={isAddExperienceOpen}
        onClose={() => setIsAddExperienceOpen(false)}
        title="Add Work Experience"
        subtitle="Add your internships, freelance projects, or full-time roles."
      >
        <form onSubmit={submitAddExperience} className="space-y-4 p-5 sm:p-6 text-xs">
          <Input
            label="Role Title"
            value={experienceForm.role}
            onChange={(e) => setExperienceForm({ ...experienceForm, role: e.target.value })}
            placeholder="e.g. UI/UX Design Intern"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={experienceForm.company}
              onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
              placeholder="e.g. Studio Mono"
              required
            />
            <Input
              label="Location"
              value={experienceForm.location}
              onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
              placeholder="e.g. Bengaluru · Hybrid"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              value={experienceForm.startDate}
              onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })}
              placeholder="e.g. Jun 2025"
              required
            />
            <Input
              label="End Date"
              value={experienceForm.endDate}
              onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })}
              placeholder="e.g. Aug 2025"
              disabled={experienceForm.isCurrent}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Key Accomplishments
            </label>
            <textarea
              rows={3}
              value={experienceForm.description}
              onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
              placeholder="Describe the projects you delivered, metrics improved, or skills applied..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddExperienceOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              Add Experience
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Add Featured Project */}
      <Modal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        title="Add Featured Project"
        subtitle="Projects demonstrate your practical skills and craft to hiring managers."
      >
        <form onSubmit={submitAddProject} className="space-y-4 p-5 sm:p-6 text-xs">
          <Input
            label="Project Title"
            value={projectForm.title}
            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
            placeholder="e.g. FinTrack - Personal Finance App"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Role"
              value={projectForm.role}
              onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
              placeholder="e.g. Lead UI/UX Designer"
            />
            <Input
              label="Date / Period"
              value={projectForm.date}
              onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
              placeholder="e.g. Sep 2025"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Description
            </label>
            <textarea
              rows={3}
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="What problem did you solve? What was your process and outcome?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <Input
            label="Skills & Tools (Comma-separated)"
            value={projectForm.skills}
            onChange={(e) => setProjectForm({ ...projectForm, skills: e.target.value })}
            placeholder="e.g. Figma, Prototyping, React, Design Systems"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              value={projectForm.githubUrl}
              onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
            <Input
              label="Live Demo / Case Study URL"
              value={projectForm.liveUrl}
              onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddProjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              Add Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: Public Profile Preview */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Public Profile Preview"
        subtitle="This is how verified recruiters and hiring managers view your profile."
        maxWidth="max-w-2xl"
      >
        <div className="p-6 space-y-6 text-xs">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
              {profile.initials || 'AS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {profile.fullName}
                </h3>
                {profile.openToWork && <Badge variant="active">Open to work</Badge>}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{profile.headline}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {profile.location} · {profile.college} · {profile.classOf}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">About</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.about}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Skills & Specializations</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills?.map((s) => (
                <Badge key={s} variant="skill">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Verified Projects</h4>
            <div className="space-y-2">
              {profile.projects?.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white">{p.title}</div>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="primary" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
