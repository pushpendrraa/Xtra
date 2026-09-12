/**
 * MatchOfferPopup.tsx
 * Ola/Uber-style incoming cargo request for carriers.
 * Shows when a match:offer socket event fires.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Package, Weight, Clock, DollarSign, X, Check, Truck } from 'lucide-react'
import { api } from '../../services/api'

export interface MatchOffer {
  matchId: string
  shipmentId: string
  score: number        // 0-100
  priceQuote: number
  detourKm: number
  pickup:  { label?: string; coords?: number[] }
  dropoff: { label?: string; coords?: number[] }
  weightKg: number
  volumeM3: number
  shipmentType: string
  deadline?: string
  expiresAt: string   // ISO string, 2 min window
}

interface Props {
  offer: MatchOffer
  onDone: () => void
}

export function MatchOfferPopup({ offer, onDone }: Props) {
  const expiresMs = new Date(offer.expiresAt).getTime() - Date.now()
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.round(expiresMs / 1000)))
  const [status, setStatus] = useState<'idle' | 'accepting' | 'accepted' | 'declined'>('idle')

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) { onDone(); return }
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(t); onDone(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const fraction = secondsLeft / Math.max(1, Math.round(expiresMs / 1000))
  const circumference = 2 * Math.PI * 28

  const accept = async () => {
    setStatus('accepting')
    try {
      await api.post(`/api/matches/${offer.matchId}/accept`)
      setStatus('accepted')
      setTimeout(onDone, 1800)
    } catch { setStatus('idle') }
  }

  const decline = () => { setStatus('declined'); setTimeout(onDone, 800) }

  const pickupLabel = offer.pickup?.label || 'Pickup'
  const dropoffLabel = offer.dropoff?.label || 'Dropoff'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: '0 0 24px',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) decline() }}
      >
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{
            width: '100%', maxWidth: 440,
            background: 'linear-gradient(145deg, #0d1117 0%, #0f172a 100%)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: '24px 24px 16px 16px',
            padding: '6px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -8px 60px rgba(99,102,241,0.25)',
          }}
        >
          {/* Top accent bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #6366F1, #22D3EE)', borderRadius: 2 }} />

          <div style={{ padding: '20px 24px 24px' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D3EE', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22D3EE', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    New Cargo Request
                  </span>
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Shipment Offer</h2>
              </div>

              {/* Countdown ring */}
              <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
                <svg width="60" height="60" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                  <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle cx="30" cy="30" r="28" fill="none"
                    stroke={secondsLeft < 30 ? '#F87171' : '#22D3EE'}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - fraction)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: secondsLeft < 30 ? '#F87171' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
                  {secondsLeft}s
                </div>
              </div>
            </div>

            {/* Route */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2, width: 10, height: 10, borderRadius: '50%', background: '#22D3EE', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.05em' }}>PICKUP</div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginTop: 1 }}>{pickupLabel.split(',')[0]}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{pickupLabel.split(',').slice(1, 3).join(',')}</div>
                  </div>
                </div>
                <div style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.1)', marginLeft: 4 }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2, width: 10, height: 10, borderRadius: '50%', background: '#F87171', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.05em' }}>DROPOFF</div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginTop: 1 }}>{dropoffLabel.split(',')[0]}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{dropoffLabel.split(',').slice(1, 3).join(',')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { icon: <Weight size={13}/>, label: `${offer.weightKg} kg` },
                { icon: <Package size={13}/>, label: `${offer.volumeM3} m³` },
                { icon: <Truck size={13}/>, label: offer.shipmentType },
                { icon: <MapPin size={13}/>, label: `+${offer.detourKm} km detour` },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: '5px 11px', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                  {icon} {label}
                </div>
              ))}
            </div>

            {/* Price + score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>YOUR EARNING</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>₹{offer.priceQuote.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>MATCH SCORE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: offer.score >= 80 ? '#22D3EE' : '#F59E0B' }}>{offer.score}%</div>
              </div>
            </div>

            {/* Accept / Decline */}
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={decline}
                disabled={status !== 'idle'}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.15)',
                  background: 'transparent', color: 'rgba(255,255,255,0.65)', fontWeight: 700, fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}
              >
                <X size={18}/> Decline
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={accept}
                disabled={status !== 'idle'}
                style={{
                  flex: 2, padding: '14px', borderRadius: 14, border: 'none',
                  background: status === 'accepted' ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#6366F1,#4F46E5)',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'background 0.3s',
                }}
              >
                {status === 'accepting' ? '⏳ Confirming…' :
                 status === 'accepted'  ? '✓ Accepted!' :
                 <><Check size={18}/> Accept Shipment</>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
