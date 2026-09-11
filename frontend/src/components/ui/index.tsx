import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

// ─── GlassCard ───────────────────────────────────────────────
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'carrier' | 'shipper'
  padding?: number | string
}
export function GlassCard({ children, variant = 'default', padding, className = '', style, ...rest }: GlassCardProps) {
  return (
    <div
      className={`card ${variant === 'carrier' ? 'card-carrier' : variant === 'shipper' ? 'card-shipper' : ''} ${className}`}
      style={{ padding: padding !== undefined ? padding : undefined, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────
interface KPICardProps {
  label: string
  value: string | number
  unit?: string
  change?: number
  icon?: React.ReactNode
  accent?: string
  delay?: number
}
export function KPICard({ label, value, unit, change, icon, accent = '#6366F1', delay = 0 }: KPICardProps) {
  const isUp = change !== undefined && change >= 0
  return (
    <motion.div
      className="card kpi-card"
      style={{ borderColor: `${accent}33` }}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Glow patch */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 100, height: 100,
        borderRadius: '50%', background: accent, opacity: 0.12, filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="kpi-label">{label}</span>
        {icon && <div style={{ color: accent, opacity: 0.8 }}>{icon}</div>}
      </div>
      <div className="kpi-value" style={{ color: accent }}>
        {value}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 4 }}>{unit}</span>
      </div>
      {change !== undefined && (
        <div className={`kpi-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(change)}% vs last week
        </div>
      )}
    </motion.div>
  )
}

// ─── Score Bar ────────────────────────────────────────────────
export function ScoreBar({ score, color = '#6366F1' }: { score: number; color?: string }) {
  return (
    <div className="score-bar" style={{ flex: 1 }}>
      <motion.div
        className="score-fill"
        style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${score * 100}%` }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────
const STATUS_CLASS: Record<string, string> = {
  confirmed: 'status-confirmed', picked_up: 'status-picked_up',
  in_transit: 'status-in_transit', delivered: 'status-delivered',
  open: 'status-open', cancelled: 'status-cancelled', proposed: 'status-proposed',
}
export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-pill ${STATUS_CLASS[status] || 'status-open'}`}>{status.replace(/_/g, ' ')}</span>
}

// ─── Star Rating ──────────────────────────────────────────────
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`star ${i < Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
      {action}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, body, cta }: { icon: string; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>{body}</p>
      {cta}
    </div>
  )
}

// ─── Shimmer Skeleton ─────────────────────────────────────────
export function Skeleton({ h = 16, w = '100%', radius = 8 }: { h?: number; w?: number | string; radius?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: radius }} />
}

// ─── Divider ──────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="divider" />
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
      <hr className="divider" style={{ flex: 1, margin: 0 }} />
      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <hr className="divider" style={{ flex: 1, margin: 0 }} />
    </div>
  )
}

// ─── Tag chip ────────────────────────────────────────────────
export function Tag({ label, color = 'indigo' }: { label: string; color?: string }) {
  return <span className={`badge badge-${color}`}>{label}</span>
}

// ─── Price Breakdown ──────────────────────────────────────────
export function PriceBreakdown({ breakdown }: { breakdown: Record<string, number> }) {
  const labels: Record<string, string> = {
    distanceCost: '🛣 Distance', weightCost: '⚖ Weight', volumeCost: '📦 Volume',
    urgencySurcharge: '⚡ Urgency', discountApplied: '🏷 Empty-leg discount', platformFee: '🏦 Platform fee',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Object.entries(breakdown).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{labels[k] || k}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: k === 'discountApplied' ? 'var(--emerald)' : 'var(--text-primary)' }}>
            {k === 'discountApplied' ? '−' : ''}₹{v.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
