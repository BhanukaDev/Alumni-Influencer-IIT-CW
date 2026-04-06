import { useEffect, useMemo, useState } from 'react'
import { verifyEmail } from '../services/api'

function EmailVerificationPage() {
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('token')
  }, [])

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setError('Token is required')
        return
      }

      try {
        setIsLoading(true)
        setError('')
        const result = await verifyEmail(token)
        setMessage(result.message)
      } catch (verifyError) {
        const text = verifyError instanceof Error ? verifyError.message : 'Email verification failed'
        setError(text)
      } finally {
        setIsLoading(false)
      }
    }

    void runVerification()
  }, [token])

  return (
    <main className="page">
      <h1>Email Verification</h1>
      {isLoading && <p>Verifying...</p>}
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </main>
  )
}

export default EmailVerificationPage
