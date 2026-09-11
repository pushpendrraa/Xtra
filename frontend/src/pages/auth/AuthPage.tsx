import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Truck, Eye, EyeOff, ArrowRight, ArrowLeft, Package, ShieldCheck, Leaf,
  TrendingUp, Sun, Moon, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { authApi } from '../../services/api'

type Tab = 'login' | 'signup'
type SignupStep = 'basic' | 'profile' | 'done'

const VEHICLE_TYPES = ['Mini Truck', 'Tata Ace', 'Eicher 17ft', 'Eicher 20ft', 'Container', 'Other']

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid var(--glass-border)',
  background: 'var(--bg-deep)',
  color: 'var(--text-primary)',
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  marginBottom: 5,
  letterSpacing: '0.02em',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get('role') as 'carrier' | 'shipper') || 'carrier'
  const startInSignup = searchParams.get('role') !== null

  const [tab, setTab] = useState<Tab>(startInSignup ? 'signup' : 'login')
  const [step, setStep] = useState<SignupStep>('basic')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [role, setRole] = useState<'carrier' | 'shipper'>(initialRole)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup basic fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // Carrier profile
  const [vehicleType, setVehicleType] = useState('Tata Ace')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [baseLocation, setBaseLocation] = useState('')
  const [maxWeightKg, setMaxWeightKg] = useState('')
  const [maxVolumeM3, setMaxVolumeM3] = useState('')

  // Shipper profile
  const [companyName, setCompanyName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [primaryCity, setPrimaryCity] = useState('')
  const [avgShipmentWeightKg, setAvgShipmentWeightKg] = useState('')
  const [monthlyShipments, setMonthlyShipments] = useState('')

  const { login } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const resetForm = () => {
    setStep('basic'); setApiError(''); setName(''); setEmail(''); setPhone(''); setPassword('')
    setVehicleType('Tata Ace'); setVehicleNumber(''); setLicenseNumber(''); setBaseLocation(''); setMaxWeightKg(''); setMaxVolumeM3('')
    setCompanyName(''); setGstNumber(''); setPrimaryCity(''); setAvgShipmentWeightKg(''); setMonthlyShipments('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email: loginEmail, password: loginPassword })
      login(
        { id: res.user.id, name: res.user.name, email: res.user.email, phone: res.user.phone, roles: res.user.roles, ratingAvg: res.user.ratingAvg, ratingCount: res.user.ratingCount },
        res.token
      )
      navigate(`/${res.user.role}`)
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupBasic = (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!name || !email || !phone || !password) { setApiError('All fields are required.'); return }
    if (password.length < 6) { setApiError('Password must be at least 6 characters.'); return }
    setStep('profile')
  }

  const handleSignupProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setLoading(true)
    try {
      const payload = {
        name, email, phone, password, role,
        ...(role === 'carrier' ? { carrierProfile: { vehicleType, vehicleNumber, licenseNumber, baseLocation, maxWeightKg: Number(maxWeightKg) || 1000, maxVolumeM3: Number(maxVolumeM3) || 10 } } : {}),
        ...(role === 'shipper' ? { shipperProfile: { companyName, gstNumber, primaryCity, avgShipmentWeightKg: Number(avgShipmentWeightKg) || 500, monthlyShipments: Number(monthlyShipments) || 1 } } : {}),
      }
      const res = await authApi.register(payload)
      login(
        { id: res.user.id, name: res.user.name, email: res.user.email, phone: res.user.phone, roles: res.user.roles, ratingAvg: res.user.ratingAvg, ratingCount: res.user.ratingCount },
        res.token
      )
      setStep('done')
      setTimeout(() => navigate(`/${res.user.role}`), 1800)
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const isCarrier = role === 'carrier'
  const accentColor = isCarrier ? 'var(--indigo)' : 'var(--teal)'
  const accentBg = isCarrier ? '#EEF2FF' : '#F0F9FF'
  const accentBorder = isCarrier ? '#C7D2FE' : '#BAE6FD'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', background: 'var(--bg-deep)' }}>
      <div className="bg-orbs"><div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" /></div>

      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'light' ? <Sun size={18} color="#D97706" /> : <Moon size={18} color="#818CF8" />}
        </button>
      </div>

      {/* Back to landing */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ fontSize: '0.8rem', gap: 6 }}>
          <ArrowLeft size={14} /> Home
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 960, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'center' }}>

          {/* Left brand side */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '0 12px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(79,70,229,0.35)', marginBottom: 20 }}>
              <Truck size={32} color="#fff" />
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>Xtra</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: 8, maxWidth: 400, lineHeight: 1.6 }}>
              Empty-leg freight matching platform. Carriers earn 40% more on return runs; shippers cut logistics spend by 35%.
            </p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { Icon: TrendingUp, bg: '#EEF2FF', color: 'var(--indigo)', text: 'Dynamic matching algorithm with minimal detours' },
                { Icon: Leaf, bg: '#ECFDF5', color: 'var(--emerald)', text: 'Scope 3 emissions reduction & carbon tracking' },
                { Icon: ShieldCheck, bg: '#F0F9FF', color: 'var(--teal)', text: 'GPS-verified digital Proof of Delivery (POD) + OTP' },
              ].map(({ Icon, bg, color, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right auth card */}
          <motion.div className="card" style={{ padding: '32px 28px', maxWidth: 440, margin: '0 auto', width: '100%' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-deep)', borderRadius: 14, padding: 4, marginBottom: 24, border: '1px solid var(--glass-border)' }}>
              {(['login', 'signup'] as Tab[]).map((t) => (
                <button key={t} onClick={() => { setTab(t); resetForm(); setApiError('') }}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)', background: tab === t ? '#FFFFFF' : 'none', color: tab === t ? 'var(--indigo)' : 'var(--text-secondary)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}>
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {apiError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.82rem', color: '#B91C1C', fontWeight: 600 }}>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── LOGIN FORM ── */}
              {tab === 'login' && (
                <motion.form key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Email">
                    <input style={inputStyle} type="email" placeholder="name@company.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                  </Field>
                  <Field label="Password">
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                  <motion.button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 6 }} whileTap={{ scale: 0.98 }} disabled={loading}>
                    {loading ? 'Signing in…' : <><ArrowRight size={18} /> Sign In</>}
                  </motion.button>
                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '8px 0 0' }}>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => { setTab('signup'); resetForm() }} style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}>
                      Create one free
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── SIGNUP STEP 1: Basic Info ── */}
              {tab === 'signup' && step === 'basic' && (
                <motion.form key="signup-basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignupBasic} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {/* Step indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: '#fff', fontWeight: 800 }}>1</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Basic Details</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 800 }}>2</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Profile</span>
                  </div>

                  <Field label="Full Name">
                    <input style={inputStyle} type="text" placeholder="Aryan Mehta" required value={name} onChange={e => setName(e.target.value)} />
                  </Field>
                  <Field label="Email">
                    <input style={inputStyle} type="email" placeholder="name@company.com" required value={email} onChange={e => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Mobile Number">
                    <input style={inputStyle} type="tel" placeholder="+91-98765-43210" required value={phone} onChange={e => setPhone(e.target.value)} />
                  </Field>
                  <Field label="Password">
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" required value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

                  {/* Role selector */}
                  <Field label="I am a…">
                    <div style={{ display: 'flex', gap: 10 }}>
                      {([['carrier', '🚛', 'Carrier (Hauler)'], ['shipper', '📦', 'Shipper (Cargo)']] as const).map(([r, emoji, lbl]) => (
                        <button key={r} type="button" onClick={() => setRole(r)}
                          style={{ flex: 1, padding: '12px 10px', borderRadius: 12, border: role === r ? `2px solid ${r === 'carrier' ? 'var(--indigo)' : 'var(--teal)'}` : '1px solid var(--glass-border)', background: role === r ? (r === 'carrier' ? '#EEF2FF' : '#F0F9FF') : 'var(--bg-deep)', color: role === r ? (r === 'carrier' ? 'var(--indigo)' : 'var(--teal)') : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s', cursor: 'pointer' }}>
                          {emoji} {lbl}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <motion.button type="submit" className={`btn ${isCarrier ? 'btn-primary' : 'btn-teal'} btn-full btn-lg`} style={{ marginTop: 4 }} whileTap={{ scale: 0.98 }}>
                    Continue — {isCarrier ? 'Carrier' : 'Shipper'} Profile <ArrowRight size={16} />
                  </motion.button>
                </motion.form>
              )}

              {/* ── SIGNUP STEP 2: Role Profile ── */}
              {tab === 'signup' && step === 'profile' && (
                <motion.form key="signup-profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignupProfile} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {/* Step indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={14} color="#fff" />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Basic Details</span>
                    <div style={{ flex: 1, height: 1, background: accentColor }} />
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: '#fff', fontWeight: 800 }}>2</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{isCarrier ? 'Vehicle Info' : 'Company Info'}</span>
                  </div>

                  {/* Role badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, color: accentColor, alignSelf: 'flex-start' }}>
                    {isCarrier ? <Truck size={14} /> : <Package size={14} />}
                    {isCarrier ? 'Carrier Profile' : 'Shipper Profile'}
                  </div>

                  {isCarrier ? (
                    <>
                      <Field label="Vehicle Type">
                        <select style={inputStyle} value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                          {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Field label="Vehicle Reg. No.">
                          <input style={inputStyle} placeholder="MH01AB1234" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} />
                        </Field>
                        <Field label="Driver License No.">
                          <input style={inputStyle} placeholder="DL-1234567890" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
                        </Field>
                      </div>
                      <Field label="Base City / Home Location">
                        <input style={inputStyle} placeholder="Mumbai" required value={baseLocation} onChange={e => setBaseLocation(e.target.value)} />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Field label="Max Payload (kg)">
                          <input style={inputStyle} type="number" placeholder="1000" min="100" value={maxWeightKg} onChange={e => setMaxWeightKg(e.target.value)} />
                        </Field>
                        <Field label="Max Volume (m³)">
                          <input style={inputStyle} type="number" placeholder="10" min="1" value={maxVolumeM3} onChange={e => setMaxVolumeM3(e.target.value)} />
                        </Field>
                      </div>
                    </>
                  ) : (
                    <>
                      <Field label="Company / Trade Name">
                        <input style={inputStyle} placeholder="Sharma Exports Pvt. Ltd." required value={companyName} onChange={e => setCompanyName(e.target.value)} />
                      </Field>
                      <Field label="GST Number (optional)">
                        <input style={inputStyle} placeholder="27AAACS1429B1ZB" value={gstNumber} onChange={e => setGstNumber(e.target.value)} />
                      </Field>
                      <Field label="Primary Dispatch City">
                        <input style={inputStyle} placeholder="Delhi" required value={primaryCity} onChange={e => setPrimaryCity(e.target.value)} />
                      </Field>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Field label="Avg. Shipment (kg)">
                          <input style={inputStyle} type="number" placeholder="500" min="1" value={avgShipmentWeightKg} onChange={e => setAvgShipmentWeightKg(e.target.value)} />
                        </Field>
                        <Field label="Shipments / Month">
                          <input style={inputStyle} type="number" placeholder="10" min="1" value={monthlyShipments} onChange={e => setMonthlyShipments(e.target.value)} />
                        </Field>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" className="btn btn-ghost" style={{ flex: '0 0 auto', padding: '12px 16px' }} onClick={() => { setStep('basic'); setApiError('') }}>
                      <ArrowLeft size={16} />
                    </button>
                    <motion.button type="submit" className={`btn ${isCarrier ? 'btn-primary' : 'btn-teal'} btn-full btn-lg`} whileTap={{ scale: 0.98 }} disabled={loading} style={{ flex: 1 }}>
                      {loading ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* ── SIGNUP DONE ── */}
              {tab === 'signup' && step === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    style={{ width: 72, height: 72, borderRadius: '50%', background: isCarrier ? 'linear-gradient(135deg,#4F46E5,#6366F1)' : 'linear-gradient(135deg,#0EA5E9,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 size={36} color="#fff" />
                  </motion.div>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: 8 }}>Account Created! 🎉</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    Welcome to Xtra, <strong>{name}</strong>!<br />
                    Redirecting you to your {isCarrier ? 'Carrier' : 'Shipper'} dashboard…
                  </p>
                </motion.div>
              )}

            </AnimatePresence>

            <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
              By continuing you agree to Xtra's Logistics Terms & Privacy Standards
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
