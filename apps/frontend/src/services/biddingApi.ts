export type BiddingSlot = {
  windowDate: string
  opensAt: string
  closesAt: string
  isOpen: boolean
  hasBid: boolean
  bid: {
    id: number
    amount: number
    status: string
    createdAt: string
  } | null
}

export type BiddingStatus = {
  hasBid: boolean
  status: 'no-bid' | 'winning' | 'losing'
  windowDate: string
  bid?: {
    id: number
    amount: number
    createdAt: string
  }
}

export type MonthlyLimit = {
  used: number
  max: number
  remaining: number
}

export type BidHistoryItem = {
  id: number
  amount: number
  status: string
  windowDate: string
  createdAt: string
  updatedAt: string
}

type MessageResponse = {
  message: string
}

type BidMutationResponse = {
  message: string
  bid: BidHistoryItem
}

type PlaceBidResponse = {
  message: string
  bid: BidHistoryItem
  monthlyLimit: {
    appearancesUsed: number
    maxAppearances: number
    remaining: number
  }
}

type BidHistoryResponse = {
  items: BidHistoryItem[]
}

type ApiErrorResponse = {
  error: string | Record<string, string[] | undefined>
}

const API_BASE_URL = 'http://localhost:3000'

function readError(data: ApiErrorResponse, fallback: string): string {
  if (typeof data.error === 'string') {
    return data.error
  }

  const messages = Object.values(data.error)
    .flatMap((value) => value ?? [])
    .filter((value) => value.length > 0)

  return messages[0] ?? fallback
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const data = (await response.json()) as ApiErrorResponse
  throw new Error(readError(data, fallback))
}

export async function getBiddingSlot(): Promise<BiddingSlot> {
  const response = await fetch(`${API_BASE_URL}/bidding/slot`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not load bidding slot')
  }

  return (await response.json()) as BiddingSlot
}

export async function getBiddingStatus(): Promise<BiddingStatus> {
  const response = await fetch(`${API_BASE_URL}/bidding/status`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not load bidding status')
  }

  return (await response.json()) as BiddingStatus
}

export async function getMonthlyLimit(): Promise<MonthlyLimit> {
  const response = await fetch(`${API_BASE_URL}/bidding/monthly-limit`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not load monthly limit')
  }

  return (await response.json()) as MonthlyLimit
}

export async function getBidHistory(): Promise<BidHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/bidding/history`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not load bid history')
  }

  const data = (await response.json()) as BidHistoryResponse
  return data.items
}

export async function placeBid(amount: number): Promise<PlaceBidResponse> {
  const response = await fetch(`${API_BASE_URL}/bidding`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  })

  if (!response.ok) {
    return parseError(response, 'Could not place bid')
  }

  return (await response.json()) as PlaceBidResponse
}

export async function updateBid(id: number, amount: number): Promise<BidMutationResponse> {
  const response = await fetch(`${API_BASE_URL}/bidding/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  })

  if (!response.ok) {
    return parseError(response, 'Could not update bid')
  }

  return (await response.json()) as BidMutationResponse
}

export async function cancelBid(id: number): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/bidding/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    return parseError(response, 'Could not cancel bid')
  }

  return (await response.json()) as MessageResponse
}
