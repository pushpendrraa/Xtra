import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  Truck,
  Package,
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  MapPin,
  Bell,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { useAuthStore, Role } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

export const CARRIER_TABS = [
  { label: 'Home',      icon: LayoutDashboard, path: '/carrier' },
  { label: 'Listings',  icon: PlusCircle,       path: '/carrier/listings' },
  { label: 'Matches',   icon: List,             path: '/carrier/matches' },
  { label: 'Bookings',  icon: MapPin,           path: '/carrier/bookings' },
  { label: 'Analytics', icon: BarChart3,        path: '/carrier/analytics' },
]

export const SHIPPER_TABS = [
  { label: 'Home',      icon: LayoutDashboard, path: '/shipper' },
  { label: 'Post Load', icon: Package,          path: '/shipper/post' },
  { label: 'Analytics', icon: BarChart3,        path: '/shipper/analytics' },
]

export function BottomNav() {
  const { activeRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Always sync effective role with URL pathname
  const isShipperRoute = location.pathname.startsWith('/shipper')
  const currentRole: Role = isShipperRoute ? 'shipper' : location.pathname.startsWith('/carrier') ? 'carrier' : activeRole
  const tabs = currentRole === 'shipper' ? SHIPPER_TABS : CARRIER_TABS
  const isCarrier = currentRole === 'carrier'

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active =
          location.pathname === tab.path ||
          (tab.path !== '/carrier' && tab.path !== '/shipper' && location.pathname.startsWith(tab.path))

        return (
          <button
            key={tab.path}
            className={`nav-tab ${active ? (isCarrier ? 'active' : 'active teal') : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <tab.icon size={22} />
            </motion.div>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function TopBar({ title, subtitle }: { title?: string; subtitle?: string; actions?: React.ReactNode }) {
  const { user, activeRole, setRole, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Always sync effective role with current URL
  const isShipperRoute = location.pathname.startsWith('/shipper')
  const currentRole: Role = isShipperRoute ? 'shipper' : location.pathname.startsWith('/carrier') ? 'carrier' : activeRole
  const tabs = currentRole === 'shipper' ? SHIPPER_TABS : CARRIER_TABS
  const isCarrier = currentRole === 'carrier'

  // Keep Zustand activeRole in sync with URL
  useEffect(() => {
    if (isShipperRoute && activeRole !== 'shipper') {
      setRole('shipper')
    } else if (location.pathname.startsWith('/carrier') && activeRole !== 'carrier') {
      setRole('carrier')
    }
  }, [location.pathname, isShipperRoute, activeRole, setRole])

  const selectRole = (targetRole: Role) => {
    setRole(targetRole)
    navigate(targetRole === 'shipper' ? '/shipper' : '/carrier')
  }

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            onClick={() => navigate(isCarrier ? '/carrier' : '/shipper')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: isCarrier
                ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                : 'linear-gradient(135deg, #0EA5E9, #0284C7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              boxShadow: isCarrier
                ? '0 4px 14px rgba(79, 70, 229, 0.35)'
                : '0 4px 14px rgba(2, 132, 199, 0.35)',
            }}
          >
            {isCarrier ? <Truck size={20} color="#fff" /> : <Package size={20} color="#fff" />}
          </div>

          <div
            onClick={() => navigate(isCarrier ? '/carrier' : '/shipper')}
            style={{ cursor: 'pointer', minWidth: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'Space Grotesk',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Xtra
              </span>
              <span
                className={`badge ${isCarrier ? 'badge-indigo' : 'badge-teal'}`}
                style={{ fontSize: '0.65rem', padding: '2px 8px' }}
              >
                {isCarrier ? 'Carrier' : 'Shipper'}
              </span>
            </div>
            {title ? (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 220,
                }}
              >
                {title} {subtitle ? `· ${subtitle}` : ''}
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Empty-Leg Freight
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="desktop-nav-links">
          {tabs.map((tab) => {
            const active =
              location.pathname === tab.path ||
              (tab.path !== '/carrier' && tab.path !== '/shipper' && location.pathname.startsWith(tab.path))

            return (
              <button
                key={tab.path}
                className={`desktop-nav-item ${active ? (isCarrier ? 'active' : 'active teal') : ''}`}
                onClick={() => navigate(tab.path)}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: Controls (Role Switcher, Theme Toggle, Notifications, User) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>


          {/* Bright / Dark Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Bright'} Theme`}
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={18} color="#D97706" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={18} color="#818CF8" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              background: 'var(--glass-white)',
              border: '1px solid var(--glass-border)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
            title="Notifications"
          >
            <Bell size={18} strokeWidth={1.8} />
            <span className="notif-dot" />
          </button>

          {/* User Avatar */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                className="avatar"
                style={{ width: 36, height: 36, fontSize: '0.85rem', cursor: 'pointer' }}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
              <button 
                onClick={() => { logout(); navigate('/') }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: '50%' }}
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function PageShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <>
      <TopBar title={title} subtitle={subtitle} actions={actions} />
      <main className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </>
  )
}

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ambient glowing orbs in the background */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      {/* Outlet renders child routes when used as a layout route */}
      <Outlet />
      {children}
    </div>
  )
}
