import { useEffect, useState } from 'react';
import { getOverview, type OverviewData } from '../services/analytics';

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  const stats = data
    ? [
        { label: 'Total Alumni', value: data.alumni },
        { label: 'Certifications', value: data.certifications },
        { label: 'Courses Completed', value: data.courses },
        { label: 'Employment Records', value: data.employments },
      ]
    : [];

  return (
    <div className="page-content">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of alumni data and activity</p>

      {error && <p className="error">{error}</p>}

      {!data && !error && <p className="loading">Loading...</p>}

      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <span className="stat-value">{stat.value.toLocaleString()}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <h2>About this dashboard</h2>
        <p>
          This dashboard provides real-time intelligence derived from alumni professional profiles.
          Use the <strong>Charts</strong> section to explore curriculum gaps, career pathways, and
          certification trends. Use <strong>Alumni</strong> to browse and filter individual profiles.
        </p>
        <ul>
          <li>Data is sourced directly from alumni-maintained profiles</li>
          <li>Charts update in real time as alumni add new credentials</li>
          <li>Use filters on the Alumni page to segment by programme, graduation year, or sector</li>
        </ul>
      </div>
    </div>
  );
}
