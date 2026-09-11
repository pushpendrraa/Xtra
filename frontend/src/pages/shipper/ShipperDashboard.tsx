import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Package, Leaf, DollarSign, Clock, ChevronRight, Plus } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { KPICard, GlassCard, StatusBadge, SectionHeader } from '../../components/ui'
import { MOCK_SHIPPER_KPI, MOCK_SHIPMENTS, MOCK_TRACKING } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function ShipperDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const kpi = MOCK_SHIPPER_KPI

  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: 4 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Welcome back,</p>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
            {user?.name?.split(' ')[0] ?? 'Shipper'} 📦
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>
            <span style={{ color: '#67E8F9', fontWeight: 700 }}>₹{kpi.costSavedINR.toLocaleString()}</span> saved vs market rates this month
          </p>
        </motion.div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <KPICard label="Shipments" value={kpi.shipmentsBooked} icon={<Package size={18} />} accent="#22D3EE" change={12} delay={0.05} />
          <KPICard label="Cost Saved" value={`₹${(kpi.costSavedINR / 1000).toFixed(1)}k`} icon={<DollarSign size={18} />} accent="#10B981" change={18} delay={0.1} />
          <KPICard label="CO₂ Saved" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={18} />} accent="#6366F1" change={22} delay={0.15} />
          <KPICard label="Avg Delivery" value={kpi.avgDeliveryHrs} unit="hrs" icon={<Clock size={18} />} accent="#F59E0B" change={-5} delay={0.2} />
        </div>

        {/* Active Shipments */}
        <div>
          <SectionHeader title="📦 My Shipments" action={
            <button onClick={() => navigate('/shipper/post')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--teal)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none' }}>
              <Plus size={14} /> New
            </button>
          } />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_SHIPMENTS.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.1 }}>
                <GlassCard variant="shipper" style={{ padding: 16, cursor: 'pointer' }}
                  onClick={() => navigate(s.status === 'booked' ? '/shipper/track' : '/shipper/matches')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.pickup} → {s.dropoff}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {s.weightKg}kg · {s.volumeM3}m³ · {s.type}
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> Deadline: {s.deadline}
                    </span>
                    {s.status === 'open' && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#67E8F9' }}>View Matches →</span>
                    )}
                    {s.status === 'booked' && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6EE7B7' }}>Track Live →</span>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live tracking teaser */}
        {MOCK_SHIPMENTS.some(s => s.status === 'booked') && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard variant="shipper" style={{ padding: 16, cursor: 'pointer', borderColor: 'rgba(34,211,238,0.3)' }}
              onClick={() => navigate('/shipper/track')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-teal badge-dot">Live</span>
                    <span style={{ fontWeight: 700 }}>Shipment In Transit</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    ETA: {MOCK_TRACKING.eta} · {MOCK_TRACKING.carrier.driver}
                  </div>
                </div>
                <ChevronRight size={20} color="var(--teal)" />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Quick post CTA */}
        <GlassCard variant="shipper" style={{ padding: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>Ship something today</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            Get up to 40% off market freight rates by leveraging empty-leg capacity
          </p>
          <button className="btn btn-teal btn-full" onClick={() => navigate('/shipper/post')}>
            <Plus size={16} /> Post a Shipment
          </button>
        </GlassCard>

      </div>
    </PageShell>
  )
}
