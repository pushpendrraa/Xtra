import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Shield, CheckCircle, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard } from '../../components/ui'
import { useGeolocation } from '../../hooks/useGeolocation'

export default function PODCapture() {
  const navigate = useNavigate()
  const { lat, lng, loading: geoLoading } = useGeolocation()
  const [otp, setOtp] = useState(['', '', '', ''])
  const [photo, setPhoto] = useState<string | null>(null)
  const [step, setStep] = useState<'capture' | 'uploading' | 'done'>('capture')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleOtp = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 3) (document.getElementById(`pod-otp-${i + 1}`) as HTMLInputElement)?.focus()
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!otp.every(d => d) || !photo) return
    setStep('uploading')
    await new Promise(r => setTimeout(r, 1500))
    setStep('done')
    await new Promise(r => setTimeout(r, 1500))
    navigate('/carrier')
  }

  return (
    <PageShell title="POD Capture" subtitle="Proof of Delivery">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <AnimatePresence mode="wait">
          {step === 'done' ? (
            <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(16,185,129,0.5)' }}>
                <CheckCircle size={40} color="#fff" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Delivery Confirmed!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Payment will be released to your wallet within 24h</p>
              </div>
            </motion.div>
          ) : step === 'uploading' ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 16 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366F1' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Uploading proof of delivery…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Booking info */}
              <GlassCard variant="carrier" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Booking #B1</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Andheri West → Hadapsar, Pune · Patel Traders</div>
              </GlassCard>

              {/* GPS */}
              <GlassCard style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={18} color={lat ? '#6EE7B7' : 'var(--text-tertiary)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>GPS Location</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {geoLoading ? 'Acquiring location…' : lat ? `${lat.toFixed(5)}, ${lng?.toFixed(5)}` : 'Location unavailable'}
                    </div>
                  </div>
                  {lat && <span className="badge badge-emerald" style={{ marginLeft: 'auto' }}>Acquired</span>}
                </div>
              </GlassCard>

              {/* OTP */}
              <GlassCard variant="carrier" style={{ padding: 18 }}>
                <p style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} color="#818CF8" /> Receiver OTP
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Ask the receiver for their 4-digit OTP
                </p>
                <div className="otp-inputs">
                  {otp.map((d, i) => (
                    <input key={i} id={`pod-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                      value={d} onChange={e => handleOtp(i, e.target.value)}
                      className="otp-digit" />
                  ))}
                </div>
              </GlassCard>

              {/* Photo */}
              <GlassCard variant="carrier" style={{ padding: 18 }}>
                <p style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Camera size={16} color="#818CF8" /> Delivery Photo
                </p>
                {photo ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                    <img src={photo} alt="POD" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12 }} />
                    <button onClick={() => setPhoto(null)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ width: '100%', height: 160, borderRadius: 12, border: '2px dashed var(--glass-border)',
                      background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Camera size={32} strokeWidth={1.5} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tap to capture photo</span>
                    <span style={{ fontSize: '0.72rem' }}>or upload from gallery</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
              </GlassCard>

              <motion.button
                className="btn btn-success btn-full btn-lg"
                whileTap={{ scale: 0.97 }}
                disabled={!otp.every(d => d) || !photo}
                onClick={handleSubmit}
                style={{ borderRadius: 16 }}>
                <Upload size={18} /> Submit Proof of Delivery
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
