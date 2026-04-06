import { useState } from 'react'
import type { FormEvent } from 'react'
import { loginAlumni } from '../services/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      setIsSubmitting(true)
      const result = await loginAlumni({ email, password })
      setMessage(`${result.message} (${result.role})`)
      setPassword('')
    } catch (submitError) {
      const text = submitError instanceof Error ? submitError.message : 'Login failed'
      setError(text)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <h1>Login</h1>

      <form onSubmit={onSubmit} className="form" noValidate>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <p><a href="/forgot-password">Forgot password?</a></p>
      <p>No account? <a href="/register">Register</a></p>
    </main>
  )
}

export default LoginPage
