import BackendStatus from './components/BackendStatus'
import CampaignForm from './components/forms/CampaignForm'
import ProfileForm from './components/forms/ProfileForm'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import './index.css'

function App() {
  const path = window.location.pathname

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
  }

  return (
    <>
      <nav className="page" aria-label="Main navigation">
        <a href="/">Home</a> | <a href="/register">Register</a> | <a href="/login">Login</a>
      </nav>
      {page}
    </>
  )
}

export default App
