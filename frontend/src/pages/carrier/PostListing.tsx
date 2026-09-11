import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Truck, Calendar, DollarSign, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'

const VEHICLE_TYPES = ['Mini Truck', 'Tata Ace', 'Mahindra Bolero', 'Eicher 17ft', 'Eicher 20ft', 'Container 40ft']
const CARGO_FEATURES = ['Refrigerated', 'Fragile Handling', 'Hazmat Certified', 'Open Body', 'Closed Body']

export default function PostListing() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    origin: 'Mumbai Central',
    destination: 'Pune MIDC',
    vehicleType: 'Eicher 17ft',
    weightKg: 2500,
    volumeM3: 16,
    priceFloor: 6500,
    departureWindowStart: '',
    departureWindowEnd: '',
    features: ['Closed Body'] as string[],
  })

  const toggleFeature = (f: string) =>
    setForm(p => ({ ...p, features: p.features.includes(f) ? p.features.filter(x => x !== f) : [...p.features, f] }))

  const estimatedTripsMatched = 4
  const estimatedRevenue = Math.round(form.priceFloor * 1.35)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    await new Promise(r => setTimeout(r, 1200))
    navigate('/carrier/matches')
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
      </div>
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
                  <input
                    type="range"
                    min={100}
                    max={10000}
                    step={100}
                    value={form.weightKg}
                    onChange={e => setForm(p => ({ ...p, weightKg: +e.target.value }))}
                    style={{ width: '100%', accentColor: 'var(--indigo)' }}
                  />
                </div>

                {/* Volume slider */}
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Available Space <span><strong style={{ color: 'var(--indigo)', fontSize: '0.95rem' }}>{form.volumeM3}</strong> m³</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={80}
                    step={1}
                    value={form.volumeM3}
                    onChange={e => setForm(p => ({ ...p, volumeM3: +e.target.value }))}
                    style={{ width: '100%', accentColor: 'var(--indigo)' }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Features */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>⚙️ Capabilities & Equipment</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CARGO_FEATURES.map(f => {
                  const active = form.features.includes(f)
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeature(f)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 9999,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                        border: active ? '1px solid var(--indigo)' : '1px solid var(--glass-border)',
                        background: active ? 'linear-gradient(135deg, var(--indigo-bright), var(--indigo))' : 'var(--glass-white)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>
            </GlassCard>

            {/* Departure Window */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="var(--indigo)" /> Departure Flexibility Window
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Earliest Departure Time</label>
                  <input
                    className="input-field"
                    type="datetime-local"
                    value={form.departureWindowStart}
                    onChange={e => setForm(p => ({ ...p, departureWindowStart: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Latest Departure Time</label>
                  <input
                    className="input-field"
                    type="datetime-local"
                    value={form.departureWindowEnd}
                    onChange={e => setForm(p => ({ ...p, departureWindowEnd: e.target.value }))}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Price floor */}
            <GlassCard variant="carrier" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={18} color="var(--emerald)" /> Minimum Revenue Target
              </p>
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Minimum acceptable payout <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>₹{form.priceFloor.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={40000}
                  step={500}
                  value={form.priceFloor}
                  onChange={e => setForm(p => ({ ...p, priceFloor: +e.target.value }))}
                  style={{ width: '100%', accentColor: 'var(--emerald)' }}
                />
              </div>
            </GlassCard>

            <motion.button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              whileTap={{ scale: 0.98 }}
              style={{ borderRadius: 16 }}
            >
              <Sparkles size={18} /> Publish Capacity & Match Shippers
            </motion.button>

          </div>

          {/* Right Column: Sticky Payout Projection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="sticky-desktop">
            <GlassCard variant="carrier" style={{ padding: 24 }}>
              <span className="badge badge-indigo">⚡ Revenue Forecast</span>

              <div style={{ marginTop: 14, marginBottom: 18 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Projected Corridor Payout</div>
                <div style={{ fontSize: '2.3rem', fontWeight: 900, color: 'var(--emerald)', fontFamily: 'Space Grotesk', marginTop: 4 }}>
                  ₹{estimatedRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--indigo)', fontWeight: 600, marginTop: 4 }}>
                  Based on current shipper demand on Mumbai–Pune route
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Loads Looking for Trucks</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{estimatedTripsMatched} loads</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Deadhead Fuel Recovered</span>
                  <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>100%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Terms</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Instant on POD OTP</span>
                </div>
              </div>

              <div style={{ marginTop: 22, padding: 14, borderRadius: 12, background: 'var(--bg-deep)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <CheckCircle2 size={16} color="var(--emerald)" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Guaranteed Match Protection</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  If a shipper delays pickup by over 45 minutes, waiting detention fees apply automatically.
                </p>
              </div>
            </GlassCard>
          </div>

        </div>
      </form>
    </PageShell>
  )
}
