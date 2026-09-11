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
    <PageShell title="Analytics" subtitle="Your performance insights">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <KPICard label="Trips Matched" value={kpi.tripsMatched} icon={<Truck size={16} />} accent="#6366F1" change={18} delay={0.05} />
          <KPICard label="Utilization" value={kpi.utilizationPct} unit="%" icon={<TrendingUp size={16} />} accent="#22D3EE" change={8} delay={0.1} />
          <KPICard label="Empty KM Avoided" value={kpi.emptyKmAvoided} unit="km" accent="#10B981" change={24} delay={0.15} />
          <KPICard label="CO₂ Saved" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={16} />} accent="#F59E0B" change={22} delay={0.2} />
        </div>

        {/* Earnings chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard variant="carrier" style={{ padding: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>💰 Weekly Earnings (₹)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.weekly} margin={{ left: -20, right: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Earnings']} />
                <Area type="monotone" dataKey="earnings" stroke="#6366F1" strokeWidth={2.5} fill="url(#earningsGrad)" dot={{ fill: '#6366F1', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Utilization chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard variant="carrier" style={{ padding: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>📊 Utilization % (This Week)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.weekly} margin={{ left: -20, right: 0 }}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="url(#utilGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* CO2 chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard style={{ padding: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>🌿 CO₂ Saved per Day (kg)</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={data.weekly} margin={{ left: -20, right: 0 }}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}kg`, 'CO₂ Saved']} />
                <Area type="monotone" dataKey="co2" stroke="#10B981" strokeWidth={2} fill="url(#co2Grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Monthly trips */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <GlassCard variant="carrier" style={{ padding: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>🚛 Monthly Trips Matched</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data.monthlyTrips} margin={{ left: -20, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="trips" fill="#6366F1" opacity={0.8} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

      </div>
    </PageShell>
  )
}
