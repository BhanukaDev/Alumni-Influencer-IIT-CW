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

type MessageResponse = {
  message: string
}

type ProfileSubmissionListResponse = {
  items: ProfileSubmission[]
}

type CampaignSubmissionListResponse = {
  items: CampaignSubmission[]
}

const API_BASE_URL = 'http://localhost:3000'

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