import React from 'react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  mockNotifications,
  mockRecruiterDashboard,
  mockStudentDashboard,
  mockJobListings,
  mockStudentProfile,
  mockResumes,
} from './mocks/mockData'

// Mock window.matchMedia for theme and responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver for Recharts and layout elements
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollTo
window.scrollTo = () => {}

// Mock Recharts ResponsiveContainer to prevent width/height 0 warnings in JSDOM
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    ResponsiveContainer: ({ children }) =>
      React.createElement(
        'div',
        { className: 'recharts-responsive-container', style: { width: 800, height: 400 } },
        children
      ),
  }
})

// Global Service Mocks to prevent any real HTTP calls during unit tests
vi.mock('../services/notificationService', () => ({
  notificationService: {
    getNotifications: vi.fn().mockResolvedValue(mockNotifications),
    markAsRead: vi.fn().mockResolvedValue({ success: true }),
    markAllAsRead: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('../services/recruiterService', () => ({
  recruiterService: {
    getDashboard: vi.fn().mockResolvedValue(mockRecruiterDashboard),
    getJobs: vi.fn().mockResolvedValue({ jobs: [], pagination: { total: 0 } }),
    getJobById: vi.fn().mockResolvedValue(null),
    createJob: vi.fn().mockResolvedValue({ id: 'new-job' }),
    updateJob: vi.fn().mockResolvedValue({ success: true }),
    publishJob: vi.fn().mockResolvedValue({ success: true }),
    closeJob: vi.fn().mockResolvedValue({ success: true }),
    deleteJob: vi.fn().mockResolvedValue({ success: true }),
    getCandidates: vi.fn().mockResolvedValue([]),
    getCandidateById: vi.fn().mockResolvedValue(null),
    updateCandidateStage: vi.fn().mockResolvedValue({ success: true }),
    scheduleInterview: vi.fn().mockResolvedValue({ success: true }),
    addCandidateNote: vi.fn().mockResolvedValue({ success: true }),
    getDashboardStats: vi.fn().mockResolvedValue(mockRecruiterDashboard.stats),
    getApplications: vi.fn().mockResolvedValue([]),
    getProfile: vi.fn().mockResolvedValue({ companyName: 'Acme Corp' }),
    updateProfile: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('../services/studentService', () => ({
  studentService: {
    getDashboard: vi.fn().mockResolvedValue(mockStudentDashboard),
    toggleSaveJob: vi.fn().mockResolvedValue({ success: true }),
    getApplications: vi.fn().mockResolvedValue([]),
    getDashboardStats: vi.fn().mockResolvedValue(mockStudentDashboard.stats),
  },
}))

vi.mock('../services/jobService', () => ({
  FALLBACK_JOBS: mockJobListings.jobs,
  MOCK_JOBS: mockJobListings.jobs,
  jobService: {
    getJobs: vi.fn().mockResolvedValue(mockJobListings),
    getJobById: vi.fn().mockImplementation((id) =>
      Promise.resolve(mockJobListings.jobs.find((j) => j.id === id) || mockJobListings.jobs[0])
    ),
    toggleSaveJob: vi.fn().mockResolvedValue({ success: true }),
    applyToJob: vi.fn().mockResolvedValue({ success: true, message: 'Applied successfully' }),
    getApplicationStatus: vi.fn().mockResolvedValue({ hasApplied: false }),
    getAllJobs: vi.fn().mockResolvedValue(mockJobListings.jobs),
    getSavedJobs: vi.fn().mockResolvedValue(mockJobListings.jobs.filter((j) => j.isSaved)),
  },
}))

vi.mock('../services/profileService', () => ({
  profileService: {
    getProfile: vi.fn().mockResolvedValue(mockStudentProfile),
    updateProfile: vi.fn().mockImplementation((updates) =>
      Promise.resolve({ ...mockStudentProfile, ...updates })
    ),
    getResumes: vi.fn().mockResolvedValue(mockResumes),
    uploadResume: vi.fn().mockResolvedValue({ id: 'res-new', name: 'New_Resume.pdf' }),
    deleteResume: vi.fn().mockResolvedValue({ success: true }),
    setDefaultResume: vi.fn().mockResolvedValue({ success: true }),
    getSavedJobs: vi.fn().mockResolvedValue([]),
    removeSavedJob: vi.fn().mockResolvedValue({ success: true }),
    toggleSaveJob: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('../services/adminService', () => ({
  adminService: {
    getDashboard: vi.fn().mockResolvedValue({ stats: {}, users: [], jobs: [] }),
    getUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
    getJobs: vi.fn().mockResolvedValue({ jobs: [], total: 0 }),
    getReports: vi.fn().mockResolvedValue({ reports: [] }),
    getAuditLogs: vi.fn().mockResolvedValue([]),
    getSettings: vi.fn().mockResolvedValue({}),
    updateSettings: vi.fn().mockResolvedValue({ success: true }),
    suspendUser: vi.fn().mockResolvedValue({ success: true }),
    activateUser: vi.fn().mockResolvedValue({ success: true }),
    approveJob: vi.fn().mockResolvedValue({ success: true }),
    removeJob: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('../services/analyticsService', () => ({
  analyticsService: {
    getAdminAnalytics: vi.fn().mockResolvedValue({}),
    getRecruiterAnalytics: vi.fn().mockResolvedValue({}),
    getStudentAnalytics: vi.fn().mockResolvedValue({}),
  },
}))

// Safety net: Mock apiClient to ensure no raw HTTP calls leak through
vi.mock('../services/apiClient', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))
