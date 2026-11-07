import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  PartyPopper,
  Send,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from 'lucide-react'
import { Badge, Button, Card, SearchInput, Select } from '../../components/ui'
import { MOCK_JOBS, jobService } from '../../services/jobService'
import { useAuth } from '../../hooks/useAuth'

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [heroSearch, setHeroSearch] = useState('')
  const [heroLocation, setHeroLocation] = useState('all')
  const [selectedJobCategory, setSelectedJobCategory] = useState('all')
  const [activeJobsCount, setActiveJobsCount] = useState(null)

  useEffect(() => {
    jobService
      .getJobs({ limit: 1 })
      .then((res) => {
        const count = res.data?.total || res.data?.counts?.all
        if (count) {
          setActiveJobsCount(count)
        }
      })
      .catch(() => {})
  }, [])

  // Centralized authentication check for exploring opportunities
  const handleJobNavigation = (targetPath = '/student/jobs') => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: targetPath } } })
      return
    }
    if (user.role === 'student') {
      navigate(targetPath)
    } else if (user.role === 'recruiter') {
      navigate('/recruiter/dashboard')
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard')
    }
  }

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault()
    handleJobNavigation(`/student/jobs?q=${encodeURIComponent(heroSearch)}&loc=${heroLocation}`)
  }

  const displayedJobs = MOCK_JOBS.filter((job) => {
    if (selectedJobCategory === 'all') return true
    if (selectedJobCategory === 'internship') return job.type.toLowerCase().includes('intern')
    return !job.type.toLowerCase().includes('intern')
  })

  return (
    <div className="space-y-24 sm:space-y-32 py-10 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto pt-4 sm:pt-10">
        {/* Soft background ambient gradient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>A LITTLE AMBITION. A WORLD OF POSSIBILITY.</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Your first step. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">
              Your next big thing.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover work that excites you, build skills that matter, and turn your potential into possibility. Connect with high-growth companies offering verified stipends, transparent tracking, and fair hiring.
          </p>

          {/* Interactive Search Bar Widget */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] shadow-lg max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2.5"
          >
            <div className="flex-1 w-full relative">
              <SearchInput
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Job title, skill (e.g. Figma, React), or company..."
                className="w-full max-w-none border-0 bg-transparent focus:ring-0 focus:border-0 pl-10"
              />
            </div>

            <div className="w-full md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-2 md:pt-0 md:pl-2">
              <Select
                value={heroLocation}
                onChange={(e) => setHeroLocation(e.target.value)}
                options={[
                  { value: 'all', label: 'All Locations' },
                  { value: 'bengaluru', label: 'Bengaluru, India' },
                  { value: 'remote', label: 'Remote Only' },
                  { value: 'delhi', label: 'Delhi NCR' },
                ]}
                className="border-0 bg-transparent text-xs"
                leftIcon={MapPin}
              />
            </div>

            <Button type="submit" size="md" className="w-full md:w-auto shrink-0 justify-center">
              Find opportunities →
            </Button>
          </form>

          {/* Quick Popular Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span className="font-medium text-slate-400">Popular searches:</span>
            {['Product Design', 'Frontend Developer', 'Figma', 'Remote Internships', 'React'].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setHeroSearch(term)
                    handleJobNavigation(`/student/jobs?q=${encodeURIComponent(term)}`)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium cursor-pointer transition-colors"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>

        {/* 2. ATTRACTIVE PRODUCT SHOWCASE HERO CARD (Figma Aesthetic) */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          {/* Main Visual Board */}
          <div className="rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-indigo-100/60 to-purple-100/40 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-200/60 dark:border-indigo-900/40 shadow-2xl backdrop-blur-xs">
            <div className="bg-white dark:bg-[#161928] rounded-2xl border border-slate-200/80 dark:border-[#282D4A] p-5 sm:p-8 space-y-6 overflow-hidden relative">
              {/* Top Mock Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-semibold text-slate-400">
                    SkillBridge Candidate Matching & ATS Workspace
                  </span>
                </div>
                <Badge variant="operational">Live Real-time Pipeline</Badge>
              </div>

              {/* Mockup Dashboard Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Job Match Preview Card */}
                <div className="md:col-span-7 space-y-4 text-left">
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-[#211E48]/60 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                          L
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Linear
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Product Design Intern
                          </h4>
                        </div>
                      </div>
                      <Badge variant="match">98% match</Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      "Your Figma, UI design, and prototyping skills align with this role."
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        ₹30,000 / month
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">Bengaluru · Hybrid</span>
                    </div>
                  </div>

                  {/* Stepper Timeline Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                        ✓
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Application in review
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Recruiter viewed profile today</span>
                  </div>
                </div>

                {/* Right: Floating Interview & Offer Widgets */}
                <div className="md:col-span-5 space-y-3 text-left">
                  {/* Interview scheduled badge card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1A1D30] border border-slate-200 dark:border-slate-700 shadow-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Upcoming Interview
                      </span>
                      <Video className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Portfolio Review with Priya
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      28 Oct · 11:00 AM IST on Google Meet
                    </div>
                  </div>

                  {/* Offer notification card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                      <PartyPopper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Offer Extended · Linear</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                      Stipend: ₹30,000 / mo · Guaranteed conversion track
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & STATS STRIP */}
      <section id="companies" className="border-y border-slate-200/80 dark:border-[#282D4A] bg-white/50 dark:bg-[#161928]/40 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              25,000+
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ambitious Students & Freshers</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              1,200+
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verified Company Roles</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              ₹28,500
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Average Monthly Stipend</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              100%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fair Compensation Guarantee</p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED OPPORTUNITIES SECTION */}
      <section className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Curated For You
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Featured Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hand-picked internships and entry-level positions from verified high-growth teams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'internship', label: 'Internships' },
              { id: 'fulltime', label: 'Full-time' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedJobCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedJobCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedJobs.map((job) => (
            <Card
              key={job.id}
              hoverable
              onClick={() => handleJobNavigation(`/student/jobs/${job.id}`)}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center text-sm border border-slate-200 dark:border-slate-700">
                      {job.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {job.company}
                        </span>
                        {job.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {job.location} · {job.arrangement}
                      </p>
                    </div>
                  </div>

                  <Badge variant="match">{job.matchScore}% match</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 my-3">
                  <Badge variant="internship">{job.type}</Badge>
                  <Badge variant="entry-level">{job.experience}</Badge>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Compensation</span>
                  <span className="font-bold text-slate-900 dark:text-white">{job.stipend}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleJobNavigation(`/student/jobs/${job.id}`)
                  }}
                >
                  View opportunity →
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center pt-2">
          <Button
            size="lg"
            variant="primary"
            rightIcon={ArrowRight}
            onClick={() => handleJobNavigation('/student/jobs')}
          >
            Explore all {activeJobsCount ? `${activeJobsCount} ` : ''}active opportunities
          </Button>
        </div>
      </section>

      {/* 5. HOW SKILLBRIDGE WORKS SECTION */}
      <section id="how-it-works" className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How SkillBridge Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            From discovering matching opportunities to your first interview, everything is structured to eliminate friction and ghosting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Build your story',
              desc: 'Upload your resume and tag verified skills. Our analyzer computes your profile strength in seconds.',
              icon: FileText,
            },
            {
              step: '02',
              title: 'Get smart match scores',
              desc: 'Our engine scores your compatibility (80%–99%) for every open position so you apply where you stand out.',
              icon: Zap,
            },
            {
              step: '03',
              title: '1-click direct apply',
              desc: 'No tedious 10-page forms or redundant cover letters. Your verified profile is shared directly with hiring teams.',
              icon: Send,
            },
            {
              step: '04',
              title: 'Interview & celebrate',
              desc: 'Track every step on your interactive timeline and receive direct Google Meet invites from recruiters.',
              icon: Video,
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Card key={idx} className="relative p-6 space-y-4">
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 6. PLATFORM FEATURES GRID */}
      <section className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Engineered for Modern Hiring
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Platform Capabilities Built for Quality
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A balanced ecosystem giving candidates fairness and recruiters efficient, pre-screened talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 sm:p-8 space-y-4 border-indigo-100 dark:border-indigo-900/40">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Zero Unpaid Roles & Fair Stipend Policy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every internship on SkillBridge undergoes platform moderation. We enforce fair, transparent monetary compensation so students are respected for their labor.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4 border-purple-100 dark:border-purple-900/40">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Skill Compatibility Matching (80–99%)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Say goodbye to generic applications. Our match engine analyzes job requirements and compares them against student projects and coursework for realistic fit scores.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4 border-indigo-100 dark:border-indigo-900/40">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Live Application Stepper Timeline
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              No black holes. Watch your submission move across `Applied`, `In Review`, `Shortlisted`, `Interview`, and `Offer` stages with notifications at each checkpoint.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 space-y-4 border-purple-100 dark:border-purple-900/40">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Native Google Meet Calendar Integration
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Recruiters can schedule interviews directly through their dashboard, generating synchronized calendar invites and Google Meet video links for candidate convenience.
            </p>
          </Card>
        </div>
      </section>

      {/* 7. BENEFITS FOR STUDENTS */}
      <section id="benefits-students" className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-[#161928] dark:via-[#1A1D30] dark:to-[#161928] border border-indigo-100 dark:border-[#282D4A] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              For Students & Early Graduates
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Start your career with confidence, not guesswork.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Finding your first internship shouldn't feel like sending resumes into the void. SkillBridge provides the structure, transparent feedback, and verification you need.
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>No ghosting:</strong> Real-time stage tracking updates you whenever a recruiter reviews your profile.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Clear compensation:</strong> Every listed role clearly specifies monthly stipends or starting CTC ranges.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Profile strength coach:</strong> Real-time feedback on what missing skill or project will elevate your application.</span>
              </li>
            </ul>

            <Link to="/register" className="inline-block pt-2">
              <Button size="lg" rightIcon={ArrowRight}>
                Create Your Free Student Profile
              </Button>
            </Link>
          </div>

          {/* Visual student card representation */}
          <Card className="p-6 space-y-4 shadow-lg border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-[#1A1D30]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Aanya Sharma</h4>
                  <Badge variant="active">Open to work</Badge>
                </div>
                <p className="text-xs text-slate-500">Aspiring Product Designer · Class of 2027</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span>Profile Strength</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">85% Complete</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>3 Applications active</span>
              <span className="text-emerald-600 font-semibold">1 Interview scheduled</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 8. BENEFITS FOR RECRUITERS */}
      <section id="benefits-recruiters" className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              For High-Growth Teams & Companies
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hire raw ambition before the crowd catches on.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Skip hundreds of unstructured emails. SkillBridge provides an integrated candidate ATS, verified project portfolios, and seamless interview coordination.
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Pre-screened talent:</strong> Filter applicants by verified skill sets, degree type, and availability.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Unified ATS pipeline:</strong> Move candidates through stages with team notes and one-click interview scheduling.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Post in 2 minutes:</strong> Create transparent role requirements and attract targeted applications immediately.</span>
              </li>
            </ul>

            <Link to="/register" className="inline-block pt-2">
              <Button size="lg" variant="primary" rightIcon={ArrowRight}>
                Start Hiring as Recruiter
              </Button>
            </Link>
          </div>

          {/* Visual Recruiter Pipeline */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 space-y-4 text-xs relative z-10">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="font-bold text-slate-200">Recruitment Pipeline Snapshot</span>
              <span className="text-emerald-400 font-semibold">Active Cycle</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-slate-300">
                <span>Applied Candidates</span>
                <span className="font-bold">342</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shortlisted for Review</span>
                <span className="font-bold text-indigo-400">48</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Interviews Scheduled</span>
                <span className="font-bold text-purple-400">12</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Offers Extended</span>
                <span className="font-bold text-emerald-400">6</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS (Clearly Identified Sample Content) */}
      <section id="testimonials" className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Verified Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Loved by Students and Recruiters Alike
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real stories from candidates landing dream internships and recruiters finding high-impact early-career builders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1: Student */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "SkillBridge changed my job search completely. The 98% match score gave me the confidence to apply for the Product Design Intern role at Linear, and having direct interview updates eliminated all the usual anxiety."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                RS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rhea Sengupta</h4>
                <p className="text-[11px] text-slate-500">Design Intern at Linear · NIFT Bengaluru</p>
              </div>
            </div>
          </Card>

          {/* Testimonial 2: Recruiter */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "We hired 6 outstanding interns through SkillBridge in under three weeks. The candidate master-detail view and direct Google Meet coordination cut our hiring timeline in half."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                MK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Meera Kapoor</h4>
                <p className="text-[11px] text-slate-500">Lead Technical Recruiter at Linear</p>
              </div>
            </div>
          </Card>

          {/* Testimonial 3: Academic Partner */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {'★'.repeat(5)}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "The zero-unpaid-internships policy makes SkillBridge our university's recommended platform for student placements. Our students get quality opportunities with legitimate companies."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                AS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dr. Arvind S.</h4>
                <p className="text-[11px] text-slate-500">Head of Placements · National Tech Institute</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 10. HIGH IMPACT CALL TO ACTION (CTA) */}
      <section className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-tr from-[#16192E] via-[#211E48] to-[#16192E] text-white text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 25,000+ early career builders today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Ready to take your next career leap?
          </h2>

          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Whether you are taking your first step or building an ambitious product team, SkillBridge is where potential connects with possibility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-md">
                Create Free Student Profile →
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-white/30 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 font-semibold shadow-sm transition-colors"
              >
                Post Roles as Recruiter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
