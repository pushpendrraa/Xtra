import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Truck, Leaf, DollarSign, Plus, ChevronRight, Clock, Star } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { KPICard, GlassCard, StatusBadge, SectionHeader, EmptyState } from '../../components/ui'
import { MOCK_CARRIER_KPI, MOCK_BOOKINGS, MOCK_MATCH_OFFERS } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function CarrierDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const kpi = MOCK_CARRIER_KPI
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero Greeting */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: 4 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{greeting},</p>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
            {user?.name?.split(' ')[0] ?? 'Carrier'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>
            You have <span style={{ color: '#FCD34D', fontWeight: 700 }}>{MOCK_MATCH_OFFERS.length} new match offers</span> waiting
          </p>
        </motion.div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <KPICard label="Trips This Week" value={kpi.tripsThisWeek} icon={<Truck size={18} />} accent="#6366F1" change={15} delay={0.05} />
          <KPICard label="Utilization" value={kpi.utilizationPct} unit="%" icon={<TrendingUp size={18} />} accent="#22D3EE" change={8} delay={0.1} />
          <KPICard label="CO₂ Saved" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={18} />} accent="#10B981" change={22} delay={0.15} />
          <KPICard label="Earnings" value={`₹${(kpi.earningsINR / 1000).toFixed(1)}k`} icon={<DollarSign size={18} />} accent="#F59E0B" change={12} delay={0.2} />
        </div>

        {/* New Match Offers */}
        <div>
          <SectionHeader title="🔥 New Match Offers" action={
            <button onClick={() => navigate('/carrier/matches')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--indigo-bright)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none' }}>
              View all <ChevronRight size={14} />
            </button>
          } />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_MATCH_OFFERS.slice(0, 2).map((offer, i) => (
              <motion.div key={offer.id} className="card card-carrier" style={{ padding: 16, cursor: 'pointer' }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.1 }}
                onClick={() => navigate('/carrier/matches')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{offer.shipment.pickup} → {offer.shipment.dropoff}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>
                      {offer.shipment.weightKg}kg · {offer.shipment.volumeM3}m³ · {offer.shipment.type}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#6EE7B7' }}>₹{offer.priceQuote.toLocaleString()}</div>
                    <span className="badge badge-indigo" style={{ marginTop: 4 }}>Score {(offer.score * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Deadline {offer.shipment.deadline.split(' ')[1]}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+{offer.detourKm}km detour</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{offer.timeSlackMinutes}min slack</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Bookings */}
        <div>
          <SectionHeader title="📦 Active Bookings" action={
            <button onClick={() => navigate('/carrier/bookings')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--indigo-bright)', fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none' }}>
              View all <ChevronRight size={14} />
            </button>
          } />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_BOOKINGS.filter(b => b.status !== 'delivered').map((b, i) => (
              <motion.div key={b.id} className="card" style={{ padding: 16 }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{b.route.from} → {b.route.to}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{b.shipper.name} · {b.driver}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Picked up {b.pickedUpAt}</span>
                  <span style={{ fontWeight: 700, color: '#6EE7B7' }}>₹{b.finalPrice.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <GlassCard variant="carrier" style={{ padding: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.9rem' }}>Quick Actions</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => navigate('/carrier/listings')}>
              <Plus size={15} /> New Listing
            </button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => navigate('/carrier/analytics')}>
              <TrendingUp size={15} /> Analytics
            </button>
          </div>
        </GlassCard>

        {/* Rating badge */}
        <motion.div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="avatar avatar-lg">{user?.name?.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{kpi.tripsMatched} trips completed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Star size={14} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.ratingAvg}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>({user?.ratingCount} reviews)</span>
            </div>
          </div>
          <span className="badge badge-emerald badge-dot">Verified</span>
        </motion.div>

      </div>
    </PageShell>
  )
}
