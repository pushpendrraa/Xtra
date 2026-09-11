import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Truck, Package, LayoutDashboard, PlusCircle, List, BarChart3, MapPin, Bell } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const CARRIER_TABS = [
  { label: 'Home',     icon: LayoutDashboard, path: '/carrier' },
  { label: 'Listings', icon: PlusCircle,       path: '/carrier/listings' },
  { label: 'Matches',  icon: List,             path: '/carrier/matches' },
  { label: 'Bookings', icon: MapPin,           path: '/carrier/bookings' },
  { label: 'Analytics',icon: BarChart3,        path: '/carrier/analytics' },
]
const SHIPPER_TABS = [
  { label: 'Home',     icon: LayoutDashboard, path: '/shipper' },
  { label: 'Ship',     icon: PlusCircle,       path: '/shipper/post' },
  { label: 'Matches',  icon: List,             path: '/shipper/matches' },
  { label: 'Track',    icon: MapPin,           path: '/shipper/track' },
  { label: 'Analytics',icon: BarChart3,        path: '/shipper/analytics' },
]

export function BottomNav() {
  const { activeRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = activeRole === 'carrier' ? CARRIER_TABS : SHIPPER_TABS
  const accent = activeRole === 'carrier' ? 'var(--indigo-bright)' : 'var(--teal)'

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path || (tab.path !== '/carrier' && tab.path !== '/shipper' && location.pathname.startsWith(tab.path))
        return (
          <button
            key={tab.path}
            className={`nav-tab ${active ? (activeRole === 'carrier' ? 'active' : 'active teal') : ''}`}
            onClick={() => navigate(tab.path)}
            style={{ color: active ? accent : undefined }}
          >
            <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <tab.icon size={22} strokeWidth={active ? 2 : 1.75} />
            </motion.div>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}

export function TopBar({ title, subtitle, actions }: { title?: string; subtitle?: string; actions?: React.ReactNode }) {
  const { user, activeRole, setRole } = useAuthStore()
  const navigate = useNavigate()

  const toggleRole = () => {
    const next = activeRole === 'carrier' ? 'shipper' : 'carrier'
    setRole(next)
    navigate(next === 'carrier' ? '/carrier' : '/shipper')
  }

  return (
    <header className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {/* Logo */}
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: activeRole === 'carrier'
            ? 'linear-gradient(135deg, #6366F1, #4338CA)'
            : 'linear-gradient(135deg, #22D3EE, #0891B2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: activeRole === 'carrier' ? '0 0 16px rgba(99,102,241,0.5)' : '0 0 16px rgba(34,211,238,0.5)',
        }}>
          {activeRole === 'carrier' ? <Truck size={18} color="#fff" /> : <Package size={18} color="#fff" />}
        </div>

        {title ? (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Space Grotesk', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{subtitle}</div>}
          </div>
        ) : (
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
            Xtra
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Role Toggle */}
        <div className="role-toggle">
          <AnimatePresence mode="wait">
            <button
              className={`role-pill ${activeRole === 'carrier' ? 'active-carrier' : ''}`}
              onClick={() => { if (activeRole !== 'carrier') toggleRole() }}
            >
              🚛 Carrier
            </button>
            <button
              className={`role-pill ${activeRole === 'shipper' ? 'active-shipper' : ''}`}
              onClick={() => { if (activeRole !== 'shipper') toggleRole() }}
            >
              📦 Shipper
            </button>
          </AnimatePresence>
        </div>

        {/* Notification */}
        <button style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
          <Bell size={20} strokeWidth={1.75} />
          <span className="notif-dot" />
        </button>

        {/* Avatar */}
        {user && (
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            {user.name.charAt(0)}
          </div>
        )}
      </div>
    </header>
  )
}

export function PageShell({ children, title, subtitle, actions }: {
  children: React.ReactNode; title?: string; subtitle?: string; actions?: React.ReactNode
}) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} actions={actions} />
      <main className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ambient orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      {children}
    </div>
  )
}
