export type HealthResponse = {
  status: string
}

export type ProfileRequest = {
  fullName: string
  email: string
}

export type CampaignRequest = {
  topic: string
  budget: number
}

export type ProfileSubmission = {
  id: number
  fullName: string
  email: string
  createdAt: string
}

export type CampaignSubmission = {
  id: number
  topic: string
  budget: number
  createdAt: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

type MessageResponse = {
  message: string
}

type LoginResponse = {
  message: string
  role: string
}

export type SessionResponse = {
  authenticated: boolean
  userId?: number
  role?: string
}

export type FeaturedAlumnus = {
  userId: number
  name: string
  bio?: string | null
  linkedinUrl?: string | null
  imageUrl?: string | null
  windowDate: string
}

type FeaturedAlumnusResponse = {
  featuredAlumnus: FeaturedAlumnus | null
}

type ApiErrorResponse = {
  error: string | Record<string, string[] | undefined>
}

type ProfileSubmissionListResponse = {
  items: ProfileSubmission[]
}

type CampaignSubmissionListResponse = {
  items: CampaignSubmission[]
}

const API_BASE_URL = 'http://localhost:3000'

async function readApiError(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as ApiErrorResponse
      if (typeof data.error === 'string') {
        return data.error
      }

      const messages = Object.values(data.error)
        .flatMap((value) => value ?? [])
        .filter((value) => value.length > 0)

      if (messages.length > 0) {
        return messages[0]
      }
    } catch {
      return fallback
    }
  }

  try {
    const text = await response.text()
    return text || fallback
  } catch {
    return fallback
  }
}

export async function getBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error('Backend health request failed')
  }

  return (await response.json()) as HealthResponse
}

export async function saveProfile(payload: ProfileRequest): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to save profile')
  }

  return (await response.json()) as MessageResponse
}

export async function saveCampaign(payload: CampaignRequest): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/campaign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to save campaign')
  }

  return (await response.json()) as MessageResponse
}

export async function getProfileSubmissions(): Promise<ProfileSubmission[]> {
  const response = await fetch(`${API_BASE_URL}/profile-submissions`)

  if (!response.ok) {
    throw new Error('Failed to load profile submissions')
  }

  const data = (await response.json()) as ProfileSubmissionListResponse
  return data.items
}

export async function getCampaignSubmissions(): Promise<CampaignSubmission[]> {
  const response = await fetch(`${API_BASE_URL}/campaign-submissions`)

  if (!response.ok) {
    throw new Error('Failed to load campaign submissions')
  }

  const data = (await response.json()) as CampaignSubmissionListResponse
  return data.items
}

export async function registerAlumni(payload: RegisterRequest): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Registration failed'))
  }

  return (await response.json()) as MessageResponse
}

export async function loginAlumni(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Login failed'))
  }

  return (await response.json()) as LoginResponse
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
  )

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Email verification failed'))
  }

  return (await response.json()) as MessageResponse
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Request failed'))
  }

  return (await response.json()) as MessageResponse
}

export async function resetPassword(token: string, password: string): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Reset failed'))
  }

  return (await response.json()) as MessageResponse
}

export async function getAuthSession(): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not check auth session')
  }

  return (await response.json()) as SessionResponse
}

export async function logoutAlumni(): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not log out')
  }

  return (await response.json()) as MessageResponse
}

export async function getTodayFeaturedAlumnus(): Promise<FeaturedAlumnus | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/alumni/today`)

  if (!response.ok) {
    throw new Error('Could not load featured alumnus')
  }

  const data = (await response.json()) as FeaturedAlumnusResponse
  return data.featuredAlumnus
}