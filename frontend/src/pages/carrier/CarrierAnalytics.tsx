import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Leaf, TrendingUp, DollarSign, Truck } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, KPICard } from '../../components/ui'
import { MOCK_ANALYTICS_CARRIER, MOCK_CARRIER_KPI } from '../../services/api'

export default function CarrierAnalytics() {
  const kpi = MOCK_CARRIER_KPI
  const data = MOCK_ANALYTICS_CARRIER

  return (
    <PageShell title="Performance Analytics" subtitle="Fleet utilization and earnings intelligence">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPI row (4 on desktop, 2 on phone) */}
        <div className="responsive-grid-4">
          <KPICard label="Trips Matched" value={kpi.tripsMatched} icon={<Truck size={18} />} accent="#4F46E5" change={18} delay={0.05} />
          <KPICard label="Fleet Utilization" value={kpi.utilizationPct} unit="%" icon={<TrendingUp size={18} />} accent="#0284C7" change={8} delay={0.1} />
          <KPICard label="Empty KM Avoided" value={kpi.emptyKmAvoided} unit="km" accent="#059669" change={24} delay={0.15} />
          <KPICard label="CO₂ Saved" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={18} />} accent="#D97706" change={22} delay={0.2} />
        </div>

        {/* Charts Grid (2 columns on desktop, stacked on mobile) */}
        <div className="responsive-charts-grid">

          {/* Earnings chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard variant="carrier" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>💰 Weekly Revenue (₹)</p>
                <span className="badge badge-indigo">This Week</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.weekly} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Earnings']} />
                  <Area type="monotone" dataKey="earnings" stroke="#4F46E5" strokeWidth={3} fill="url(#earningsGrad)" dot={{ fill: '#4F46E5', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Utilization chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <GlassCard variant="carrier" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>📊 Capacity Utilization (%)</p>
                <span className="badge badge-teal">Daily %</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weekly} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Utilization']} />
                  <Bar dataKey="utilization" fill="url(#utilGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* CO2 chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <GlassCard style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>🌿 Daily CO₂ Abatement (kg)</p>
                <span className="badge badge-emerald">Scope 3</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.weekly} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(v: number) => [`${v} kg`, 'CO₂ Avoided']} />
                  <Area type="monotone" dataKey="co2" stroke="#059669" strokeWidth={3} fill="url(#co2Grad)" dot={{ fill: '#059669', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Monthly trips */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <GlassCard variant="carrier" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>🚛 Monthly Empty-Leg Trips</p>
                <span className="badge badge-indigo">H1 2026</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyTrips} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(v: number) => [`${v} trips`, 'Trips Matched']} />
                  <Bar dataKey="trips" fill="#4F46E5" opacity={0.85} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

        </div>

      </div>
    </PageShell>
  )
}
