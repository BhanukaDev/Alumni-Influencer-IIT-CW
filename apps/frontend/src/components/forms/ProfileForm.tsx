import { useState } from 'react'
import {
  getProfileSubmissions,
  saveProfile,
  type ProfileSubmission,
} from '../../services/api'
import type { ProfileFormData } from '../../types/forms'

function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [items, setItems] = useState<ProfileSubmission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const latest = await getProfileSubmissions()
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

      const result = await saveProfile({
        fullName: formData.fullName,
        email: formData.email,
      })

      setMessage(result.message)
      await loadItems()
    } catch {
      setMessage('Could not save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Full Name
        <input
          value={formData.fullName}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, fullName: event.target.value }))
          }
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={formData.email}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, email: event.target.value }))
          }
        />
      </label>

      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Profile'}
      </button>

      {message ? <p>{message}</p> : null}

      <div className="list-section">
        <button type="button" onClick={() => void loadItems()} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load Recent Profiles'}
        </button>

        <ul className="saved-list">
          {items.map((item) => (
            <li key={item.id}>
              {item.fullName} ({item.email})
            </li>
          ))}
        </ul>
      </div>
    </form>
  )
}

export default ProfileForm