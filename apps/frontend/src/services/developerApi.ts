const API_BASE_URL = 'http://localhost:3000'

export type ApiKey = {
  id: number
  label: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

export type ApiKeyCreateResponse = {
  message: string
  key: string
  id: number
  label: string
  createdAt: string
}

export type ApiKeyListResponse = {
  keys: ApiKey[]
}

export type ApiKeyLog = {
  endpoint: string
  method: string
  accessedAt: string
}

export type ApiKeyStatsResponse = {
  id: number
  label: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
  totalRequests: number
  logs: ApiKeyLog[]
}

async function handleApiError(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as { error: string }
      return data.error || fallback
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

export async function createApiKey(label: string): Promise<ApiKeyCreateResponse> {
  const response = await fetch(`${API_BASE_URL}/developer/keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ label }),
  })

  if (!response.ok) {
    const error = await handleApiError(response, 'Failed to create API key')
    throw new Error(error)
  }

  return (await response.json()) as ApiKeyCreateResponse
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const response = await fetch(`${API_BASE_URL}/developer/keys`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await handleApiError(response, 'Failed to list API keys')
    throw new Error(error)
  }

  const data = (await response.json()) as ApiKeyListResponse
  return data.keys
}

export async function getApiKeyStats(keyId: number): Promise<ApiKeyStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/developer/keys/${keyId}/stats`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await handleApiError(response, 'Failed to get API key stats')
    throw new Error(error)
  }

  return (await response.json()) as ApiKeyStatsResponse
}

export async function revokeApiKey(keyId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/developer/keys/${keyId}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await handleApiError(response, 'Failed to revoke API key')
    throw new Error(error)
  }
}
