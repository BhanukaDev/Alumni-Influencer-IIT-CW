import { useEffect, useState } from 'react'
import type { ApiKey, ApiKeyStatsResponse } from '../services/developerApi'
import {
  createApiKey,
  listApiKeys,
  getApiKeyStats,
  revokeApiKey,
} from '../services/developerApi'

type KeyWithStats = ApiKey & { stats?: ApiKeyStatsResponse; statsLoading?: boolean }

export default function DeveloperDashboardPage() {
  const [keys, setKeys] = useState<KeyWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ key: string; label: string } | null>(null)
  const [expandedKeyId, setExpandedKeyId] = useState<number | null>(null)

  const loadKeys = async () => {
    try {
      setError('')
      const loadedKeys = await listApiKeys()
      setKeys(loadedKeys)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadKeys()
  }, [])

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!label.trim()) {
      setError('Label is required')
      return
    }

    try {
      setIsCreating(true)
      setError('')
      const response = await createApiKey(label)
      setNewKey({ key: response.key, label: response.label })
      setLabel('')
      await loadKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleLoadStats = async (keyId: number) => {
    const keyIdx = keys.findIndex((k) => k.id === keyId)
    if (keyIdx === -1) return

    try {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === keyId ? { ...k, statsLoading: true } : k
        )
      )

      const stats = await getApiKeyStats(keyId)
      setKeys((prev) =>
        prev.map((k) =>
          k.id === keyId ? { ...k, stats, statsLoading: false } : k
        )
      )
      setExpandedKeyId(expandedKeyId === keyId ? null : keyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      setKeys((prev) =>
        prev.map((k) =>
          k.id === keyId ? { ...k, statsLoading: false } : k
        )
      )
    }
  }

  const handleRevoke = async (keyId: number) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return

    try {
      await revokeApiKey(keyId)
      await loadKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      alert('Failed to copy to clipboard')
    })
  }

  const isKeyRevoked = (key: KeyWithStats) => key.revokedAt !== null

  return (
    <main className="page">
      <h1>Developer API Keys</h1>

      {error && (
        <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', borderRadius: '4px', color: '#c00' }}>
          {error}
        </div>
      )}

      {newKey && (
        <div style={{ padding: '16px', marginBottom: '16px', backgroundColor: '#efe', borderRadius: '4px', border: '1px solid #0c0' }}>
          <h3>Key Created Successfully!</h3>
          <p>
            <strong>Store this key safely — it will not be shown again.</strong>
          </p>
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              marginBottom: '12px',
              fontFamily: 'monospace',
              fontSize: '14px',
              wordBreak: 'break-all',
            }}
          >
            {newKey.key}
          </div>
          <button
            type="button"
            onClick={() => {
              copyToClipboard(newKey.key)
              alert('Copied to clipboard!')
            }}
          >
            Copy to Clipboard
          </button>
          {' '}
          <button type="button" onClick={() => setNewKey(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2>Generate New Key</h2>
        <form onSubmit={handleCreateKey}>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="label">
              Key Label
              <input
                id="label"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., My App, Testing, Production"
                maxLength={100}
                style={{ display: 'block', marginTop: '4px', padding: '8px', width: '100%', maxWidth: '400px' }}
              />
            </label>
          </div>
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Generate Key'}
          </button>
        </form>
      </div>

      <div>
        <h2>Your API Keys</h2>
        {loading ? (
          <p>Loading keys...</p>
        ) : keys.length === 0 ? (
          <p>No API keys yet. Create one above to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Label</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Last Used</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{key.label}</strong>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {new Date(key.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {isKeyRevoked(key) ? (
                      <span style={{ color: '#c00', fontWeight: 'bold' }}>Revoked</span>
                    ) : (
                      <span style={{ color: '#0a0', fontWeight: 'bold' }}>Active</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      type="button"
                      onClick={() => void handleLoadStats(key.id)}
                      disabled={isKeyRevoked(key) || key.statsLoading}
                      style={{ marginRight: '8px' }}
                    >
                      {key.statsLoading ? 'Loading...' : expandedKeyId === key.id ? 'Hide Stats' : 'View Stats'}
                    </button>
                    {!isKeyRevoked(key) && (
                      <button
                        type="button"
                        onClick={() => void handleRevoke(key.id)}
                        style={{
                          backgroundColor: '#faa',
                          color: '#c00',
                          border: '1px solid #c00',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '4px',
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {expandedKeyId !== null && keys.find((k) => k.id === expandedKeyId)?.stats && (
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h3>Usage Statistics for {keys.find((k) => k.id === expandedKeyId)?.label}</h3>
          {(() => {
            const stats = keys.find((k) => k.id === expandedKeyId)?.stats
            if (!stats) return null
            return (
              <>
                <p>
                  <strong>Total Requests:</strong> {stats.totalRequests}
                </p>
                <p>
                  <strong>Last Used:</strong>{' '}
                  {stats.lastUsedAt
                    ? new Date(stats.lastUsedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </p>

                {stats.logs.length > 0 && (
                  <>
                    <h4>Recent Requests (Last 100)</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Endpoint</th>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Method</th>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.logs.map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '8px', fontSize: '13px', fontFamily: 'monospace' }}>
                              {log.endpoint}
                            </td>
                            <td style={{ padding: '8px', fontSize: '13px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  backgroundColor: log.method === 'GET' ? '#ddf' : log.method === 'POST' ? '#dfd' : '#ffd',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {log.method}
                              </span>
                            </td>
                            <td style={{ padding: '8px', fontSize: '13px', color: '#666' }}>
                              {new Date(log.accessedAt).toLocaleTimeString('en-US')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )
          })()}
        </div>
      )}
    </main>
  )
}
