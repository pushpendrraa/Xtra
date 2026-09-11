import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Truck, Calendar, DollarSign, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'
import { api } from '../../services/api'

const VEHICLE_TYPES = ['Mini Truck', 'Tata Ace', 'Mahindra Bolero', 'Eicher 17ft', 'Eicher 20ft', 'Container 40ft']
const CARGO_FEATURES = ['Refrigerated', 'Fragile Handling', 'Hazmat Certified', 'Open Body', 'Closed Body']

// ── City coordinate lookup (expandable) ──────────────────────────
// Maps city name keywords → [lat, lng]
const CITY_COORDS: Record<string, [number, number]> = {
  'mumbai':     [19.0760, 72.8777],
  'pune':       [18.5204, 73.8567],
  'delhi':      [28.6139, 77.2090],
  'gurgaon':    [28.4595, 77.0266],
  'gurugram':   [28.4595, 77.0266],
  'bangalore':  [12.9716, 77.5946],
  'bengaluru':  [12.9716, 77.5946],
  'hyderabad':  [17.3850, 78.4867],
  'chennai':    [13.0827, 80.2707],
  'kolkata':    [22.5726, 88.3639],
  'ahmedabad':  [23.0225, 72.5714],
  'surat':      [21.1702, 72.8311],
  'jaipur':     [26.9124, 75.7873],
  'lucknow':    [26.8467, 80.9462],
  'nagpur':     [21.1458, 79.0882],
  'indore':     [22.7196, 75.8577],
  'bhopal':     [23.2599, 77.4126],
  'chandigarh': [30.7333, 76.7794],
  'patna':      [25.5941, 85.1376],
  'kochi':      [9.9312,  76.2673],
  'coimbatore': [11.0168, 76.9558],
  'nashik':     [19.9975, 73.7898],
  'vadodara':   [22.3072, 73.1812],
  'agra':       [27.1767, 78.0081],
  'varanasi':   [25.3176, 82.9739],
  'thane':      [19.2183, 72.9781],
  'andheri':    [19.1136, 72.8697],
  'bandra':     [19.0596, 72.8295],
  'vashi':      [19.0773, 73.0060],
}

/**
 * Fuzzy-match a typed city string to known coordinates.
 * Returns [lat, lng] or a default (Delhi) if not found.
 */
function resolveCoords(cityStr: string): [number, number] {
  const lower = cityStr.toLowerCase()
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords
  }
  // Default fallback — center of India
  return [20.5937, 78.9629]
}

export default function PostListing() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    origin: 'Mumbai Central',
    destination: 'Pune MIDC',
    vehicleType: 'Eicher 17ft',
    weightKg: 2500,
    volumeM3: 16,
    priceFloor: 6500,
    departureWindowStart: '',
    departureWindowEnd: '',
    expectedArrivalTime: '',
    features: ['Closed Body'] as string[],
  })

  // Prevent accessing if already have an active listing
  useEffect(() => {
    api.get('/api/capacity-listings')
      .then(res => {
        const hasActive = res.data.data.some((l: any) => ['open', 'partially_matched'].includes(l.status))
        if (hasActive) {
          navigate('/carrier/listings')
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [navigate])

  const toggleFeature = (f: string) =>
    setForm(p => ({ ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f] }))

  const estimatedTripsMatched = 4
  const estimatedRevenue = Math.round(form.priceFloor * 1.35)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitted(true)

    try {
      const [originLat, originLng]  = resolveCoords(form.origin)
      const [destLat,   destLng]    = resolveCoords(form.destination)

      const now = new Date()
      const payload = {
        origin: {
          lat:   originLat,
          lng:   originLng,
          label: form.origin,
        },
        destination: {
          lat:   destLat,
          lng:   destLng,
          label: form.destination,
        },
        vehicleType:          form.vehicleType,
        availableWeightKg:    form.weightKg,
        availableVolumeM3:    form.volumeM3,
        priceFloor:           form.priceFloor,
        departureWindowStart: form.departureWindowStart
          ? new Date(form.departureWindowStart).toISOString()
          : now.toISOString(),
        departureWindowEnd: form.departureWindowEnd
          ? new Date(form.departureWindowEnd).toISOString()
          : new Date(now.getTime() + 8 * 3600 * 1000).toISOString(),
        expectedArrivalTime: form.expectedArrivalTime
          ? new Date(form.expectedArrivalTime).toISOString()
          : undefined,
        features: form.features.map(f =>
          f === 'Refrigerated'     ? 'refrigerated'  :
          f === 'Hazmat Certified' ? 'hazmat_certified' :
          f.toLowerCase().replace(/\s+/g, '_')
        ),
        autoAccept: false,
      }

      await api.post('/api/capacity-listings', payload)

      // Brief pause so animation is visible
      await new Promise(r => setTimeout(r, 1200))
      navigate('/carrier/listings')
    } catch (err: any) {
      console.error('PostListing error:', err)
      setError(err?.response?.data?.message || 'Failed to post listing. Please try again.')
      setSubmitted(false)
    }
  }

  if (submitted) return (
    <PageShell title="Posting Capacity">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--emerald), #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}
        >
          ✓
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Return Leg Capacity Listed!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Matching engine is pairing your truck with active shipper loads…</p>
        </div>
        {/* Animated route line */}
        <motion.div style={{ width: 280, height: 4, borderRadius: 4, background: 'var(--glass-border)', overflow: 'hidden' }}>
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 280 }}
            transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
            style={{ width: 120, height: '100%', background: 'linear-gradient(90deg, transparent, var(--emerald), transparent)', borderRadius: 4 }}
          />
        </motion.div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Scanning {form.origin} → {form.destination}</p>
      </div>
    </PageShell>
  )

  if (loading) return (
    <PageShell title="List Empty Capacity">
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Checking eligibility...</div>
    </PageShell>
  )

  return (
    <PageShell title="List Empty Capacity" subtitle="Turn empty deadhead miles into profit">
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="responsive-split-2">

          {/* Left Column: Form Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Route */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--indigo)" /> Empty Return Route
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Origin City / Hub</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Mumbai Central"
                    required
                    value={form.origin}
                    onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Destination City / Hub</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Pune MIDC"
                    required
                    value={form.destination}
                    onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Vehicle & Space */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} color="var(--indigo)" /> Vehicle & Available Capacity
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Vehicle Class</label>
                  <select
                    className="input-field"
                    required
                    value={form.vehicleType}
                    onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select vehicle type</option>
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                {/* Weight slider */}
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Available Weight <span><strong style={{ color: 'var(--indigo)', fontSize: '0.95rem' }}>{form.weightKg.toLocaleString()}</strong> kg</span>
                  </label>
                  <input className="slider" type="range" min={100} max={20000} step={100} value={form.weightKg}
                    onChange={e => setForm(p => ({ ...p, weightKg: Number(e.target.value) }))} />
                </div>

                {/* Volume slider */}
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Available Volume <span><strong style={{ color: 'var(--indigo)', fontSize: '0.95rem' }}>{form.volumeM3}</strong> m³</span>
                  </label>
                  <input className="slider" type="range" min={1} max={80} step={0.5} value={form.volumeM3}
                    onChange={e => setForm(p => ({ ...p, volumeM3: Number(e.target.value) }))} />
                </div>
              </div>
            </GlassCard>

            {/* Departure & Arrival Window */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="var(--indigo)" /> Schedule
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Expected Start (Origin)</label>
                  <input className="input-field" type="datetime-local" value={form.departureWindowStart}
                    onChange={e => setForm(p => ({ ...p, departureWindowStart: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Expected Arrival (Dest)</label>
                  <input className="input-field" type="datetime-local" value={form.expectedArrivalTime}
                    onChange={e => setForm(p => ({ ...p, expectedArrivalTime: e.target.value }))} required />
                </div>
              </div>
            </GlassCard>

            {/* Cargo Features */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} color="var(--indigo)" /> Cargo Capabilities
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {CARGO_FEATURES.map(f => (
                  <button
                    key={f} type="button"
                    onClick={() => toggleFeature(f)}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700,
                      border: `1.5px solid ${form.features.includes(f) ? 'var(--indigo)' : 'var(--glass-border)'}`,
                      background: form.features.includes(f) ? 'rgba(79,70,229,0.12)' : 'transparent',
                      color: form.features.includes(f) ? 'var(--indigo)' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.18s',
                    }}
                  >{f}</button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Pricing + Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={18} color="var(--indigo)" /> Pricing
              </p>
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Price Floor <span><strong style={{ color: 'var(--indigo)' }}>₹{form.priceFloor.toLocaleString()}</strong></span>
                </label>
                <input className="slider" type="range" min={500} max={50000} step={100} value={form.priceFloor}
                  onChange={e => setForm(p => ({ ...p, priceFloor: Number(e.target.value) }))} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
                  You won't be matched below this rate. Xtra adds a 12% platform fee on top.
                </p>
              </div>
            </GlassCard>

            {/* Forecast card */}
            <GlassCard variant="carrier" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(79,70,229,0.07), rgba(99,102,241,0.04))' }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} color="var(--indigo)" /> AI Revenue Forecast
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Estimated matches', value: estimatedTripsMatched },
                  { label: 'Expected revenue', value: `₹${estimatedRevenue.toLocaleString()}` },
                  { label: 'CO₂ saved (est.)', value: `${Math.round(form.weightKg * 0.06)} kg` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{r.label}</span>
                    <strong style={{ color: 'var(--indigo)', fontSize: '1.05rem' }}>{r.value}</strong>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Sparkles size={18} color="var(--amber)" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Route will be automatically built</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Xtra builds the optimal road route for <strong>{form.origin} → {form.destination}</strong> and indexes it for instant matching with shippers.
              </p>
            </GlassCard>

            {/* Error */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--rose)', fontSize: '0.88rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-indigo" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800, boxShadow: '0 4px 20px rgba(79,70,229,0.35)' }}>
              <Truck size={20} /> List My Empty Leg Route
            </button>
          </div>

        </div>
      </form>
    </PageShell>
  )
}
