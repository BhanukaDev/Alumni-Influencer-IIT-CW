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

function BackendStatusIndicator() {
  const status = useSyncExternalStore(subscribe, getSnapshot)
  const statusClassName = status === 'ok' ? 'backend-status-indicator is-ok' : 'backend-status-indicator is-warning'

  return (
    <button
      type="button"
      className={statusClassName}
      title={`Backend status: ${status}`}
      aria-label={`Backend status: ${status}`}
      onClick={() => void refreshBackendStatus()}
    />
  )
}

export default BackendStatusIndicator