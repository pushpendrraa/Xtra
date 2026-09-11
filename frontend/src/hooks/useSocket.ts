import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

type EventMap = Record<string, (...args: unknown[]) => void>

export function useSocket(events: EventMap) {
  const sockRef = useRef<Socket | null>(null)

  useEffect(() => {
    // In production: connect to real backend
    // For demo: simulate socket events locally
    const sock = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      autoConnect: false,
      reconnectionAttempts: 3,
    })
    sockRef.current = sock

    Object.entries(events).forEach(([event, handler]) => sock.on(event, handler))

    // Simulate a live match offer after 5s in demo mode
    const t1 = setTimeout(() => { events['match:new']?.({ id: 'demo', score: 0.88 }) }, 5000)

    return () => {
      clearTimeout(t1)
      Object.entries(events).forEach(([event, handler]) => sock.off(event, handler))
      sock.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return sockRef.current
}
