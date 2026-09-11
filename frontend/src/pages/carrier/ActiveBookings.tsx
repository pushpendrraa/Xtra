import { motion } from 'framer-motion'
import { MapPin, Clock, User, Truck, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, StatusBadge, SectionHeader, EmptyState } from '../../components/ui'
import { MOCK_BOOKINGS } from '../../services/api'

export default function ActiveBookings() {
  const navigate = useNavigate()

  return (
    <PageShell title="Bookings" subtitle="All your trips">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* In-progress */}
        <SectionHeader title="🚛 In Progress" />
        {MOCK_BOOKINGS.filter(b => b.status !== 'delivered').map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard variant="carrier" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/carrier/bookings/pod')}>
              <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), transparent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{b.route.from} → {b.route.to}</div>
                  <StatusBadge status={b.status} />
                </div>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <User size={13} /> {b.shipper.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Truck size={13} /> {b.vehicle}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Clock size={13} /> Picked up: {b.pickedUpAt}
                </div>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#6EE7B7', fontSize: '1.05rem' }}>₹{b.finalPrice.toLocaleString()}</span>
                <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate('/carrier/bookings/pod') }}>
                  Capture POD
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* Completed */}
        <SectionHeader title="✅ Completed" />
        {MOCK_BOOKINGS.filter(b => b.status === 'delivered').map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
            <GlassCard style={{ padding: 16, opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{b.route.from} → {b.route.to}</div>
                <StatusBadge status={b.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>{b.shipper.name}</span>
                <span style={{ fontWeight: 700, color: '#6EE7B7' }}>₹{b.finalPrice.toLocaleString()}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageShell>
  )
}
