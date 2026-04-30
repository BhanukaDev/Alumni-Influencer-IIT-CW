import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>Email sent</h2>
          <p>If that account exists, a reset link has been sent.</p>
          <p className="auth-link"><Link to="/login">Back to sign in</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>University email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="auth-link"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
