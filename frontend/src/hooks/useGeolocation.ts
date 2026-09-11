import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(watch = false) {
  const [state, setState] = useState<GeolocationState>({ lat: null, lng: null, accuracy: null, error: null, loading: false })

  const fetch = useCallback(() => {
    if (!navigator.geolocation) { setState(s => ({ ...s, error: 'Geolocation not supported' })); return }
    setState(s => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, error: null, loading: false }),
      (err) => setState(s => ({ ...s, error: err.message, loading: false })),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  useEffect(() => {
    if (!watch) { fetch(); return }
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      (pos) => setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, error: null, loading: false }),
      (err) => setState(s => ({ ...s, error: err.message })),
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [watch, fetch])

  return { ...state, refetch: fetch }
}
