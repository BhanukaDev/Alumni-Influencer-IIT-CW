import { useState } from 'react'
import type { FormEvent } from 'react'
import { forgotPassword } from '../services/api'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      setIsSubmitting(true)
      const result = await forgotPassword(email)
      setMessage(result.message)
      setEmail('')
    } catch (submitError) {
      const text = submitError instanceof Error ? submitError.message : 'Request failed'
      setError(text)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <h1>Forgot Password</h1>

      <form onSubmit={onSubmit} className="form" noValidate>
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <p><a href="/login">Back to login</a></p>
    </main>
  )
}

export default ForgotPasswordPage
