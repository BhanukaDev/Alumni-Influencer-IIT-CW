import { Link, useLocation } from 'react-router-dom';

type Props = {
  userName: string;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function Layout({ userName, onLogout, children }: Props) {
  const { pathname } = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/charts', label: 'Charts' },
    { to: '/alumni', label: 'Alumni' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📊</span>
          <span>University Analytics</span>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{userName}</span>
          <button onClick={onLogout} className="btn-logout">Sign out</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
