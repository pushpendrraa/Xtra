import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Weight, Box, Clock, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'

const SHIPMENT_TYPES = ['General', 'Fragile', 'Refrigerated', 'Hazmat']

export default function PostShipment() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ pickup: '', dropoff: '', weightKg: 500, volumeM3: 4, type: 'General', deadline: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const urgency = (() => {
    if (!form.deadline) return null
    const hrs = (new Date(form.deadline).getTime() - Date.now()) / 3_600_000
    if (hrs < 2) return { label: '< 2h — 1.3× urgency surcharge', color: '#FDA4AF' }
    if (hrs < 6) return { label: '< 6h — 1.15× urgency surcharge', color: '#FCD34D' }
    return { label: 'Standard rate', color: '#6EE7B7' }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    await new Promise(r => setTimeout(r, 1000))
    navigate('/shipper/matches')
  }

  if (submitted) return (
    <PageShell title="Finding Matches">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid rgba(34,211,238,0.2)', borderTopColor: '#22D3EE' }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800 }}>Scanning Carriers…</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>Matching engine is finding the best empty-leg routes</p>
        </div>
      </div>
    </PageShell>
  )

  return (
    <PageShell title="Post Shipment" subtitle="Find empty-leg capacity">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Route */}
        <GlassCard variant="shipper" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} color="#22D3EE" /> Route
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Pickup Location</label>
              <input className="input-field teal" type="text" placeholder="Andheri West, Mumbai" required
                value={form.pickup} onChange={e => setForm(p => ({ ...p, pickup: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Dropoff Location</label>
              <input className="input-field teal" type="text" placeholder="Hadapsar, Pune" required
                value={form.dropoff} onChange={e => setForm(p => ({ ...p, dropoff: e.target.value }))} />
            </div>
          </div>
        </GlassCard>

        {/* Cargo */}
        <GlassCard variant="shipper" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>📦 Cargo Details</p>

          {/* Type selector */}
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Shipment Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SHIPMENT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                  style={{ padding: '8px 14px', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s', border: 'none',
                    background: form.type === t ? 'linear-gradient(135deg, #22D3EE, #0891B2)' : 'rgba(255,255,255,0.06)',
                    color: form.type === t ? '#000' : 'var(--text-secondary)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Weight <span style={{ color: 'var(--teal)' }}>{form.weightKg.toLocaleString()} kg</span>
            </label>
            <input type="range" min={10} max={5000} step={10} value={form.weightKg}
              onChange={e => setForm(p => ({ ...p, weightKg: +e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--teal)' }} />
          </div>

          <div className="input-group" style={{ marginTop: 10 }}>
            <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Volume <span style={{ color: 'var(--teal)' }}>{form.volumeM3} m³</span>
            </label>
            <input type="range" min={0.5} max={40} step={0.5} value={form.volumeM3}
              onChange={e => setForm(p => ({ ...p, volumeM3: +e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--teal)' }} />
          </div>
        </GlassCard>

        {/* Deadline */}
        <GlassCard variant="shipper" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="#22D3EE" /> Delivery Deadline
          </p>
          <div className="input-group">
            <label className="input-label">Must arrive by</label>
            <input className="input-field teal" type="datetime-local" required
              value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>

          {urgency && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              style={{ marginTop: 10, padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${urgency.color}44` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: urgency.color }}>
                <Zap size={13} /> {urgency.label}
              </div>
            </motion.div>
          )}
        </GlassCard>

        {/* Notes */}
        <GlassCard style={{ padding: 18 }}>
          <div className="input-group">
            <label className="input-label">Special Instructions (optional)</label>
            <textarea className="input-field" rows={3} placeholder="Handle with care, keep upright…"
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              style={{ resize: 'none', lineHeight: 1.6 }} />
          </div>
        </GlassCard>

        <motion.button type="submit" className="btn btn-teal btn-full btn-lg" whileTap={{ scale: 0.97 }}
          style={{ borderRadius: 16 }}>
          Find Matching Carriers
        </motion.button>
      </form>
    </PageShell>
  )
}
