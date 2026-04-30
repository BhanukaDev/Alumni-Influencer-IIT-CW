import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    fetch(`/auth/verify-email?token=${encodeURIComponent(token)}`, { credentials: 'include' })
      .then(res => res.json())
      .then((data: { message?: string; error?: string }) => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message ?? 'Email verified.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'loading' && <p className="loading">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h2>Email verified</h2>
            <p>{message}</p>
            <p className="auth-link"><Link to="/login">Sign in</Link></p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>Verification failed</h2>
            <p className="error">{message}</p>
            <p className="auth-link"><Link to="/login">Back to sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
