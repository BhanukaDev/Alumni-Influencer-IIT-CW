import { useState } from 'react'
import {
  getCampaignSubmissions,
  saveCampaign,
  type CampaignSubmission,
} from '../../services/api'
import type { CampaignFormData } from '../../types/forms'

function CampaignForm() {
  const [formData, setFormData] = useState<CampaignFormData>({
    topic: '',
    budget: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [items, setItems] = useState<CampaignSubmission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const latest = await getCampaignSubmissions()
      setItems(latest)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSaving(true)
      setMessage('')

      const result = await saveCampaign({
        topic: formData.topic,
        budget: Number(formData.budget),
      })

      setMessage(result.message)
      await loadItems()
    } catch {
      setMessage('Could not save campaign')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Topic
        <input
          value={formData.topic}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, topic: event.target.value }))
          }
        />
      </label>

      <label>
        Budget
        <input
          type="number"
          min="0"
          value={formData.budget}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, budget: event.target.value }))
          }
        />
      </label>

      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Campaign'}
      </button>

      {message ? <p>{message}</p> : null}

      <div className="list-section">
        <button type="button" onClick={() => void loadItems()} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load Recent Campaigns'}
        </button>

        <ul className="saved-list">
          {items.map((item) => (
            <li key={item.id}>
              {item.topic} (Budget: {item.budget})
            </li>
          ))}
        </ul>
      </div>
    </form>
  )
}

export default CampaignForm