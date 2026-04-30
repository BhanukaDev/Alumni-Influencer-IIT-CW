import { useEffect, useState } from 'react';
import { getAlumni, type AlumnusProfile } from '../services/analytics';

const PROGRAMMES = ['Computer Science', 'Software Engineering', 'Business Management', 'Data Science', 'Cybersecurity', 'Information Technology'];
const SECTORS = ['Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'E-commerce'];
const YEARS = ['2020', '2021', '2022', '2023', '2024'];

function exportCsv(alumni: AlumnusProfile[]) {
  const rows = [
    ['Name', 'Email', 'Programme', 'Graduation Year', 'Industry Sector', 'Certifications', 'Courses', 'Current Role', 'Company'],
    ...alumni.map(a => [
      a.user.name ?? '',
      a.user.email,
      a.programme ?? '',
      String(a.graduationYear ?? ''),
      a.industrySector ?? '',
      a.certifications.map(c => c.name).join('; '),
      a.courses.map(c => c.name).join('; '),
      a.employments[0]?.role ?? '',
      a.employments[0]?.company ?? '',
    ]),
  ];

  const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'alumni-export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<AlumnusProfile[]>([]);
  const [programme, setProgramme] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [industrySector, setIndustrySector] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      setError('');
      try {
        const { alumni: data } = await getAlumni({ programme, graduationYear, industrySector });
        setAlumni(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alumni');
      } finally {
        setLoading(false);
      }
    };
    void fetchAlumni();
  }, [programme, graduationYear, industrySector]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alumni</h1>
          <p className="page-subtitle">{alumni.length} records</p>
        </div>
        <button className="btn-export" onClick={() => exportCsv(alumni)} disabled={alumni.length === 0}>
          Export CSV
        </button>
      </div>

      <div className="filters">
        <select value={programme} onChange={e => setProgramme(e.target.value)}>
          <option value="">All programmes</option>
          {PROGRAMMES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={graduationYear} onChange={e => setGraduationYear(e.target.value)}>
          <option value="">All years</option>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
        <select value={industrySector} onChange={e => setIndustrySector(e.target.value)}>
          <option value="">All sectors</option>
          {SECTORS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading...</p>}

      {!loading && (
        <div className="table-wrapper">
          <table className="alumni-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Programme</th>
                <th>Grad Year</th>
                <th>Sector</th>
                <th>Current Role</th>
                <th>Certifications</th>
              </tr>
            </thead>
            <tbody>
              {alumni.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="alumni-name">{a.user.name ?? a.user.email}</div>
                    <div className="alumni-email">{a.user.email}</div>
                  </td>
                  <td>{a.programme ?? '—'}</td>
                  <td>{a.graduationYear ?? '—'}</td>
                  <td>{a.industrySector ?? '—'}</td>
                  <td>
                    {a.employments[0]
                      ? `${a.employments[0].role} @ ${a.employments[0].company}`
                      : '—'}
                  </td>
                  <td>
                    <div className="cert-tags">
                      {a.certifications.slice(0, 3).map(c => (
                        <span key={c.name} className="cert-tag">{c.name}</span>
                      ))}
                      {a.certifications.length > 3 && (
                        <span className="cert-tag cert-more">+{a.certifications.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {alumni.length === 0 && !loading && (
                <tr><td colSpan={6} className="empty">No alumni found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
