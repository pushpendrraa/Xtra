import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Weight, Box, Clock, Zap, DollarSign, Leaf, Sparkles, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'

const SHIPMENT_TYPES = ['General', 'Fragile', 'Refrigerated', 'Hazmat']

export default function PostShipment() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    pickup: 'Andheri West, Mumbai',
    dropoff: 'Hadapsar, Pune',
    weightKg: 500,
    volumeM3: 4,
    type: 'General',
    deadline: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const urgency = (() => {
    if (!form.deadline) return null
    const hrs = (new Date(form.deadline).getTime() - Date.now()) / 3_600_000
    if (hrs < 2) return { label: '< 2h — 1.3× urgency surcharge', color: 'var(--rose)' }
    if (hrs < 6) return { label: '< 6h — 1.15× urgency surcharge', color: 'var(--amber)' }
    return { label: 'Standard empty-leg discount applied', color: 'var(--emerald)' }
  })()

  // Dynamic estimate calculations
  const estimatedStandard = Math.round(3500 + form.weightKg * 2.2 + form.volumeM3 * 220)
  const emptyLegDiscountPct = 35
  const estimatedDiscounted = Math.round(estimatedStandard * (1 - emptyLegDiscountPct / 100))
  const estimatedSavings = estimatedStandard - estimatedDiscounted
  const estimatedCO2 = Math.round(form.weightKg * 0.08 + 24)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    
    try {
      // Mock coordinates for demo purposes (Mumbai to Pune)
      const isPune = form.dropoff.toLowerCase().includes('pune')
      const isDelhi = form.pickup.toLowerCase().includes('delhi')
      
      const payload = {
        pickup: { 
          lat: isDelhi ? 28.6139 : 19.0760, 
          lng: isDelhi ? 77.2090 : 72.8777, 
          label: form.pickup 
        },
        dropoff: { 
          lat: isPune ? 18.5204 : (isDelhi ? 28.4595 : 18.5204), 
          lng: isPune ? 73.8567 : (isDelhi ? 77.0266 : 73.8567), 
          label: form.dropoff 
        },
        weightKg: form.weightKg,
        volumeM3: form.volumeM3,
        shipmentType: form.type.toLowerCase(),
        earliestPickupTime: new Date().toISOString(),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date(Date.now() + 24*3600*1000).toISOString(),
        expectedPrice: estimatedDiscounted,
        autoAccept: false,
      }
      
      // Import shipmentApi dynamically if not imported at top
      const { shipmentApi } = await import('../../services/api')
      await shipmentApi.create(payload)
      
      // Show the scanning animation for a bit
      await new Promise((r) => setTimeout(r, 2500))
    } catch (err) {
      console.error('Failed to post shipment:', err)
    }
    
    navigate('/shipper')
  }

  if (submitted) {
    return (
      <PageShell title="Finding Matches">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: 68, height: 68, borderRadius: '50%', border: '4px solid rgba(2, 132, 199, 0.2)', borderTopColor: 'var(--teal)' }}
          />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 800 }}>Scanning Empty-Leg Fleet…</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.92rem' }}>
              Xtra AI is matching your cargo with empty return haulers on the Mumbai–Pune expressway
            </p>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Post Shipment" subtitle="Match with empty-leg return carriers">
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="responsive-split-2">

          {/* Left Column: Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Route */}
            <GlassCard variant="shipper" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--teal)" /> Route Locations
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Pickup Location</label>
                  <input
                    className="input-field teal"
                    type="text"
                    placeholder="Andheri West, Mumbai"
                    required
                    value={form.pickup}
                    onChange={(e) => setForm((p) => ({ ...p, pickup: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Dropoff Location</label>
                  <input
                    className="input-field teal"
                    type="text"
                    placeholder="Hadapsar, Pune"
                    required
                    value={form.dropoff}
                    onChange={(e) => setForm((p) => ({ ...p, dropoff: e.target.value }))}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Cargo */}
            <GlassCard variant="shipper" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box size={18} color="var(--teal)" /> Cargo Specifications
              </p>

              {/* Type selector */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Shipment Category</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SHIPMENT_TYPES.map((t) => {
                    const active = form.type === t
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type: t }))}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 9999,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          transition: 'all 0.2s',
                          border: active ? '1px solid var(--teal)' : '1px solid var(--glass-border)',
                          background: active ? 'linear-gradient(135deg, var(--teal-bright), var(--teal))' : 'var(--glass-white)',
                          color: active ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Weight <span><strong style={{ color: 'var(--teal)', fontSize: '0.95rem' }}>{form.weightKg.toLocaleString()}</strong> kg</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={25}
                  value={form.weightKg}
                  onChange={(e) => setForm((p) => ({ ...p, weightKg: +e.target.value }))}
                  style={{ width: '100%', accentColor: 'var(--teal)' }}
                />
              </div>

              <div className="input-group" style={{ marginTop: 14 }}>
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Volume <span><strong style={{ color: 'var(--teal)', fontSize: '0.95rem' }}>{form.volumeM3}</strong> m³</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={40}
                  step={0.5}
                  value={form.volumeM3}
                  onChange={(e) => setForm((p) => ({ ...p, volumeM3: +e.target.value }))}
                  style={{ width: '100%', accentColor: 'var(--teal)' }}
                />
              </div>
            </GlassCard>

            {/* Deadline */}
            <GlassCard variant="shipper" style={{ padding: 20 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--teal)" /> Delivery Timing & Deadline
              </p>
              <div className="input-group">
                <label className="input-label">Required Delivery By</label>
                <input
                  className="input-field teal"
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                />
              </div>

              {urgency && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--bg-base)',
                    border: `1px solid ${urgency.color}44`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: urgency.color }}>
                    <Zap size={15} /> {urgency.label}
                  </div>
                </motion.div>
              )}
            </GlassCard>

            {/* Notes */}
            <GlassCard style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Handling Instructions (optional)</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Palletized, fork-lift required at drop-off…"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  style={{ resize: 'none', lineHeight: 1.6 }}
                />
              </div>
            </GlassCard>

            <motion.button
              type="submit"
              className="btn btn-teal btn-full btn-lg"
              whileTap={{ scale: 0.98 }}
              style={{ borderRadius: 16 }}
            >
              <Sparkles size={18} /> Find Matching Carriers
            </motion.button>
          </div>

          {/* Right Column: Sticky Live Price & Savings Projection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="sticky-desktop">
            <GlassCard variant="shipper" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="badge badge-teal">⚡ Instant Estimate</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>~148 km</span>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Estimated Empty-Leg Rate</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--emerald)', fontFamily: 'Space Grotesk' }}>
                    ₹{estimatedDiscounted.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>
                    ₹{estimatedStandard.toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--emerald)', fontWeight: 700, marginTop: 2 }}>
                  You save ₹{estimatedSavings.toLocaleString()} (35% off spot rate)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Available Return Trucks</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>12 in corridor</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Carbon Avoided</span>
                  <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>~{estimatedCO2} kg CO₂</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Transit Guarantee</span>
                  <span style={{ fontWeight: 700, color: 'var(--teal)' }}>100% Tracked + POD</span>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 12, borderRadius: 12, background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} color="var(--emerald)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  All matched carriers are GST & GPS verified with real-time OTP chain.
                </span>
              </div>
            </GlassCard>
          </div>

        </div>
      </form>
    </PageShell>
  )
}
