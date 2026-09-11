import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Truck, Leaf, DollarSign, Plus, ChevronRight, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { KPICard, GlassCard, StatusBadge, SectionHeader } from '../../components/ui'
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Hero Greeting & Quick Action Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>{greeting},</p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>
              {user?.name?.split(' ')[0] ?? 'Carrier'} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
              You have <span style={{ color: '#D97706', fontWeight: 700 }}>{MOCK_MATCH_OFFERS.length} empty-leg match offers</span> waiting for confirmation
            </p>
          </motion.div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/carrier/listings/new')}
              className="btn btn-primary"
              style={{ boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)' }}
            >
              <Plus size={18} /> Post Empty Leg
            </button>
            <button
              onClick={() => navigate('/carrier/matches')}
              className="btn btn-ghost"
            >
              View Matches <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* KPI Grid (4 columns on desktop, 2 on phone) */}
        <div className="responsive-grid-4">
          <KPICard label="Trips This Week" value={kpi.tripsThisWeek} icon={<Truck size={18} />} accent="#4F46E5" change={15} delay={0.05} />
          <KPICard label="Capacity Utilized" value={kpi.utilizationPct} unit="%" icon={<TrendingUp size={18} />} accent="#0284C7" change={8} delay={0.1} />
          <KPICard label="CO₂ Avoided" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={18} />} accent="#059669" change={22} delay={0.15} />
          <KPICard label="Gross Earnings" value={`₹${(kpi.earningsINR / 1000).toFixed(1)}k`} icon={<DollarSign size={18} />} accent="#D97706" change={12} delay={0.2} />
        </div>

        {/* Responsive 2-Column Split for Desktop / Stacked for Phone */}
        <div className="responsive-split-2">

          {/* Left Column: Matches & Active Bookings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* 🔥 High-Score Match Offers */}
            <div>
              <SectionHeader
                title="🔥 Top Empty-Leg Matches"
                action={
                  <button
                    onClick={() => navigate('/carrier/matches')}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--indigo)', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    View all ({MOCK_MATCH_OFFERS.length}) <ChevronRight size={16} />
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MOCK_MATCH_OFFERS.slice(0, 3).map((offer, i) => (
                  <motion.div
                    key={offer.id}
                    className="card card-carrier"
                    style={{ padding: 18, cursor: 'pointer' }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    onClick={() => navigate('/carrier/matches')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {offer.shipment.pickup} → {offer.shipment.dropoff}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 3 }}>
                          {offer.shipment.weightKg} kg · {offer.shipment.volumeM3} m³ · {offer.shipment.type}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--emerald)' }}>
                          ₹{offer.priceQuote.toLocaleString()}
                        </div>
                        <span className="badge badge-indigo" style={{ marginTop: 4 }}>
                          Score {(offer.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} color="var(--text-tertiary)" /> Deadline: {offer.shipment.deadline.split(' ')[1]}
                      </span>
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        +{offer.detourKm}km detour
                      </span>
                      <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                        {offer.timeSlackMinutes}min slack
                      </span>
                      <div style={{ marginLeft: 'auto' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--indigo)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          Details <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 📦 Active Bookings */}
            <div>
              <SectionHeader
                title="📦 Current Active Trips"
                action={
                  <button
                    onClick={() => navigate('/carrier/bookings')}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--indigo)', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    All Bookings <ChevronRight size={16} />
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {MOCK_BOOKINGS.filter(b => b.status !== 'delivered').map((b, i) => (
                  <motion.div
                    key={b.id}
                    className="card"
                    style={{ padding: 18, cursor: 'pointer' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    onClick={() => navigate('/carrier/bookings')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{b.route.from} → {b.route.to}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          Shipper: {b.shipper.name} · Driver: {b.driver}
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Picked up {b.pickedUpAt}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                          ₹{b.finalPrice.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--indigo)' }}>
                          Verify POD →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Quick Insights, Environmental Snapshot & Route Health */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="sticky-desktop">

            {/* Quick Actions Card */}
            <GlassCard variant="carrier" style={{ padding: 22 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 14 }}>
                ⚡ Quick Operations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => navigate('/carrier/listings/new')}
                  className="btn btn-primary btn-full"
                  style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
                >
                  <Plus size={18} />
                  <div style={{ textAlign: 'left', marginLeft: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Post Empty Return Leg</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Auto-match with shippers on your return route</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/carrier/bookings/pod')}
                  className="btn btn-ghost btn-full"
                  style={{ justifyContent: 'flex-start', padding: '14px 18px' }}
                >
                  <ShieldCheck size={18} color="var(--emerald)" />
                  <div style={{ textAlign: 'left', marginLeft: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>POD Capture & OTP</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>GPS geo-stamp + digital delivery proof</div>
                  </div>
                </button>
              </div>
            </GlassCard>

            {/* Fleet Utilization & Green Impact */}
            <GlassCard style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>🌱 Sustainability Impact</h3>
                <span className="badge badge-emerald">Verified</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                By filling your empty return trips on the Mumbai–Pune corridor, you prevented redundant truck miles and cut fuel waste.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Empty KM Avoided</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.emptyKmAvoided} km</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: '74%', background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Corridor Fill Rate</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>78%</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: '78%', background: 'linear-gradient(90deg, #6366F1, #4F46E5)' }} />
                </div>
              </div>

              <button
                onClick={() => navigate('/carrier/analytics')}
                className="btn btn-ghost btn-full btn-sm"
                style={{ marginTop: 18 }}
              >
                Detailed Analytics Report →
              </button>
            </GlassCard>

          </div>

        </div>

      </div>
    </PageShell>
  )
}
