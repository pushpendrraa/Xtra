import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Leaf, DollarSign, Package, TrendingDown } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, KPICard } from '../../components/ui'
import { MOCK_ANALYTICS_SHIPPER, MOCK_SHIPPER_KPI } from '../../services/api'

export default function ShipperAnalytics() {
  const kpi = MOCK_SHIPPER_KPI
  const data = MOCK_ANALYTICS_SHIPPER

  return (
    <PageShell title="Analytics" subtitle="Your shipping insights">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <KPICard label="Shipments" value={kpi.shipmentsBooked} icon={<Package size={16} />} accent="#22D3EE" change={12} delay={0.05} />
          <KPICard label="Cost Saved" value={`₹${(kpi.costSavedINR / 1000).toFixed(1)}k`} icon={<DollarSign size={16} />} accent="#10B981" change={18} delay={0.1} />
          <KPICard label="CO₂ Reduced" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={16} />} accent="#6366F1" change={22} delay={0.15} />
          <KPICard label="Avg Delivery" value={`${kpi.avgDeliveryHrs}h`} icon={<TrendingDown size={16} />} accent="#F59E0B" change={-8} delay={0.2} />
        </div>

        {/* Cost saved chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard variant="shipper" style={{ padding: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>💚 Cost Saved vs Market (₹/day)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.weekly} margin={{ left: -20, right: 0 }}>
                <defs>
                  <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Saved']} />
                <Area type="monotone" dataKey="costSaved" stroke="#22D3EE" strokeWidth={2.5} fill="url(#savedGrad)" dot={{ fill: '#22D3EE', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* CO2 chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard style={{ padding: 18 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>🌿 CO₂ Reduction per Day (kg)</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data.weekly} margin={{ left: -20, right: 0 }}>
                <defs>
                  <linearGradient id="co2ShipGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}kg`, 'CO₂ Reduced']} />
                <Bar dataKey="co2" fill="url(#co2ShipGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Savings summary card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard variant="shipper" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🌍</div>
            <h3 style={{ fontWeight: 800, marginBottom: 4 }}>Your Environmental Impact</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              By choosing Xtra's empty-leg freight, you've contributed to cleaner logistics
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { val: `${kpi.co2SavedKg}kg`, label: 'CO₂ Avoided', color: '#6EE7B7' },
                { val: `₹${kpi.costSavedINR.toLocaleString()}`, label: 'Money Saved', color: '#67E8F9' },
              ].map(s => (
                <div key={s.label} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

      </div>
    </PageShell>
  )
}
