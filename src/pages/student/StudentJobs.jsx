import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SkeletonCard,
} from '../../components/ui'
import { jobService } from '../../services/jobService'
import { useDebounce } from '../../hooks/useDebounce'

export function StudentJobs() {
  const navigate = useNavigate()

  // --- Filter State ---
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'internship' | 'jobs'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedTypes, setSelectedTypes] = useState([]) // ['internship', 'full-time', 'part-time']
  const [selectedArrangements, setSelectedArrangements] = useState([]) // ['remote', 'hybrid', 'on-site']
  const [selectedExperience, setSelectedExperience] = useState([]) // ['entry-level', '1-2-years']
  const [minSalary, setMinSalary] = useState(0)
  const [postedWithin, setPostedWithin] = useState('all') // 'all' | '24h' | 'week'
  const [sortBy, setSortBy] = useState('recommended')
  const [currentPage, setCurrentPage] = useState(1)

  // --- API / UI State ---
  const [jobs, setJobs] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
    startIndex: 0,
    endIndex: 0,
  })
  const [facetCounts, setFacetCounts] = useState({
    all: 128,
    internships: 76,
    fullTime: 52,
    partTime: 18,
    remote: 42,
    hybrid: 54,
    onSite: 32,
    entryLevel: 128,
    oneToTwoYears: 64,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingJobId, setSavingJobId] = useState(null)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [alertSubmitted, setAlertSubmitted] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Debounced search query (350ms)
  const debouncedSearch = useDebounce(searchQuery, 350)

  // Combine top category tab with sidebar types
  const effectiveTypes = useMemo(() => {
    if (activeTab === 'internship') return 'internship'
    if (activeTab === 'jobs') return 'full-time'
    if (selectedTypes.length > 0) return selectedTypes.join(',')
    return 'all'
  }, [activeTab, selectedTypes])

  // Fetch jobs from backend API
  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        search: debouncedSearch.trim(),
        location: selectedLocation,
        type: effectiveTypes,
        arrangement: selectedArrangements.length > 0 ? selectedArrangements.join(',') : 'all',
        experience: selectedExperience.length > 0 ? selectedExperience.join(',') : 'all',
        minSalary: minSalary > 0 ? minSalary : undefined,
        postedWithin: postedWithin !== 'all' ? postedWithin : undefined,
        sort: sortBy,
        page: currentPage,
        limit: 6,
      }

      const res = await jobService.getJobs(params)
      setJobs(res.jobs || [])
      setPagination(res.pagination || {})
      if (res.counts) {
        setFacetCounts(res.counts)
      }
    } catch (err) {
      console.warn('Jobs fetch error, using local fallback:', err.message)
      setError(err.message || 'Unable to connect to the jobs server.')
    } finally {
      setLoading(false)
    }
  }

  // Effect: triggered on filter / pagination changes
  useEffect(() => {
    let isMounted = true
    const params = {
      search: debouncedSearch.trim(),
      location: selectedLocation,
      type: effectiveTypes,
      arrangement: selectedArrangements.length > 0 ? selectedArrangements.join(',') : 'all',
      experience: selectedExperience.length > 0 ? selectedExperience.join(',') : 'all',
      minSalary: minSalary > 0 ? minSalary : undefined,
      postedWithin: postedWithin !== 'all' ? postedWithin : undefined,
      sort: sortBy,
      page: currentPage,
      limit: 6,
    }

    jobService
      .getJobs(params)
      .then((res) => {
        if (isMounted) {
          setJobs(res.jobs || [])
          setPagination(res.pagination || {})
          if (res.counts) {
            setFacetCounts(res.counts)
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to connect to the jobs server.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [
    debouncedSearch,
    selectedLocation,
    effectiveTypes,
    selectedArrangements,
    selectedExperience,
    minSalary,
    postedWithin,
    sortBy,
    currentPage,
  ])

  // Reset pagination to page 1 whenever search or filters change
  const handleFilterChange = (updater) => {
    setCurrentPage(1)
    updater()
  }

  // Toggle saving / bookmarking a job
  const handleToggleBookmark = async (e, jobId) => {
    e.stopPropagation()
    setSavingJobId(jobId)
    try {
      await jobService.toggleSaveJob(jobId)
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
      )
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    } finally {
      setSavingJobId(null)
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setActiveTab('all')
    setSearchQuery('')
    setSelectedLocation('all')
    setSelectedTypes([])
    setSelectedArrangements([])
    setSelectedExperience([])
    setMinSalary(0)
    setPostedWithin('all')
    setSortBy('recommended')
    setCurrentPage(1)
  }

  // Toggle multi-select helper
  const toggleArrayItem = (list, item) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item]

  // Active filter chips list
  const activeChips = []
  if (searchQuery.trim()) activeChips.push({ label: `"${searchQuery}"`, onRemove: () => setSearchQuery('') })
  if (selectedLocation !== 'all') {
    activeChips.push({
      label: selectedLocation === 'bengaluru' ? 'Bengaluru' : selectedLocation === 'delhi' ? 'Delhi NCR' : 'Remote Only',
      onRemove: () => setSelectedLocation('all'),
    })
  }
  selectedTypes.forEach((t) =>
    activeChips.push({
      label: t === 'internship' ? 'Internships' : t === 'full-time' ? 'Full-time' : 'Part-time',
      onRemove: () => handleFilterChange(() => setSelectedTypes((prev) => prev.filter((i) => i !== t))),
    })
  )
  selectedArrangements.forEach((a) =>
    activeChips.push({
      label: a === 'remote' ? 'Remote' : a === 'hybrid' ? 'Hybrid' : 'On-site',
      onRemove: () => handleFilterChange(() => setSelectedArrangements((prev) => prev.filter((i) => i !== a))),
    })
  )
  selectedExperience.forEach((e) =>
    activeChips.push({
      label: e === 'entry-level' ? 'Entry level' : '1-2 years',
      onRemove: () => handleFilterChange(() => setSelectedExperience((prev) => prev.filter((i) => i !== e))),
    })
  )
  if (minSalary > 0) {
    activeChips.push({
      label: `Min: ₹${(minSalary / 1000).toFixed(0)}k/mo`,
      onRemove: () => handleFilterChange(() => setMinSalary(0)),
    })
  }
  if (postedWithin !== 'all') {
    activeChips.push({
      label: postedWithin === '24h' ? 'Past 24 hours' : 'Past week',
      onRemove: () => handleFilterChange(() => setPostedWithin('all')),
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Find your next beginning."
        subtitle="Meaningful internships and first jobs, matched to your ambition."
      />

      {/* 2. Main Search & Location Toolbar Card */}
      <Card className="p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
              onClear={() => handleFilterChange(() => setSearchQuery(''))}
              placeholder="Job title, company, or skill..."
              className="w-full max-w-none text-xs sm:text-sm"
            />
          </div>

          {/* Location Selector */}
          <div className="w-full md:w-60 shrink-0">
            <Select
              options={[
                { value: 'all', label: 'All Locations' },
                { value: 'bengaluru', label: 'Bengaluru, India' },
                { value: 'delhi', label: 'Delhi NCR, India' },
                { value: 'remote', label: 'Remote Only' },
              ]}
              value={selectedLocation}
              onChange={(e) => handleFilterChange(() => setSelectedLocation(e.target.value))}
              leftIcon={MapPin}
            />
          </div>

          {/* Find Button */}
          <Button
            onClick={() => fetchJobs()}
            className="w-full md:w-auto shrink-0 justify-center text-xs font-semibold"
          >
            Find opportunities
          </Button>
        </div>
      </Card>

      {/* 3. Top Tabs Bar & Mobile Filter Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all')
              setSelectedTypes([])
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all' && selectedTypes.length === 0
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All opportunities <span className="opacity-80 ml-1">({facetCounts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('internship')
              setSelectedTypes(['internship'])
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'internship' || selectedTypes.includes('internship')
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Internships <span className="opacity-80 ml-1">({facetCounts.internships})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('jobs')
              setSelectedTypes(['full-time'])
              setCurrentPage(1)
            }}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'jobs' || selectedTypes.includes('full-time')
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Jobs <span className="opacity-80 ml-1">({facetCounts.fullTime})</span>
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters {activeChips.length > 0 && `(${activeChips.length})`}</span>
        </button>
      </div>

      {/* 4. Main Two-Column Layout (Filters Sidebar + Job Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Filters */}
        <div className={`lg:col-span-1 space-y-4 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <Card className="p-5 space-y-5">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Filters
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reset all
              </button>
            </div>

            {/* Opportunity Type */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                Opportunity type
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'internship', label: 'Internships', count: facetCounts.internships },
                  { id: 'full-time', label: 'Full-time jobs', count: facetCounts.fullTime },
                  { id: 'part-time', label: 'Part-time', count: facetCounts.partTime },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(item.id)}
                        onChange={() =>
                          handleFilterChange(() =>
                            setSelectedTypes((prev) => toggleArrayItem(prev, item.id))
                          )
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Arrangement */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                Work arrangement
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'remote', label: 'Remote', count: facetCounts.remote },
                  { id: 'hybrid', label: 'Hybrid', count: facetCounts.hybrid },
                  { id: 'on-site', label: 'On-site', count: facetCounts.onSite },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedArrangements.includes(item.id)}
                        onChange={() =>
                          handleFilterChange(() =>
                            setSelectedArrangements((prev) => toggleArrayItem(prev, item.id))
                          )
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                Experience
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'entry-level', label: 'Entry level / fresher', count: facetCounts.entryLevel },
                  { id: '1-2-years', label: '1–2 years', count: facetCounts.oneToTwoYears },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedExperience.includes(item.id)}
                        onChange={() =>
                          handleFilterChange(() =>
                            setSelectedExperience((prev) => toggleArrayItem(prev, item.id))
                          )
                        }
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Monthly Stipend / Salary Slider */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-900 dark:text-slate-200">
                  Monthly stipend / salary
                </label>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {minSalary > 0 ? `≥ ₹${minSalary.toLocaleString()}` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={minSalary}
                onChange={(e) => handleFilterChange(() => setMinSalary(Number(e.target.value)))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>₹10,000</span>
                <span>₹1,00,000+</span>
              </div>
            </div>

            {/* Date Posted */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                Date posted
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'all', label: 'Any time' },
                  { id: '24h', label: 'Past 24 hours' },
                  { id: 'week', label: 'Past week' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="postedWithin"
                      checked={postedWithin === item.id}
                      onChange={() => handleFilterChange(() => setPostedWithin(item.id))}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content Area: Results, Active Filters, Cards Grid, Pagination */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Row: Opportunities Count & Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {pagination.total || 0} opportunities for your next step
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
              <div className="relative inline-block">
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange(() => setSortBy(e.target.value))}
                  className="bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="recent">Most Recent</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="match">Match Score</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              {activeChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="hover:text-indigo-900 dark:hover:text-indigo-100 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Loading Skeleton State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error && jobs.length === 0 ? (
            /* Error State */
            <div className="p-8 text-center bg-white dark:bg-[#161928] rounded-2xl border border-red-200 dark:border-red-900/50 shadow-xs space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Unable to load opportunities
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
              <Button size="sm" leftIcon={RefreshCw} onClick={fetchJobs}>
                Retry
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State */
            <EmptyState
              title="No opportunities found"
              description="No job postings match your active filter combination. Try clearing some filters or searching for different keywords."
              actionLabel="Reset all filters"
              onAction={handleResetFilters}
            />
          ) : (
            /* 5. Job Cards 2-Column Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/student/jobs/${job.id}`)}
                  className="bg-white dark:bg-[#161928] border border-slate-200/80 dark:border-[#282D4A] rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header: Company Logo, Title, Location, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center text-sm border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                          {job.logo || job.company[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {job.company} · {job.location} · {job.arrangement}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, job.id)}
                        disabled={savingJobId === job.id}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          job.isSaved
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title={job.isSaved ? 'Remove from saved' : 'Save opportunity'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${job.isSaved ? 'fill-indigo-600 dark:fill-indigo-400' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Badges: Type, Experience, Match Score */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100/60 dark:border-indigo-900/40">
                        {job.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {job.experience || 'Entry level'}
                      </span>
                      {job.matchScore && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100/80 dark:border-emerald-900/40">
                          {job.matchScore}% match
                        </span>
                      )}
                    </div>

                    {/* Skill Tags */}
                    {job.skills && (
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: Stipend, Posted Time, and Deadline */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {job.stipend}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {job.postedDaysAgo}
                      </span>
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Apply by {job.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. Pagination Controls */}
          {pagination.total > 0 && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.total} opportunities
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNext}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}

          {/* 7. Create Job Alert Promo Banner Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-indigo-50/40 dark:from-[#1D1936] dark:via-[#191630] dark:to-[#131126] border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Good opportunities shouldn&apos;t pass you by.
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Get new roles matching your preferences, straight to your inbox.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAlertModalOpen(true)}
              className="shrink-0 text-xs font-semibold justify-center"
            >
              Create alert
            </Button>
          </div>
        </div>
      </div>

      {/* 8. Create Job Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false)
          setAlertSubmitted(false)
        }}
        title="Create Job Alert"
        subtitle="Stay updated with new matching opportunities"
        size="sm"
      >
        {alertSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Job alert activated!
            </h4>
            <p className="text-xs text-slate-500">
              We will email you daily digests of opportunities matching your current filters.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setIsAlertModalOpen(false)
                setAlertSubmitted(false)
              }}
              className="mt-2"
            >
              Done
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (alertEmail) setAlertSubmitted(true)
            }}
            className="space-y-4 text-xs"
          >
            <p className="text-slate-600 dark:text-slate-300">
              Receive curated alerts matching your active search:
              <strong className="block text-indigo-600 dark:text-indigo-400 mt-1">
                {searchQuery ? `"${searchQuery}" · ` : ''}
                {selectedLocation !== 'all' ? `${selectedLocation} · ` : ''}
                {selectedTypes.join(', ') || 'All roles'}
              </strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Subscribe to alerts
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
