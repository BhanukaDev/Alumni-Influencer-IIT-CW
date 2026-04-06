import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { resetPassword } from '../services/api'

function ResetPasswordPage() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('token') ?? ''
  }, [])

  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('Reset token is missing from the URL')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await resetPassword(token, password)
      setMessage(result.message)
      setPassword('')
    } catch (submitError) {
      const text = submitError instanceof Error ? submitError.message : 'Reset failed'
      setError(text)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <h1>Reset Password</h1>

      {!token && <p>Invalid reset link. Please request a new one.</p>}

      <form onSubmit={onSubmit} className="form" noValidate>
        <label htmlFor="reset-password">New Password</label>
        <input
          id="reset-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={isSubmitting || !token}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <p><a href="/login">Back to login</a></p>
    </main>
  )
}

export default ResetPasswordPage
