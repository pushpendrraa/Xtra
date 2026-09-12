import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Weight, Box, Clock, Zap, DollarSign, Leaf, Sparkles, ShieldCheck, RefreshCw, ChevronRight, Truck, CheckCircle2, Phone, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'
import { LocationPicker, LocationData } from '../../components/ui/LocationPicker'
import { shipmentApi, bookingApi } from '../../services/api'
import { connectSocket, getSocket } from '../../services/socket'
import { useAuthStore } from '../../store/authStore'

const SHIPMENT_TYPES = ['General', 'Fragile', 'Refrigerated', 'Hazmat']

export default function PostShipment() {
  const navigate = useNavigate()
  const { token } = useAuthStore() as any
  
  // Use LocationData for pickup/dropoff
  const [pickup, setPickup] = useState<LocationData>({ lat: 0, lng: 0, label: '' })
  const [dropoff, setDropoff] = useState<LocationData>({ lat: 0, lng: 0, label: '' })
  
  const [form, setForm] = useState({
    weightKg: 500,
    volumeM3: 4,
    type: 'General',
    deadline: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [shipmentId, setShipmentId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [carriersFound, setCarriersFound] = useState(0)
  const [matchPhase, setMatchPhase] = useState<'scanning' | 'found' | 'waiting'>('scanning')
  const [secondsLeft, setSecondsLeft] = useState(300) // 5-min window
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    
    if (!pickup.lat || !dropoff.lat) {
      setError('Please select valid locations for pickup and dropoff (using map or GPS).')
      return
    }
    
    setError('')
    setSubmitted(true)
    
    try {
      const payload = {
        pickup,
        dropoff,
        weightKg: form.weightKg,
        volumeM3: form.volumeM3,
        shipmentType: form.type.toLowerCase(),
        earliestPickupTime: new Date().toISOString(),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date(Date.now() + 24*3600*1000).toISOString(),
        expectedPrice: estimatedDiscounted,
        autoAccept: false,
      }
      
      const res = await shipmentApi.create(payload)
      const newId = res.data?._id || res.data?.id
      setShipmentId(newId)

      // Connect socket and listen for matches
      const rawToken = token || JSON.parse(localStorage.getItem('xtra-auth') || '{}')?.state?.token
      if (rawToken) {
        const sock = connectSocket(rawToken)
        sock.on('match:found', ({ carriersFound: n }) => {
          setCarriersFound(n)
          setMatchPhase('found')
          setTimeout(() => setMatchPhase('waiting'), 2500)
        })
        sock.on('booking:confirmed', async ({ bookingId }) => {
          try {
            const res = await bookingApi.getById(bookingId)
            setConfirmedBooking(res.data)
          } catch(err) {
            console.error('Failed to fetch confirmed booking', err)
            navigate('/shipper') // fallback
          }
        })
      }

      // Start 5-min countdown
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0 }
          if (s === 181) setCanResend(true) // show resend after 2 min
          return s - 1
        })
      }, 1000)

    } catch (err) {
      console.error('Failed to post shipment:', err)
      setError('Failed to post shipment. Please try again.')
      setSubmitted(false)
    }
  }

  const handleResend = async () => {
    if (!shipmentId) return
    setResending(true)
    setCarriersFound(0)
    setMatchPhase('scanning')
    setSecondsLeft(300)
    setCanResend(false)
    try {
      await shipmentApi.rematch(shipmentId)
      // Restart timer
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0 }
          if (s === 181) setCanResend(true)
          return s - 1
        })
      }, 1000)
    } catch(err) { console.error(err) }
    finally { setResending(false) }
  }

  // Format mm:ss
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  // ── Ola/Uber-style waiting & confirmation screen ────────────────
  if (submitted && !error) {
    const from = pickup.label?.split(',')[0] || 'Origin'
    const to = dropoff.label?.split(',')[0] || 'Destination'

    if (confirmedBooking) {
      const carrier = confirmedBooking.carrierId || {}
      const profile = carrier.carrierProfile || {}
      return (
        <PageShell title="Match Confirmed">
          <div style={{ maxWidth: 500, margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Carrier Assigned!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Your shipment is confirmed and scheduled.</p>
            </motion.div>

            <GlassCard style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Final Price</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{confirmedBooking.finalPrice?.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--emerald)', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} /> Confirmed
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                  {carrier.name?.charAt(0) || 'C'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{carrier.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber)', fontWeight: 700 }}>
                      <Star size={16} fill="currentColor" /> {carrier.ratingAvg?.toFixed(1) || '4.8'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                    <Truck size={14} /> {profile.vehicleType || 'Truck'} • {profile.vehicleNumber || 'MH-12-XX-0000'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                    <Phone size={14} /> {carrier.phone || '+91 99999 99999'}
                  </div>
                </div>
              </div>
            </GlassCard>

            <button className="btn btn-primary" onClick={() => navigate('/shipper')} style={{ width: '100%', padding: 16 }}>
              Go to Dashboard
            </button>
          </div>
        </PageShell>
      )
    }

    const phases = [
      '🛰️ Scanning carrier routes…',
      '📡 Matching polyline corridors…',
      '⚡ Calculating route overlap…',
      '🚛 Pinging matched carriers…',
    ]

    return (
      <PageShell title="Finding Carriers">
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 16px' }}>

          {/* Radar animation */}
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            {[1,2,3].map(ring => (
              <motion.div key={ring}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 2, delay: ring * 0.55, repeat: Infinity, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid var(--teal)` }}
              />
            ))}
            {/* Spinning arc */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--teal)', borderRightColor: 'rgba(34,211,238,0.4)' }}
            />
            {/* Center truck icon */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                {matchPhase === 'found' ? (
                  <motion.div key="found" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald)', fontSize: '2rem' }}
                  >✓</motion.div>
                ) : (
                  <motion.div key="truck" initial={{ scale: 0.8 }} animate={{ scale: [0.9, 1.05, 0.9] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '2px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}
                  ><Truck size={28}/></motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Route pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--glass-white)', border: '1px solid var(--glass-border)', borderRadius: 40, padding: '10px 20px', backdropFilter: 'blur(12px)' }}>
            <MapPin size={14} color="var(--teal)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{from}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>————</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{to}</span>
            <MapPin size={14} color="var(--rose)" />
          </div>

          {/* Dynamic status text */}
          <AnimatePresence mode="wait">
            {matchPhase === 'found' ? (
              <motion.div key="found-msg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--emerald)' }}>🎉 {carriersFound} Carrier{carriersFound !== 1 ? 's' : ''} Found!</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Requests sent — waiting for acceptance</p>
              </motion.div>
            ) : matchPhase === 'waiting' ? (
              <motion.div key="wait-msg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>⏳ Waiting for Carrier Response</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>Carriers have {fmt(secondsLeft)} to accept — you can keep using the app!</p>
              </motion.div>
            ) : (
              <motion.div key="scan-msg" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>Scanning Carrier Routes…</h2>
                {/* Cycling status lines */}
                <RotatingPhases phases={phases} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown ring (shown in waiting phase) */}
          {matchPhase === 'waiting' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: secondsLeft < 60 ? 'var(--rose)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', fontSize: '1.1rem', fontWeight: 700 }}>
              <Clock size={18} /> {fmt(secondsLeft)}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/shipper')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Go to Dashboard <ChevronRight size={16} />
            </button>

            {canResend && (
              <motion.button
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="btn btn-teal" onClick={handleResend} disabled={resending}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Resending…' : 'Resend Requests'}
              </motion.button>
            )}
          </div>

        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Post Shipment" subtitle="Match with empty-leg return carriers">
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {error && (
          <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: 'var(--rose)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
        <div className="responsive-split-2">

          {/* Left Column: Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Route */}
            <GlassCard variant="shipper" style={{ padding: 20, zIndex: 50 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="var(--teal)" /> Route Locations
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <LocationPicker
                  label="Pickup Location (your current position)"
                  value={pickup}
                  onChange={setPickup}
                  placeholder="Detecting your location…"
                  autoGps
                  allowMapClick
                />
                
                <LocationPicker
                  label="Dropoff Location"
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="Search & select destination city…"
                  hideGps
                  allowMapClick
                />
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

// ── Helper: cycles through status messages ────────────────────────
function RotatingPhases({ phases }: { phases: string[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % phases.length), 1800)
    return () => clearInterval(t)
  }, [phases.length])
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35 }}
        style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '0.88rem' }}
      >
        {phases[idx]}
      </motion.p>
    </AnimatePresence>
  )
}
