import { motion } from 'framer-motion'
import { MapPin, Truck, User, Clock, CheckCircle, Package, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, Stars } from '../../components/ui'
import { MOCK_TRACKING } from '../../services/api'

const STEP_ICONS = ['📋', '👤', '📦', '🚛', '📍', '✅', '🎉']

export default function TrackShipment() {
  const navigate = useNavigate()
  const t = MOCK_TRACKING
  const activeStep = t.steps.findIndex(s => (s as { active?: boolean }).active)

  return (
    <PageShell title="Track Shipment" subtitle={`ETA: ${t.eta}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Map placeholder */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div style={{ height: 180, borderRadius: 20, background: 'linear-gradient(135deg, #0f1117, #1a1a2e)', border: '1px solid rgba(34,211,238,0.2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Animated route line */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <motion.path d="M 60 130 Q 160 60 280 90 Q 360 110 420 70" stroke="url(#routeGrad)" strokeWidth="3" fill="none" strokeDasharray="8 4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
              {/* Origin dot */}
              <circle cx="60" cy="130" r="6" fill="#6366F1" />
              {/* Truck position */}
              <motion.circle cx="0" cy="0" r="8" fill="#22D3EE" stroke="#fff" strokeWidth="2"
                initial={{ cx: 60, cy: 130 }} animate={{ cx: 280, cy: 90 }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }} />
              {/* Destination */}
              <circle cx="420" cy="70" r="6" fill="#F43F5E" />
            </svg>
            {/* Labels */}
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, color: '#A5B4FC' }}>
              📍 {t.pickup.split(',')[0]}
            </div>
            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, color: '#FDA4AF' }}>
              🎯 {t.dropoff.split(',')[0]}
            </div>
            <div style={{ position: 'absolute', bottom: 12, background: 'rgba(34,211,238,0.15)', backdropFilter: 'blur(8px)', padding: '6px 16px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, color: '#22D3EE', border: '1px solid rgba(34,211,238,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Navigation size={12} /> Live — ETA {t.eta}
            </div>
          </div>
        </motion.div>

        {/* Carrier card */}
        <GlassCard variant="shipper" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #22D3EE, #0891B2)', width: 48, height: 48 }}>
              {t.carrier.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{t.carrier.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={11} /> {t.carrier.driver}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Truck size={11} /> {t.carrier.vehicle}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Stars rating={t.carrier.rating} />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 2 }}>{t.carrier.rating}</div>
            </div>
          </div>
        </GlassCard>

        {/* Status Stepper */}
        <GlassCard variant="shipper" style={{ padding: 18 }}>
          <p style={{ fontWeight: 700, marginBottom: 18, fontSize: '0.9rem' }}>📍 Delivery Progress</p>
          <div className="stepper">
            {t.steps.map((step, i) => {
              const isLast = i === t.steps.length - 1
              const stepState = step.done ? 'done' : i === activeStep ? 'active' : 'pending'

              return (
                <div key={i} className="step-row">
                  <div className="step-icon-col">
                    <motion.div
                      className={`step-circle ${stepState}`}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}>
                      {step.done ? <CheckCircle size={14} /> : STEP_ICONS[i]}
                    </motion.div>
                    {!isLast && <div className={`step-line ${step.done ? 'done' : 'pending'}`} />}
                  </div>
                  <div className="step-content">
                    <div className="step-title" style={{ color: stepState === 'active' ? '#22D3EE' : stepState === 'done' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {step.label}
                    </div>
                    {step.ts && <div className="step-ts">{step.ts}</div>}
                    {stepState === 'active' && <span className="badge badge-teal badge-dot" style={{ marginTop: 4 }}>In Progress</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* POD OTP */}
        <GlassCard style={{ padding: 16, border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)' }}>
          <p style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.9rem' }}>🔐 Your Delivery OTP</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Share this with the driver at delivery to confirm receipt
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {['7', '3', '2', '9'].map((d, i) => (
              <div key={i} style={{ width: 52, height: 58, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, color: '#FCD34D' }}>
                {d}
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 10 }}>
            OTP expires on delivery — do not share before arrival
          </p>
        </GlassCard>

      </div>
    </PageShell>
  )
}
