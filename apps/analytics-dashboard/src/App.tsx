import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ChartsPage from './pages/ChartsPage';
import AlumniPage from './pages/AlumniPage';
import { getSession, logout, createApiKey } from './services/auth';

const API_KEY_STORAGE = 'analytics_api_key';

async function ensureApiKey(): Promise<void> {
  if (localStorage.getItem(API_KEY_STORAGE)) return;
  const { key } = await createApiKey('Analytics Dashboard', ['read:alumni', 'read:analytics']);
  localStorage.setItem(API_KEY_STORAGE, key);
}

function ProtectedRoute({ ready, authenticated, children }: { ready: boolean; authenticated: boolean; children: React.ReactNode }) {
  if (!ready) return <div className="loading-screen">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  const checkSession = async () => {
    try {
      const session = await getSession();
      if (session.authenticated) {
        setAuthenticated(true);
        setUserName(session.name ?? session.userId?.toString() ?? '');
        await ensureApiKey();
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => { void checkSession(); }, []);

  const handleLogin = () => checkSession();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem(API_KEY_STORAGE);
    setAuthenticated(false);
    setUserName('');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute ready={ready} authenticated={authenticated}>
              <Layout userName={userName} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/charts" element={<ChartsPage />} />
                  <Route path="/alumni" element={<AlumniPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
