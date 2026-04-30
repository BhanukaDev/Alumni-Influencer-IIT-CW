import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';
import {
  getSkillsGap, getTopCourses, getEmploymentBySector,
  getEmploymentByRole, getCertificationsOverTime,
  getAlumniByProgramme, getAlumniByGraduationYear,
} from '../services/analytics';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
);

const PALETTE = [
  '#4f86c6', '#f4845f', '#6bbf8e', '#f9c74f', '#9b72cf',
  '#e07b7b', '#5bc0be', '#f3722c', '#90be6d', '#577590',
];

type ChartEntry = { label: string; value: number };

function toEntries(arr: { name?: string; role?: string; sector?: string | null; programme?: string | null; year?: number | null; month?: string; count: number }[]): ChartEntry[] {
  return arr.map(item => ({
    label: String(item.name ?? item.role ?? item.sector ?? item.programme ?? item.year ?? item.month ?? 'Unknown'),
    value: item.count,
  }));
}

function barData(entries: ChartEntry[], label: string) {
  return {
    labels: entries.map(e => e.label),
    datasets: [{ label, data: entries.map(e => e.value), backgroundColor: PALETTE, borderRadius: 4 }],
  };
}

function pieData(entries: ChartEntry[]) {
  return {
    labels: entries.map(e => e.label),
    datasets: [{ data: entries.map(e => e.value), backgroundColor: PALETTE, borderWidth: 2 }],
  };
}

const barOpts = (title: string) => ({
  responsive: true,
  plugins: { legend: { display: false }, title: { display: true, text: title, font: { size: 14 } } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
});

const pieOpts = (title: string) => ({
  responsive: true,
  plugins: { legend: { position: 'right' as const }, title: { display: true, text: title, font: { size: 14 } } },
});

export default function ChartsPage() {
  const [skillsGap, setSkillsGap] = useState<ChartEntry[]>([]);
  const [topCourses, setTopCourses] = useState<ChartEntry[]>([]);
  const [bySector, setBySector] = useState<ChartEntry[]>([]);
  const [byRole, setByRole] = useState<ChartEntry[]>([]);
  const [certsOverTime, setCertsOverTime] = useState<ChartEntry[]>([]);
  const [byProgramme, setByProgramme] = useState<ChartEntry[]>([]);
  const [byYear, setByYear] = useState<ChartEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const handle = (err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load charts');

    Promise.all([
      getSkillsGap().then(d => setSkillsGap(toEntries(d))),
      getTopCourses().then(d => setTopCourses(toEntries(d))),
      getEmploymentBySector().then(d => setBySector(toEntries(d))),
      getEmploymentByRole().then(d => setByRole(toEntries(d))),
      getCertificationsOverTime().then(d => setCertsOverTime(d.map(x => ({ label: x.month, value: x.count })))),
      getAlumniByProgramme().then(d => setByProgramme(toEntries(d))),
      getAlumniByGraduationYear().then(d => setByYear(toEntries(d))),
    ]).catch(handle);
  }, []);

  if (error) return <div className="page-content"><p className="error">{error}</p></div>;

  const lineData = {
    labels: certsOverTime.map(e => e.label),
    datasets: [{
      label: 'Certifications',
      data: certsOverTime.map(e => e.value),
      borderColor: '#4f86c6',
      backgroundColor: 'rgba(79,134,198,0.15)',
      fill: true,
      tension: 0.4,
    }],
  };

  const radarData = {
    labels: skillsGap.slice(0, 8).map(e => e.label),
    datasets: [{
      label: 'Alumni acquiring certification',
      data: skillsGap.slice(0, 8).map(e => e.value),
      backgroundColor: 'rgba(79,134,198,0.2)',
      borderColor: '#4f86c6',
      pointBackgroundColor: '#4f86c6',
    }],
  };

  return (
    <div className="page-content">
      <h1 className="page-title">Analytics Charts</h1>
      <p className="page-subtitle">Trends and insights derived from alumni professional data</p>

      <div className="charts-grid">
        <div className="chart-card chart-wide">
          <Bar data={barData(skillsGap.slice(0, 10), 'Alumni count')} options={barOpts('Curriculum Skills Gap: Top Certifications Acquired Post-Graduation')} />
        </div>

        <div className="chart-card chart-wide">
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, title: { display: true, text: 'Certifications Acquired Over Time', font: { size: 14 } } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            }}
          />
        </div>

        <div className="chart-card">
          <Doughnut data={pieData(bySector)} options={pieOpts('Employment by Industry Sector')} />
        </div>

        <div className="chart-card">
          <Pie data={pieData(byProgramme)} options={pieOpts('Alumni by Programme')} />
        </div>

        <div className="chart-card chart-wide">
          <Bar data={barData(byRole.slice(0, 10), 'Alumni count')} options={barOpts('Top Employment Job Titles')} />
        </div>

        <div className="chart-card chart-wide">
          <Bar data={barData(topCourses.slice(0, 10), 'Alumni count')} options={barOpts('Top Employee Tools — Most Completed Courses')} />
        </div>

        <div className="chart-card">
          <Bar
            data={barData(byYear, 'Graduates')}
            options={barOpts('Alumni by Graduation Year')}
          />
        </div>

        <div className="chart-card">
          <Radar
            data={radarData}
            options={{
              responsive: true,
              plugins: { title: { display: true, text: 'Skills Distribution Radar', font: { size: 14 } } },
            }}
          />
        </div>
      </div>
    </div>
  );
}
