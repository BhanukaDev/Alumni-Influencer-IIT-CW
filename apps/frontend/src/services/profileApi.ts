export type Degree = {
  id: number
  name: string
  university: string
  url?: string | null
  completionDate?: string | null
}

export type Certification = {
  id: number
  name: string
  issuer: string
  url?: string | null
  completionDate?: string | null
}

export type Licence = {
  id: number
  name: string
  body: string
  url?: string | null
  completionDate?: string | null
}

export type Course = {
  id: number
  name: string
  provider: string
  url?: string | null
  completionDate?: string | null
}

export type Employment = {
  id: number
  company: string
  role: string
  startDate: string
  endDate?: string | null
}

export type Profile = {
  id: number
  bio?: string | null
  linkedinUrl?: string | null
  imageUrl?: string | null
  degrees: Degree[]
  certifications: Certification[]
  licences: Licence[]
  courses: Course[]
  employments: Employment[]
}

type MessageResponse = {
  message: string
}

type ProfileResponse = {
  profile: Profile
}

type CompletionResponse = {
  completion: number
  missing: string[]
}

type ApiErrorResponse = {
  error: string | Record<string, string[] | undefined>
}

const API_BASE_URL = 'http://localhost:3000'

function readError(data: ApiErrorResponse, fallback: string): string {
  if (typeof data.error === 'string') return data.error

  const messages = Object.values(data.error)
    .flatMap((value) => value ?? [])
    .filter((value) => value.length > 0)

  return messages[0] ?? fallback
}

export async function getMyProfile(): Promise<Profile | null> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    credentials: 'include',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Could not load profile')
  }

  const data = (await response.json()) as ProfileResponse
  return data.profile
}

export async function createProfile(payload: {
  bio?: string
  linkedinUrl?: string
  imageUrl?: string
}): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not create profile'))
  }

  const data = (await response.json()) as ProfileResponse
  return data.profile
}

export async function updateProfile(payload: { bio?: string; linkedinUrl?: string }): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not update profile'))
  }

  const data = (await response.json()) as ProfileResponse
  return data.profile
}

export async function updateProfileImage(imageUrl: string): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/profile/image`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not update image'))
  }

  const data = (await response.json()) as ProfileResponse
  return data.profile
}

export async function getProfileCompletion(): Promise<CompletionResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/completion`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not load completion status')
  }

  return (await response.json()) as CompletionResponse
}

export async function createDegree(payload: {
  name: string
  university: string
  url?: string
  completionDate?: string
}): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/degrees`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not add degree'))
  }

  return (await response.json()) as MessageResponse
}

export async function deleteDegree(id: number): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/degrees/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not delete degree')
  }

  return (await response.json()) as MessageResponse
}

export async function createCertification(payload: {
  name: string
  issuer: string
  url?: string
  completionDate?: string
}): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/certifications`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not add certification'))
  }

  return (await response.json()) as MessageResponse
}

export async function deleteCertification(id: number): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/certifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not delete certification')
  }

  return (await response.json()) as MessageResponse
}

export async function createLicence(payload: {
  name: string
  body: string
  url?: string
  completionDate?: string
}): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/licences`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not add licence'))
  }

  return (await response.json()) as MessageResponse
}

export async function deleteLicence(id: number): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/licences/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not delete licence')
  }

  return (await response.json()) as MessageResponse
}

export async function createCourse(payload: {
  name: string
  provider: string
  url?: string
  completionDate?: string
}): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/courses`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not add course'))
  }

  return (await response.json()) as MessageResponse
}

export async function deleteCourse(id: number): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/courses/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not delete course')
  }

  return (await response.json()) as MessageResponse
}

export async function createEmployment(payload: {
  company: string
  role: string
  startDate: string
  endDate?: string
}): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/employments`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = (await response.json()) as ApiErrorResponse
    throw new Error(readError(data, 'Could not add employment'))
  }

  return (await response.json()) as MessageResponse
}

export async function deleteEmployment(id: number): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/employments/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not delete employment')
  }

  return (await response.json()) as MessageResponse
}
