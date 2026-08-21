import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { InternAuthProvider } from './context/InternAuthContext'
import { CourseProvider } from './context/CourseContext'
import PublicLayout from './components/PublicLayout'
import DashboardLayout from './components/DashboardLayout'
import InternshipLayout from './components/InternshipLayout'
import InternPortalLayout from './components/InternPortalLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AuthModal from './components/AuthModal'
import IHLoader from './components/IHLoader'
import { NotificationProvider } from './context/NotificationContext'

const PublicLanding = lazy(() => import('./components/PublicLanding'))
const DashboardHome = lazy(() => import('./pages/DashboardHome'))
const Courses = lazy(() => import('./pages/Courses'))
const LearnView = lazy(() => import('./pages/LearnView'))
const CourseDetails = lazy(() => import('./pages/CourseDetails'))
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'))
const Arena = lazy(() => import('./pages/Arena'))
const Careers = lazy(() => import('./pages/Careers'))
const Resources = lazy(() => import('./pages/Resources'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Certifications = lazy(() => import('./pages/Certifications'))
const Settings = lazy(() => import('./pages/Settings'))
const InternPortal = lazy(() => import('./pages/InternPortal'))
const InternAssignmentDetail = lazy(() => import('./pages/InternAssignmentDetail'))
const CodingArena = lazy(() => import('./pages/CodingArena'))
const ChallengeWorkspace = lazy(() => import('./pages/ChallengeWorkspace'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Community = lazy(() => import('./pages/Community'))
const Profile = lazy(() => import('./pages/Profile'))
const MajorCourseViewer = lazy(() => import('./components/MajorCourseViewer'))
const MLMajorRoadmap = lazy(() => import('./components/MLMajorRoadmap'))
const CourseViewer = lazy(() => import('./components/CourseViewer'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const HelpSupport = lazy(() => import('./pages/HelpSupport'))

/**
 * Onboarding funnel: after a successful login/registration, forward the user
 * to whatever they were trying to reach (stored by Courses/Careers/ProtectedRoute
 * before pushing them to /login?redirect=...). Cleared after first use.
 */
function PostLoginRedirect() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) return
    const pending = sessionStorage.getItem('ih_login_redirect')
    if (pending && location.pathname !== pending) {
      sessionStorage.removeItem('ih_login_redirect')
      sessionStorage.removeItem('ih_login_action')
      navigate(pending, { replace: true })
    }
  }, [user, location.pathname, navigate])

  return null
}

function AppContent() {
  const { user, loading, oauthAuthError, clearOauthAuthError } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('signin')
  const [authError, setAuthError] = useState('')

  // A Google OAuth callback failed intent validation — re-open the auth modal
  // on the correct tab with the rejection message so the user can recover.
  useEffect(() => {
    if (oauthAuthError) {
      setAuthTab(oauthAuthError.tab === 'signup' ? 'signup' : 'signin')
      setAuthError(oauthAuthError.message)
      setAuthOpen(true)
      clearOauthAuthError()
    }
  }, [oauthAuthError, clearOauthAuthError])

  if (loading) return <IHLoader />

  return (
    <>
      {authOpen && (
        <AuthModal
          initialTab={authTab}
          initialError={authError}
          onClose={() => { setAuthOpen(false); setAuthError('') }}
        />
      )}
      <PostLoginRedirect />
      <Suspense fallback={<IHLoader />}>
        <NotificationProvider>
          <Routes>
        {!user ? (
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicLanding onOpenAuth={() => setAuthOpen(true)} />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/internship" element={<Careers />} />
            <Route path="/pricing" element={<Pricing onOpenAuth={() => setAuthOpen(true)} />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            {/* Standalone full-screen course workspaces — no global nav/sidebar */}
            <Route path="/courses/:courseId/learn" element={<LearnView />} />
            <Route path="/course/:courseId" element={<CourseViewer />} />
            <Route path="/learn/:courseId" element={<CourseViewer />} />
            <Route path="/ml-major-course" element={<MajorCourseViewer />} />
            <Route path="/ml-major-roadmap" element={<MLMajorRoadmap />} />
            {/* Dashboard with global layout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/dashboard/courses/:id" element={<CourseDetails />} />
              <Route path="/dashboard/learn/:courseId/lesson/:lessonId" element={<LessonPlayer />} />
              <Route path="/learning" element={<Courses />} />
              <Route path="/arena" element={<Arena />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/internship" element={<Careers />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/dashboard/certifications" element={<Certifications />} />
              <Route path="/certifications" element={<Certifications />} />
               <Route path="/challenges" element={<CodingArena />} />
               <Route path="/challenges/:id" element={<ChallengeWorkspace />} />
               <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/community" element={<Community />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/billing" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </>
        )}

        <Route path="/intern-portal" element={<ProtectedRoute><InternshipLayout /></ProtectedRoute>}>
          <Route element={<InternPortalLayout />}>
            <Route path=":tab?" element={<InternPortal />} />
            <Route path="assignments/:assignmentId" element={<InternAssignmentDetail />} />
          </Route>
        </Route>
        <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </NotificationProvider>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <InternAuthProvider>
        <CourseProvider>
          <AppContent />
        </CourseProvider>
      </InternAuthProvider>
    </BrowserRouter>
  )
}

export default App
