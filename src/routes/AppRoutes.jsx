import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoadingState } from '../components/ui/Loading'

// Layouts
import { PublicLayout } from '../layouts/PublicLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { RecruiterLayout } from '../layouts/RecruiterLayout'
import { AdminLayout } from '../layouts/AdminLayout'

// Consistent page loading state for async route transitions
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <LoadingState message="Loading..." className="p-8" />
    </div>
  )
}

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('../pages/public/LandingPage').then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('../pages/public/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('../pages/public/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

// Student Pages (Lazy Loaded)
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })))
const StudentJobs = lazy(() => import('../pages/student/StudentJobs').then((m) => ({ default: m.StudentJobs })))
const StudentJobDetail = lazy(() => import('../pages/student/StudentJobDetail').then((m) => ({ default: m.StudentJobDetail })))
const StudentApplications = lazy(() => import('../pages/student/StudentApplications').then((m) => ({ default: m.StudentApplications })))
const StudentAnalytics = lazy(() => import('../pages/student/StudentAnalytics').then((m) => ({ default: m.StudentAnalytics })))
const StudentSavedJobs = lazy(() => import('../pages/student/StudentSavedJobs').then((m) => ({ default: m.StudentSavedJobs })))
const StudentProfile = lazy(() => import('../pages/student/StudentProfile').then((m) => ({ default: m.StudentProfile })))
const StudentSettings = lazy(() => import('../pages/student/StudentSettings').then((m) => ({ default: m.StudentSettings })))

// Recruiter Pages (Lazy Loaded)
const RecruiterDashboard = lazy(() => import('../pages/recruiter/RecruiterDashboard').then((m) => ({ default: m.RecruiterDashboard })))
const RecruiterJobs = lazy(() => import('../pages/recruiter/RecruiterJobs').then((m) => ({ default: m.RecruiterJobs })))
const RecruiterJobCreate = lazy(() => import('../pages/recruiter/RecruiterJobCreate').then((m) => ({ default: m.RecruiterJobCreate })))
const RecruiterJobDetail = lazy(() => import('../pages/recruiter/RecruiterJobDetail').then((m) => ({ default: m.RecruiterJobDetail })))
const RecruiterCandidates = lazy(() => import('../pages/recruiter/RecruiterCandidates').then((m) => ({ default: m.RecruiterCandidates })))
const RecruiterApplications = lazy(() => import('../pages/recruiter/RecruiterApplications').then((m) => ({ default: m.RecruiterApplications })))
const RecruiterAnalytics = lazy(() => import('../pages/recruiter/RecruiterAnalytics').then((m) => ({ default: m.RecruiterAnalytics })))
const RecruiterProfile = lazy(() => import('../pages/recruiter/RecruiterProfile').then((m) => ({ default: m.RecruiterProfile })))

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers').then((m) => ({ default: m.AdminUsers })))
const AdminJobs = lazy(() => import('../pages/admin/AdminJobs').then((m) => ({ default: m.AdminJobs })))
const AdminReports = lazy(() => import('../pages/admin/AdminReports').then((m) => ({ default: m.AdminReports })))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings })))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Auth Pages (Split Screen layout) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Student Workspace (Protected) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="jobs" element={<StudentJobs />} />
          <Route path="jobs/:id" element={<StudentJobDetail />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="analytics" element={<StudentAnalytics />} />
          <Route path="saved-jobs" element={<StudentSavedJobs />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Recruiter Workspace (Protected) */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs" element={<RecruiterJobs />} />
          <Route path="jobs/create" element={<RecruiterJobCreate />} />
          <Route path="jobs/:id" element={<RecruiterJobDetail />} />
          <Route path="jobs/:id/edit" element={<RecruiterJobCreate />} />
          <Route path="candidates" element={<RecruiterCandidates />} />
          <Route path="applications" element={<RecruiterApplications />} />
          <Route path="analytics" element={<RecruiterAnalytics />} />
          <Route path="profile" element={<RecruiterProfile />} />
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* Admin Workspace (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers key="users-all" defaultRole="all" />} />
          <Route path="students" element={<AdminUsers key="users-students" defaultRole="student" />} />
          <Route path="recruiters" element={<AdminUsers key="users-recruiters" defaultRole="recruiter" />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="reports" element={<AdminReports key="reports-logs" defaultTab="logs" />} />
          <Route path="analytics" element={<AdminReports key="reports-analytics" defaultTab="analytics" />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 Fallback */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

