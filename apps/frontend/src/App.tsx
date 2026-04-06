import { useEffect, useState } from 'react'
import BackendStatus from './components/BackendStatus'
import CampaignForm from './components/forms/CampaignForm'
import ProfileForm from './components/forms/ProfileForm'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import ProfileManagementPage from './pages/ProfileManagementPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { getAuthSession, logoutAlumni } from './services/api'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const path = window.location.pathname

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getAuthSession()
        setIsAuthenticated(session.authenticated)
      } catch {
        setIsAuthenticated(false)
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
    <main className="page">
      <h1>Alumni Influencer</h1>

      <BackendStatus />

      <section className="section">
        <h2>Profile</h2>
        <ProfileForm />
      </section>

      <section className="section">
        <h2>Campaign</h2>
        <CampaignForm />
      </section>
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
  } else if (path === '/profile') {
    page = <ProfileManagementPage />
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
            | <a href="/profile">Profile</a> |{' '}
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
