import { useEffect, useState } from 'react'
import {
  getAuthSession,
  getTodayFeaturedAlumnus,
  type FeaturedAlumnus,
  type FeaturedAlumnusResponse,
} from '../services/api'

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || 'A'
}

function FeaturedAlumnusCard({
  alumnus,
  headline,
  showName = true,
}: {
  alumnus: FeaturedAlumnus
  headline: string
  showName?: boolean
}) {
  return (
    <div className="list-section" style={{ padding: '20px' }}>
      <div className="featured-alumnus-header" style={{ marginBottom: '16px' }}>
        <span className="featured-alumnus-avatar" aria-hidden="true">
          {alumnus.imageUrl ? (
            <img src={alumnus.imageUrl} alt="" className="featured-alumnus-avatar-image" />
          ) : (
            getInitials(alumnus.name)
          )}
        </span>
        <div className="featured-alumnus-meta">
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{headline}</p>
          {showName && <p style={{ marginBottom: '4px' }}>Name: {alumnus.name}</p>}
          <p style={{ color: '#666', fontSize: '14px' }}>Featured date: {alumnus.windowDate.slice(0, 10)}</p>
        </div>
      </div>
      {alumnus.bio && <p style={{ marginBottom: '8px' }}>Bio: {alumnus.bio}</p>}
      {alumnus.linkedinUrl && (
        <p style={{ marginBottom: '8px' }}>
          LinkedIn: <a href={alumnus.linkedinUrl}>{alumnus.linkedinUrl}</a>
        </p>
      )}
      {alumnus.imageUrl && (
        <p style={{ marginBottom: '8px' }}>
          Image: <a href={alumnus.imageUrl}>{alumnus.imageUrl}</a>
        </p>
      )}
    </div>
  )
}

function HomePage() {
  const [featuredState, setFeaturedState] = useState<FeaturedAlumnusResponse | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFeaturedAlumnus = async () => {
      try {
        setError('')
        const [featured, session] = await Promise.all([getTodayFeaturedAlumnus(), getAuthSession()])
        setFeaturedState(featured)
        setCurrentUserId(session.authenticated ? session.userId ?? null : null)
      } catch (loadError) {
        const text = loadError instanceof Error ? loadError.message : 'Could not load featured alumnus'
        setError(text)
      }
    }

    void loadFeaturedAlumnus()
  }, [])

  const featuredAlumnus: FeaturedAlumnus | null = featuredState?.featuredAlumnus ?? null
  const upcomingAlumnus: FeaturedAlumnus | null = featuredState?.upcomingAlumnus ?? null
  const isCurrentUserFeatured = featuredAlumnus ? featuredAlumnus.userId === currentUserId : false
  const isCurrentUserUpcoming = upcomingAlumnus ? upcomingAlumnus.userId === currentUserId : false

  return (
    <main className="page">
      <h1>Alumni Influencer</h1>
      <p style={{ marginBottom: '32px' }}>Register, build your alumni profile, and bid to become Alumni of the Day.</p>

      <section className="section" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Featured Alumnus Today</h2>
        {!featuredAlumnus && !error && (
          <div className="list-section" style={{ padding: '20px' }}>
            <p style={{ marginBottom: '16px' }}>No winner selected yet for today.</p>
            {upcomingAlumnus ? (
              <FeaturedAlumnusCard
                alumnus={upcomingAlumnus}
                headline={
                  isCurrentUserUpcoming
                    ? "You won tomorrow's Alumni spotlight. Nice one!"
                    : "Tomorrow's winner is already selected"
                }
                showName={!isCurrentUserUpcoming}
              />
            ) : (
              <p>Bidding closes at 6:00 PM, and the winner appears for the following day.</p>
            )}
          </div>
        )}
        {error && <p style={{ color: '#c00', marginTop: '8px' }}>{error}</p>}
        {featuredAlumnus && (
          <FeaturedAlumnusCard
            alumnus={featuredAlumnus}
            headline={
              isCurrentUserFeatured
                ? "You won today's Alumni spotlight. Enjoy your feature!"
                : 'Featured alumnus'
            }
            showName={!isCurrentUserFeatured}
          />
        )}
      </section>
    </main>
  )
}

export default HomePage