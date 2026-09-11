import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, MapPin, Loader2, Search, X } from 'lucide-react'

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export interface LocationData {
  lat: number
  lng: number
  label: string
}

interface SearchResult {
  lat: string
  lon: string
  display_name: string
  address: { city?: string; town?: string; village?: string; state?: string; country?: string }
}

interface LocationPickerProps {
  label: string
  placeholder?: string
  value: LocationData
  onChange: (val: LocationData) => void
  autoGps?: boolean    // auto-fetch GPS on mount
  hideGps?: boolean    // hide GPS button (for destination fields)
  allowMapClick?: boolean // let user click map to reposition pin
}

// Sub-component: recenter map when coords change
function MapReCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1 })
  }, [lat, lng, map])
  return null
}

// Sub-component: click on map to pick location
function MapClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ label, placeholder, value, onChange, autoGps = false, hideGps = false, allowMapClick = false }: LocationPickerProps) {
  const [query, setQuery] = useState(value.label || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingGps, setLoadingGps] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync external label changes to input
  useEffect(() => {
    setQuery(value.label || '')
  }, [value.label])

  // Auto-GPS on mount for origin field
  useEffect(() => {
    if (autoGps && !value.lat) {
      fetchGps()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchNominatim = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setShowDropdown(false); return }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data: SearchResult[] = await res.json()
      setResults(data)
      setShowDropdown(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    // Update label in parent immediately for typing
    onChange({ ...value, label: val, lat: 0, lng: 0 })
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchNominatim(val), 350)
  }

  const handleSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const cityLabel =
      result.address.city ||
      result.address.town ||
      result.address.village ||
      result.display_name.split(',')[0]
    
    const loc: LocationData = { lat, lng, label: cityLabel }
    onChange(loc)
    setQuery(cityLabel)
    setResults([])
    setShowDropdown(false)
    setShowMap(true)
  }

  const fetchGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser.')
      return
    }
    setLoadingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const cityLabel =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          
          const loc: LocationData = { lat: latitude, lng: longitude, label: cityLabel }
          onChange(loc)
          setQuery(cityLabel)
          setShowMap(true)
        } catch {
          onChange({ lat: latitude, lng: longitude, label: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` })
          setShowMap(true)
        } finally {
          setLoadingGps(false)
        }
      },
      (err) => {
        console.error(err)
        alert('Could not get location. Please allow location access in your browser settings.')
        setLoadingGps(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const clearLocation = () => {
    setQuery('')
    onChange({ lat: 0, lng: 0, label: '' })
    setResults([])
    setShowMap(false)
    setShowDropdown(false)
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', position: 'relative' }}>
      {/* Label Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="input-label" style={{ marginBottom: 0, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} /> {label}
        </label>
        {value.lat !== 0 && (
          <span style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
            ✓ Location set
          </span>
        )}
      </div>

      {/* Input Row */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none', zIndex: 2 }} />
          <input
            className="input-field"
            type="text"
            placeholder={placeholder || 'Type city or area…'}
            value={query}
            onChange={handleQueryChange}
            onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
            style={{ paddingLeft: 36, paddingRight: query ? 32 : 12 }}
            autoComplete="off"
          />
          {searching && (
            <Loader2 size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--indigo)', animation: 'spin 1s linear infinite' }} />
          )}
          {!searching && query && (
            <button
              type="button"
              onClick={clearLocation}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* GPS Button — only shown for origin/pickup */}
        {!hideGps && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={fetchGps}
            disabled={loadingGps}
            title="Use my live location"
            style={{ padding: '0 12px', minWidth: 44, height: 44, flexShrink: 0 }}
          >
            {loadingGps
              ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <Navigation size={16} />
            }
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'var(--glass-bg, #1a1a2e)',
          border: '1px solid var(--glass-border)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          marginTop: 4,
        }}>
          {results.map((r, i) => {
            const city = r.address.city || r.address.town || r.address.village
            const parts = r.display_name.split(',').slice(0, 3)
            return (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(r)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: i < results.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  transition: 'background 0.15s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <MapPin size={14} color="var(--indigo)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {city || parts[0]}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 1 }}>
                    {parts.slice(1).join(', ')}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Mini Map Preview */}
      {showMap && value.lat !== 0 && (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)', marginTop: 4, position: 'relative' }}>
          {allowMapClick && (
            <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 999, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '3px 8px', color: '#fff', fontSize: '0.68rem', pointerEvents: 'none' }}>
              📍 Tap map to reposition
            </div>
          )}
          <MapContainer
            center={[value.lat, value.lng]}
            zoom={13}
            style={{ height: 220, width: '100%', cursor: allowMapClick ? 'crosshair' : 'grab' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            <Marker position={[value.lat, value.lng]} />
            <MapReCenter lat={value.lat} lng={value.lng} />
            {allowMapClick && (
              <MapClickPicker
                onPick={async (lat, lng) => {
                  onChange({ ...value, lat, lng })
                  setQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
                      { headers: { 'Accept-Language': 'en' } }
                    )
                    const data = await res.json()
                    const lbl =
                      data.address?.city ||
                      data.address?.town ||
                      data.address?.village ||
                      data.address?.state ||
                      `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                    onChange({ lat, lng, label: lbl })
                    setQuery(lbl)
                  } catch { /* keep coords as label */ }
                }}
              />
            )}
          </MapContainer>
          <button
            type="button"
            onClick={() => setShowMap(false)}
            style={{ position: 'absolute', top: 6, right: 6, zIndex: 999, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#fff', cursor: 'pointer', fontSize: '0.72rem' }}
          >
            Hide
          </button>
        </div>
      )}
    </div>
  )
}
