import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ArrowLeft, Plus, Minus, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'

const VEHICLE_TYPES = ['Mini Truck', 'Tata Ace', 'Mahindra Bolero', 'Eicher 17ft', 'Eicher 20ft', 'Container 40ft']
const CARGO_FEATURES = ['Refrigerated', 'Fragile Handling', 'Hazmat Certified', 'Open Body', 'Closed Body']

export default function PostListing() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    origin: '', destination: '', vehicleType: '', weightKg: 1000, volumeM3: 8,
    priceFloor: 3000, departureWindowStart: '', departureWindowEnd: '', features: [] as string[],
  })

  const toggleFeature = (f: string) =>
    setForm(p => ({ ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f] }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    await new Promise(r => setTimeout(r, 1200))
    navigate('/carrier/matches')
  }

  if (submitted) return (
    <PageShell title="Posting Listing">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 40px rgba(16,185,129,0.5)' }}>
          ✓
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Listing Posted!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Matching engine is scanning shipments…</p>
        </div>
      </div>
    </PageShell>
  )

  return (
    <PageShell title="Post Capacity" subtitle="List your empty-leg space">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Route */}
        <GlassCard variant="carrier" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} color="#818CF8" /> Route
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Origin City / Address</label>
              <input className="input-field" type="text" placeholder="Mumbai" required
                value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Destination City / Address</label>
              <input className="input-field" type="text" placeholder="Pune" required
                value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
            </div>
          </div>
        </GlassCard>

        {/* Vehicle */}
        <GlassCard variant="carrier" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>🚛 Vehicle & Capacity</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Vehicle Type</label>
              <select className="input-field" required value={form.vehicleType}
                onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}
                style={{ appearance: 'none', cursor: 'pointer' }}>
                <option value="">Select vehicle type</option>
                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Weight slider */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Available Weight <span style={{ color: 'var(--indigo-bright)' }}>{form.weightKg.toLocaleString()} kg</span>
              </label>
              <input type="range" min={100} max={10000} step={100} value={form.weightKg}
                onChange={e => setForm(p => ({ ...p, weightKg: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--indigo)' }} />
            </div>

            {/* Volume slider */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Available Volume <span style={{ color: 'var(--indigo-bright)' }}>{form.volumeM3} m³</span>
              </label>
              <input type="range" min={1} max={80} step={1} value={form.volumeM3}
                onChange={e => setForm(p => ({ ...p, volumeM3: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--indigo)' }} />
            </div>
          </div>
        </GlassCard>

        {/* Cargo features */}
        <GlassCard variant="carrier" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>⚙️ Cargo Capabilities</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CARGO_FEATURES.map(f => (
              <button key={f} type="button" onClick={() => toggleFeature(f)}
                style={{ padding: '8px 14px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s', border: 'none',
                  background: form.features.includes(f) ? 'linear-gradient(135deg, #6366F1, #4338CA)' : 'rgba(255,255,255,0.06)',
                  color: form.features.includes(f) ? '#fff' : 'var(--text-secondary)',
                  boxShadow: form.features.includes(f) ? '0 2px 10px rgba(99,102,241,0.4)' : 'none',
                }}>
                {f}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Departure Window */}
        <GlassCard variant="carrier" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>🕐 Departure Window</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Earliest Departure</label>
              <input className="input-field" type="datetime-local" required
                value={form.departureWindowStart} onChange={e => setForm(p => ({ ...p, departureWindowStart: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Latest Departure</label>
              <input className="input-field" type="datetime-local" required
                value={form.departureWindowEnd} onChange={e => setForm(p => ({ ...p, departureWindowEnd: e.target.value }))} />
            </div>
          </div>
        </GlassCard>

        {/* Price floor */}
        <GlassCard variant="carrier" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>💰 Price Floor</p>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Minimum acceptable price <span style={{ color: '#6EE7B7' }}>₹{form.priceFloor.toLocaleString()}</span>
            </label>
            <input type="range" min={500} max={50000} step={100} value={form.priceFloor}
              onChange={e => setForm(p => ({ ...p, priceFloor: +e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--indigo)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              <span>₹500</span><span>₹50,000</span>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '12px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ fontSize: '0.78rem', color: '#6EE7B7' }}>
              💡 With 40% empty-leg discount, effective floor for shippers: <strong>₹{Math.round(form.priceFloor * 0.6).toLocaleString()}</strong>
            </p>
          </div>
        </GlassCard>

        <motion.button type="submit" className="btn btn-primary btn-full btn-lg" whileTap={{ scale: 0.97 }}
          style={{ borderRadius: 16 }}>
          Post Listing & Start Matching
        </motion.button>
      </form>
    </PageShell>
  )
}
