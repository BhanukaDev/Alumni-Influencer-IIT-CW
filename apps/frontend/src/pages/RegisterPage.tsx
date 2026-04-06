import { useState } from 'react'
import type { FormEvent } from 'react'
import { registerAlumni } from '../services/api'

function RegisterPage() {
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
      const result = await registerAlumni({ email, password })
      setMessage(result.message)
      setEmail('')
      setPassword('')
    } catch (submitError) {
      const text = submitError instanceof Error ? submitError.message : 'Registration failed'
      setError(text)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <h1>Register</h1>

      <form onSubmit={onSubmit} className="form" noValidate>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <p>Already have an account? <a href="/login">Login</a></p>
    </main>
  )
}

export default RegisterPage
