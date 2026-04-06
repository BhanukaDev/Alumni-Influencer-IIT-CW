import { useEffect, useState } from 'react'
import BackendStatus from '../components/BackendStatus'
import { getTodayFeaturedAlumnus, type FeaturedAlumnus } from '../services/api'

function HomePage() {
  const [featuredAlumnus, setFeaturedAlumnus] = useState<FeaturedAlumnus | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFeaturedAlumnus = async () => {
      try {
        setError('')
        const featured = await getTodayFeaturedAlumnus()
        setFeaturedAlumnus(featured)
      } catch (loadError) {
        const text = loadError instanceof Error ? loadError.message : 'Could not load featured alumnus'
        setError(text)
      }
    }

    void loadFeaturedAlumnus()
  }, [])

  return (
    <main className="page">
      <h1>Alumni Influencer</h1>
      <p>Register, build your alumni profile, and bid to become Alumni of the Day.</p>

      <BackendStatus />

      <section className="section">
        <h2>Featured Alumnus Today</h2>
        {!featuredAlumnus && !error && <p>No winner selected yet for today.</p>}
        {error && <p>{error}</p>}
        {featuredAlumnus && (
          <div className="list-section">
            <p>Name: {featuredAlumnus.name}</p>
            <p>Featured date: {featuredAlumnus.windowDate.slice(0, 10)}</p>
            {featuredAlumnus.bio && <p>Bio: {featuredAlumnus.bio}</p>}
            {featuredAlumnus.linkedinUrl && (
              <p>
                LinkedIn: <a href={featuredAlumnus.linkedinUrl}>{featuredAlumnus.linkedinUrl}</a>
              </p>
            )}
            {featuredAlumnus.imageUrl && (
              <p>
                Image: <a href={featuredAlumnus.imageUrl}>{featuredAlumnus.imageUrl}</a>
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default HomePage