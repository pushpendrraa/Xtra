import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Truck, Eye, EyeOff, ArrowRight, Package } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { MOCK_USER } from '../../services/api'

type Tab = 'login' | 'signup'

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState<'carrier' | 'shipper'>('carrier')
  const [loading, setLoading] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'signup' && !otpStep) { setOtpStep(true); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    login({ ...MOCK_USER, roles: [role, role === 'carrier' ? 'shipper' : 'carrier'] }, 'mock-jwt-token')
    navigate(role === 'carrier' ? '/carrier' : '/shipper')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative' }}>
      {/* Background orbs */}
      <div className="bg-orbs"><div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" /></div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(99,102,241,0.5)',
          }}>
            <Truck size={34} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #818CF8, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Xtra
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>Empty-leg freight, matched perfectly</p>
        </motion.div>

        {/* Card */}
        <motion.div className="card" style={{ padding: 28 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['login', 'signup'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setOtpStep(false) }}
                style={{ flex: 1, padding: '10px', borderRadius: 9, fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
                  background: tab === t ? 'linear-gradient(135deg, #6366F1, #4338CA)' : 'none',
                  color: tab === t ? '#fff' : 'var(--text-secondary)',
                  boxShadow: tab === t ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
                }}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {otpStep ? (
              <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <p style={{ textAlign: 'center', marginBottom: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Enter the 6-digit OTP sent to your phone
                </p>
                <div className="otp-inputs" style={{ marginBottom: 24 }}>
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                      value={d} onChange={e => handleOtpChange(i, e.target.value)}
                      className="otp-digit" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.form key={tab} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {tab === 'signup' && (
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input className="input-field" type="text" placeholder="Aryan Mehta" required />
                  </div>
                )}
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input className="input-field" type="email" placeholder="you@example.com" required />
                </div>
                {tab === 'signup' && (
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input className="input-field" type="tel" placeholder="+91-98765-43210" required />
                  </div>
                )}
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" required style={{ paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role selector */}
                {tab === 'signup' && (
                  <div className="input-group">
                    <label className="input-label">I am a</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([['carrier', '🚛', 'Carrier'], ['shipper', '📦', 'Shipper']] as const).map(([r, emoji, label]) => (
                        <button key={r} type="button" onClick={() => setRole(r)}
                          style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${role === r ? (r === 'carrier' ? '#6366F1' : '#22D3EE') : 'var(--glass-border)'}`,
                            background: role === r ? (r === 'carrier' ? 'rgba(99,102,241,0.15)' : 'rgba(34,211,238,0.12)') : 'rgba(255,255,255,0.04)',
                            color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                          }}>
                          {emoji} {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }}
                  whileTap={{ scale: 0.97 }} disabled={loading}>
                  {loading ? <span style={{ opacity: 0.7 }}>Authenticating…</span> : (
                    <>{tab === 'login' ? 'Sign In' : 'Continue'} <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {otpStep && (
            <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>
          )}
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
          By continuing you agree to Xtra's Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  )
}
