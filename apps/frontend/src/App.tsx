import { useEffect, useState } from 'react'
import BiddingPage from './pages/BiddingPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfileManagementPage from './pages/ProfileManagementPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { getAuthSession, logoutAlumni } from './services/api'
import './index.css'

function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const path = window.location.pathname

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getAuthSession()
        setIsAuthenticated(session.authenticated)
      } catch {
        setIsAuthenticated(false)
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
      window.location.href = '/'
    }
  }

  let page = (
    <HomePage />
  )

  const protectedRouteMessage = (
    <main className="page">
      <h1>Authentication Required</h1>
      <p>Please log in to open this page.</p>
      <p>
        <a href="/login">Go to login</a>
      </p>
    </main>
  )

  const loadingPage = (
    <main className="page">
      <h1>Loading</h1>
      <p>Checking your session...</p>
    </main>
  )

  if (path === '/verify-email') {
    page = <EmailVerificationPage />
  } else if (path === '/forgot-password') {
    page = <ForgotPasswordPage />
  } else if (path === '/reset-password') {
    page = <ResetPasswordPage />
  } else if (path === '/login') {
    page = <LoginPage />
  } else if (path === '/register') {
    page = <RegisterPage />
  } else if (path === '/bidding') {
    page = !authChecked ? loadingPage : isAuthenticated ? <BiddingPage /> : protectedRouteMessage
  } else if (path === '/profile') {
    page =
      !authChecked ? loadingPage : isAuthenticated ? <ProfileManagementPage /> : protectedRouteMessage
  }

  return (
    <>
      <nav className="page" aria-label="Main navigation">
        <a href="/">Home</a>
        {!isAuthenticated && (
          <>
            {' '}
            | <a href="/register">Register</a> | <a href="/login">Login</a>
          </>
        )}
        {isAuthenticated && (
          <>
            {' '}
            | <a href="/profile">Profile</a> | <a href="/bidding">Bidding</a> |{' '}
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
      {page}
    </>
  )
}

export default App
