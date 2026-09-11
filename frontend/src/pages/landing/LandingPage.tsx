import { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Truck, Package, TrendingUp, Leaf, ShieldCheck, MapPin,
  Zap, Star, ArrowRight, ChevronDown, Globe, BarChart3, Clock, Sun, Moon,
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

function useCounter(target: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const handle = setInterval(() => {
      start += step
      if (start >= target) { start = target; clearInterval(handle) }
      if (ref.current) ref.current.textContent = Math.round(start).toLocaleString()
    }, 16)
    return () => clearInterval(handle)
  }, [inView, target, duration])
  return ref
}

const FEATURES = [
  { icon: Zap, color: '#F59E0B', bg: '#FFFBEB', title: 'Smart Matching', desc: 'AI-powered algorithm matches empty-leg runs with shipments — sub-60-second results.' },
  { icon: MapPin, color: '#4F46E5', bg: '#EEF2FF', title: 'Live GPS Tracking', desc: 'Real-time location updates and ETA predictions for every shipment in motion.' },
  { icon: Leaf, color: '#10B981', bg: '#ECFDF5', title: 'Carbon Footprint', desc: 'Scope 3 emissions tracking and reporting — helping you hit your ESG targets.' },
  { icon: ShieldCheck, color: '#0EA5E9', bg: '#F0F9FF', title: 'POD + OTP Verified', desc: 'GPS-stamped Proof of Delivery with OTP confirmation. Dispute-free billing.' },
  { icon: BarChart3, color: '#8B5CF6', bg: '#F5F3FF', title: 'Analytics Dashboard', desc: 'Revenue trends, utilisation rates, and cost insights at a glance.' },
  { icon: Globe, color: '#F97316', bg: '#FFF7ED', title: 'Pan-India Network', desc: 'Thousands of verified carriers across 500+ routes and growing daily.' },
]

const STATS = [
  { value: 40, suffix: '%', label: 'More Revenue for Carriers' },
  { value: 35, suffix: '%', label: 'Cost Savings for Shippers' },
  { value: 500, suffix: '+', label: 'Active Routes' },
  { value: 98, suffix: '%', label: 'On-Time Delivery Rate' },
]

const TESTIMONIALS = [
  { name: 'Ravi Sharma', role: 'Fleet Owner · Delhi', text: 'My trucks used to return empty 60% of the time. With Xtra I fill those runs and made ₹18L extra last quarter.', avatar: '🚛', stars: 5 },
  { name: 'Priya Nair', role: 'Logistics Head · Mumbai', text: 'We cut freight spend by 32% in 3 months. The real-time tracking alone saved us countless support calls.', avatar: '📦', stars: 5 },
  { name: 'Arjun Mehra', role: 'Supply Chain · Bangalore', text: 'Onboarding took 10 minutes. The dashboard is intuitive and the carrier matching is genuinely impressive.', avatar: '⚡', stars: 5 },
]

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const controls = useAnimation()
  useEffect(() => { if (inView) controls.start('visible') }, [inView, controls])
  return (
    <motion.div ref={ref} initial="hidden" animate={controls} style={style}
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } } }}>
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  const s0 = useCounter(40); const s1 = useCounter(35); const s2 = useCounter(500); const s3 = useCounter(98)
  const statRefs = [s0, s1, s2, s3]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', overflowX: 'hidden', position: 'relative' }}>
      <div className="bg-orbs"><div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" /><div className="bg-orb bg-orb-3" /></div>

      {/* NAVBAR */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)', padding: '0 clamp(16px,5vw,80px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>Xtra</span>
        </div>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Features','How It Works','Testimonials'].map(l => (
            <a key={l} href={"#"} style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}>{l}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Sun size={16} color="#D97706" /> : <Moon size={16} color="#818CF8" />}
          </button>
          <motion.button className="btn btn-ghost btn-sm" style={{ fontWeight: 700 }} onClick={() => navigate('/auth')} whileTap={{ scale: 0.97 }}>Sign In</motion.button>
          <motion.button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')} whileTap={{ scale: 0.97 }}>Get Started <ArrowRight size={14} /></motion.button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,15vh,160px) clamp(20px,5vw,80px) 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)', border: '1px solid #C7D2FE', borderRadius: 999, padding: '6px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#4F46E5', marginBottom: 28, letterSpacing: '0.04em' }}>
          <Zap size={12} /> India's First Empty-Leg Freight Network
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 820, marginBottom: 20 }}>
          Fill Empty Trucks.{' '}
          <span style={{ background: 'linear-gradient(135deg,#4F46E5,#0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cut Freight Costs.</span>{' '}
          Track Everything.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 'clamp(1rem,2.2vw,1.2rem)', color: 'var(--text-secondary)', maxWidth: 580, lineHeight: 1.7, marginBottom: 44 }}>
          Xtra connects carriers with empty return runs to shippers who need cost-effective, verified freight — all in under 60 seconds.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
          <motion.button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', gap: 8 }} onClick={() => navigate('/auth?role=carrier')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Truck size={18} /> I'm a Carrier
          </motion.button>
          <motion.button className="btn btn-teal" style={{ padding: '14px 28px', fontSize: '1rem', gap: 8 }} onClick={() => navigate('/auth?role=shipper')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Package size={18} /> I'm a Shipper
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ width: '100%', maxWidth: 780, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 48 }}>
          {[{ icon: '🚛', label: 'Carrier Dashboard', desc: 'Post listings, manage bookings & POD', color: '#4F46E5' }, { icon: '📦', label: 'Shipper Portal', desc: 'Post loads, find carriers & track live', color: '#0EA5E9' }, { icon: '⚡', label: 'Instant Matching', desc: 'AI match in under 60 seconds', color: '#F59E0B' }].map((c, i) => (
            <motion.div key={c.label} className="card" style={{ padding: '20px 18px', textAlign: 'left' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }} whileHover={{ y: -4 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: c.color, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }} onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}>
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* STATS */}
      <section id="stats" style={{ position: 'relative', zIndex: 1, padding: '0 clamp(20px,5vw,80px) 80px' }}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 2, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 24, overflow: 'hidden' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: '32px 20px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                <div style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--indigo)', lineHeight: 1 }}>
                  <span ref={statRefs[i]}>0</span>{s.suffix}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '60px clamp(20px,5vw,80px)' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--indigo)', textTransform: 'uppercase', marginBottom: 12 }}>Platform Capabilities</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>Everything Freight Needs</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.7 }}>A complete end-to-end logistics platform, from matching to delivery confirmation.</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => { const Icon = f.icon; return (
            <FadeIn key={f.title} delay={i * 0.08}>
              <motion.div className="card" style={{ padding: '26px 22px', height: '100%' }} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon size={22} color={f.color} /></div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            </FadeIn>
          )})}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '60px clamp(20px,5vw,80px)' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>Up & Running in 4 Steps</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {[{ step: '01', icon: '👤', title: 'Sign Up & Set Role', desc: 'Create an account, choose Carrier or Shipper, complete KYC in minutes.' }, { step: '02', icon: '📋', title: 'Post Your Need', desc: 'Carriers post available truck runs; Shippers post cargo requirements.' }, { step: '03', icon: '⚡', title: 'Instant AI Match', desc: 'Our engine finds the best match by route, timing, and capacity.' }, { step: '04', icon: '✅', title: 'Book & Track', desc: 'Confirm booking, track GPS live, receive OTP-signed POD on delivery.' }].map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.1}>
              <div className="card" style={{ padding: '28px 22px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 18, fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{s.step}</div>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ position: 'relative', zIndex: 1, padding: '60px clamp(20px,5vw,80px)' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: '#F59E0B', textTransform: 'uppercase', marginBottom: 12 }}>Trusted by Logistics Leaders</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>Real Results, Real People</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <motion.div className="card" style={{ padding: '28px 22px' }} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>{Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={14} color="#F59E0B" fill="#F59E0B" />)}</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#EEF2FF,#E0F2FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{t.avatar}</div>
                  <div><div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{t.name}</div><div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>{t.role}</div></div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* DUAL CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px clamp(20px,5vw,80px) 80px' }}>
        <FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            <motion.div whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(79,70,229,0.25)' }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{ borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#4F46E5 0%,#6366F1 50%,#818CF8 100%)', padding: '44px 36px', color: '#fff', cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate('/auth?role=carrier')}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <Truck size={36} style={{ marginBottom: 20 }} />
              <h3 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 12, letterSpacing: '-0.02em' }}>For Carriers</h3>
              <p style={{ opacity: 0.85, lineHeight: 1.7, marginBottom: 24, fontSize: '0.9rem' }}>Stop losing money on empty return legs. List your available runs and let Xtra fill them with verified cargo.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><TrendingUp size={16} /> Earn up to 40% more per truck <ArrowRight size={16} /></div>
            </motion.div>
            <motion.div whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(14,165,233,0.25)' }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{ borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#0EA5E9 0%,#06B6D4 50%,#22D3EE 100%)', padding: '44px 36px', color: '#fff', cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate('/auth?role=shipper')}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <Package size={36} style={{ marginBottom: 20 }} />
              <h3 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 12, letterSpacing: '-0.02em' }}>For Shippers</h3>
              <p style={{ opacity: 0.85, lineHeight: 1.7, marginBottom: 24, fontSize: '0.9rem' }}>Find verified carriers for your cargo at below-market rates. Real-time tracking included. No hidden charges.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><Clock size={16} /> Book in under 60 seconds <ArrowRight size={16} /></div>
            </motion.div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '32px clamp(20px,5vw,80px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#4F46E5,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={16} color="#fff" /></div>
          <span style={{ fontWeight: 900, letterSpacing: '-0.03em' }}>Xtra</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>· India's Freight Matching Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['Privacy','Terms','Support','API Docs'].map(l => <a key={l} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 600 }}>{l}</a>)}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>© 2025 Xtra Logistics · Built for HackX</div>
      </footer>
    </div>
  )
}

