import React, { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, MapPin, Loader2 } from 'lucide-react'

// Fix default icon issue with Leaflet in React
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

export interface LocationData {
  lat: number
  lng: number
  label: string
}

interface LocationPickerProps {
  label: string
  placeholder?: string
  value: LocationData
  onChange: (val: LocationData) => void
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function LocationPicker({ label, placeholder, value, onChange }: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false)
  const [loadingGps, setLoadingGps] = useState(false)
  const mapRef = useRef<L.Map>(null)

  const defaultCenter: [number, number] = [20.5937, 78.9629] // India
  const center: [number, number] = value.lat && value.lng ? [value.lat, value.lng] : defaultCenter
  const zoom = value.lat && value.lng ? 12 : 4

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`)
      const data = await res.json()
      
      let locLabel = data.display_name
      if (data.address) {
        locLabel = data.address.city || data.address.town || data.address.state || data.display_name
      }
      onChange({ lat, lng, label: locLabel })
    } catch (err) {
      console.error('Reverse geocode failed:', err)
      onChange({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    }
  }

  const handleMapSelect = (lat: number, lng: number) => {
    onChange({ ...value, lat, lng })
    reverseGeocode(lat, lng)
  }

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLoadingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        onChange({ ...value, lat: latitude, lng: longitude })
        reverseGeocode(latitude, longitude)
        setShowMap(true)
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 13)
        }
        setLoadingGps(false)
      },
      (err) => {
        console.error(err)
        alert('Could not fetch live location. Please ensure location permissions are granted.')
        setLoadingGps(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <span>{label}</span>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <MapPin size={14} /> {showMap ? 'Hide Map' : 'Select on Map'}
        </button>
      </label>
      
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input-field"
          type="text"
          placeholder={placeholder || 'E.g. Mumbai'}
          required
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleLiveLocation}
          disabled={loadingGps}
          style={{ padding: '0 12px', minWidth: '44px' }}
          title="Use current location"
        >
          {loadingGps ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
        </button>
      </div>

      {showMap && (
        <div style={{ height: 250, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)', marginTop: 4 }}>
          <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {value.lat !== 0 && (
              <Marker position={[value.lat, value.lng]} />
            )}
            <MapClickHandler onLocationSelect={handleMapSelect} />
          </MapContainer>
        </div>
      )}
    </div>
  )
}
