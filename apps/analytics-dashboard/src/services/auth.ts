const BASE = '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export function getSession() {
  return request<{ authenticated: boolean; userId?: number; role?: string; name?: string }>('/auth/session');
}

export function login(email: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function createApiKey(label: string, permissions: string[]) {
  return request<{ key: string; id: number }>('/developer/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, permissions }),
  });
}
