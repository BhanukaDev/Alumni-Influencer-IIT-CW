import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, Link, Navigate } from 'react-router-dom'
import BackendStatusIndicator from './components/BackendStatus'
import BiddingPage from './pages/BiddingPage'
import DeveloperDashboardPage from './pages/DeveloperDashboardPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfileManagementPage from './pages/ProfileManagementPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { getAuthSession, logoutAlumni } from './services/api'
import './index.css'

function ProtectedRoute({
  authChecked,
  isAuthenticated,
  children,
}: {
  authChecked: boolean
  isAuthenticated: boolean
  children: React.ReactNode
}) {
  if (!authChecked) {
    return (
      <main className="page">
        <h1>Loading</h1>
        <p>Checking your session...</p>
      </main>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserName, setCurrentUserName] = useState('')
  const [currentUserImageUrl, setCurrentUserImageUrl] = useState('')

  const currentUserInitials =
    currentUserName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getAuthSession()
        setIsAuthenticated(session.authenticated)
        setCurrentUserName(session.authenticated ? (session.name ?? '') : '')
        setCurrentUserImageUrl(session.authenticated ? (session.imageUrl ?? '') : '')
      } catch {
        setIsAuthenticated(false)
        setCurrentUserName('')
        setCurrentUserImageUrl('')
      } finally {
        setAuthChecked(true)
      }
    }
    void checkSession()
  }, [])

  const onLogout = async () => {
    try {
      await logoutAlumni()
    } finally {
      setIsAuthenticated(false)
      setCurrentUserName('')
      setCurrentUserImageUrl('')
      window.location.href = '/'
    }
  }

  return (
    <BrowserRouter>
      <nav className="page" aria-label="Main navigation">
        <BackendStatusIndicator />{' '}
        <Link to="/">Home</Link>
        {!isAuthenticated && (
          <>
            {' '}
            | <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            {' '}
            |{' '}
            <span className="nav-user">
              <span className="nav-avatar" aria-hidden="true">
                {currentUserImageUrl ? (
                  <img src={currentUserImageUrl} alt="" className="nav-avatar-image" />
                ) : (
                  currentUserInitials
                )}
              </span>
              <span>Signed in as {currentUserName || 'User'}</span>
            </span>{' '}
            | <Link to="/profile">Profile</Link>{' '}
            | <Link to="/bidding">Bidding</Link>{' '}
            | <Link to="/developer">Developer</Link>{' '}|{' '}
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/bidding"
          element={
            <ProtectedRoute authChecked={authChecked} isAuthenticated={isAuthenticated}>
              <BiddingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute authChecked={authChecked} isAuthenticated={isAuthenticated}>
              <ProfileManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/developer"
          element={
            <ProtectedRoute authChecked={authChecked} isAuthenticated={isAuthenticated}>
              <DeveloperDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
