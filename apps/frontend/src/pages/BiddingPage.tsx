import { useEffect, useState } from 'react'
import {
  cancelBid,
  getBidHistory,
  getBiddingSlot,
  getBiddingStatus,
  getMonthlyLimit,
  placeBid,
  updateBid,
  type BidHistoryItem,
  type BiddingSlot,
  type BiddingStatus,
  type MonthlyLimit,
} from '../services/biddingApi'

function BiddingPage() {
  const [slot, setSlot] = useState<BiddingSlot | null>(null)
  const [status, setStatus] = useState<BiddingStatus | null>(null)
  const [monthlyLimit, setMonthlyLimit] = useState<MonthlyLimit | null>(null)
  const [history, setHistory] = useState<BidHistoryItem[]>([])
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadPage = async () => {
    try {
      setError('')
      const [slotData, statusData, limitData, historyData] = await Promise.all([
        getBiddingSlot(),
        getBiddingStatus(),
        getMonthlyLimit(),
        getBidHistory(),
      ])
      setSlot(slotData)
      setStatus(statusData)
      setMonthlyLimit(limitData)
      setHistory(historyData)
      setAmount(statusData.bid ? String(statusData.bid.amount) : '')
    } catch (loadError) {
      const text = loadError instanceof Error ? loadError.message : 'Could not load bidding page'
      setError(text)
    }
  }

  useEffect(() => {
    void loadPage()
  }, [])

  const onPlaceBid = async () => {
    try {
      setIsSaving(true)
      setMessage('')
      setError('')
      const result = await placeBid(Number(amount))
      setMessage(result.message)
      await loadPage()
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Could not place bid'
      setError(text)
    } finally {
      setIsSaving(false)
    }
  }

  const onUpdateBid = async () => {
    if (!status?.bid) return

    try {
      setIsSaving(true)
      setMessage('')
      setError('')
      const result = await updateBid(status.bid.id, Number(amount))
      setMessage(result.message)
      await loadPage()
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Could not update bid'
      setError(text)
    } finally {
      setIsSaving(false)
    }
  }

  const onCancelBid = async () => {
    if (!status?.bid) return

    try {
      setIsSaving(true)
      setMessage('')
      setError('')
      const result = await cancelBid(status.bid.id)
      setMessage(result.message)
      await loadPage()
    } catch (saveError) {
      const text = saveError instanceof Error ? saveError.message : 'Could not cancel bid'
      setError(text)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="page">
      <h1>Bidding</h1>

      {slot && (
        <section className="section">
          <h2>Tomorrow Slot</h2>
          <p>Window date: {slot.windowDate.slice(0, 10)}</p>
          <p>Closes at: {new Date(slot.closesAt).toLocaleString()}</p>
          <p>Open now: {slot.isOpen ? 'Yes' : 'No'}</p>
        </section>
      )}

      {monthlyLimit && (
        <section className="section">
          <h2>Monthly Limit</h2>
          <p>
            Used {monthlyLimit.used} of {monthlyLimit.max}. Remaining: {monthlyLimit.remaining}
          </p>
        </section>
      )}

      {status && (
        <section className="section">
          <h2>Your Status</h2>
          <p>Status: {status.status}</p>
          {status.bid && <p>Your amount: {status.bid.amount}</p>}
        </section>
      )}

      <section className="section">
        <h2>{status?.hasBid ? 'Update Your Bid' : 'Place a Bid'}</h2>
        <div className="form">
          <label htmlFor="bid-amount">Amount</label>
          <input
            id="bid-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <div className="button-row">
            {!status?.hasBid && (
              <button type="button" onClick={onPlaceBid} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Place Bid'}
              </button>
            )}
            {status?.hasBid && (
              <>
                <button type="button" onClick={onUpdateBid} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Update Bid'}
                </button>
                <button type="button" onClick={onCancelBid} disabled={isSaving}>
                  Cancel Bid
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <section className="section">
        <h2>Bid History</h2>
        <ul className="saved-list">
          {history.map((item) => (
            <li key={item.id}>
              {item.windowDate.slice(0, 10)} - {item.amount} - {item.status}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default BiddingPage
