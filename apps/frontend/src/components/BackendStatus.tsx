import { useSyncExternalStore } from 'react'
import { getBackendHealth } from '../services/api'

let backendStatus = 'Checking...'
const listeners = new Set<() => void>()

const emitStatusChange = () => {
  listeners.forEach((listener) => {
    listener()
  })
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => backendStatus

const refreshBackendStatus = async () => {
  backendStatus = 'Checking...'
  emitStatusChange()

  try {
    const health = await getBackendHealth()
    backendStatus = health.status
  } catch {
    backendStatus = 'unreachable'
  }

  emitStatusChange()
}

void refreshBackendStatus()

function BackendStatus() {
  const status = useSyncExternalStore(subscribe, getSnapshot)

  return (
    <section className="section">
      <h2>Backend</h2>
      <p>Status: {status}</p>
      <button type="button" onClick={() => void refreshBackendStatus()}>
        Re-check
      </button>
    </section>
  )
}

export default BackendStatus