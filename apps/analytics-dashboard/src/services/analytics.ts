const BASE = '/api/v1/analytics';

function getKey(): string {
  return localStorage.getItem('analytics_api_key') ?? '';
}

function headers(): HeadersInit {
  return { Authorization: `Bearer ${getKey()}` };
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export type OverviewData = {
  alumni: number;
  certifications: number;
  courses: number;
  employments: number;
};

export type NameCount = { name: string; count: number };
export type LabelCount = { label: string; count: number };

export function getOverview() {
  return get<OverviewData>('/overview');
}

export function getSkillsGap() {
  return get<NameCount[]>('/skills-gap');
}

export function getTopCourses() {
  return get<NameCount[]>('/top-courses');
}

export function getEmploymentBySector() {
  return get<{ sector: string | null; count: number }[]>('/employment-by-sector');
}

export function getEmploymentByRole() {
  return get<{ role: string; count: number }[]>('/employment-by-role');
}

export function getCertificationsOverTime() {
  return get<{ month: string; count: number }[]>('/certifications-over-time');
}

export function getAlumniByProgramme() {
  return get<{ programme: string | null; count: number }[]>('/alumni-by-programme');
}

export function getAlumniByGraduationYear() {
  return get<{ year: number | null; count: number }[]>('/alumni-by-graduation-year');
}

export type AlumnusProfile = {
  id: number;
  programme: string | null;
  graduationYear: number | null;
  industrySector: string | null;
  user: { name: string | null; email: string };
  certifications: { name: string; issuer: string }[];
  courses: { name: string; provider: string }[];
  employments: { company: string; role: string; startDate: string; endDate: string | null }[];
};

export function getAlumni(filters: { programme?: string; graduationYear?: string; industrySector?: string }) {
  return get<{ alumni: AlumnusProfile[] }>('/alumni', {
    programme: filters.programme ?? '',
    graduationYear: filters.graduationYear ?? '',
    industrySector: filters.industrySector ?? '',
  });
}
