import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Leaf, DollarSign, Package, TrendingDown, Award } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, KPICard } from '../../components/ui'
import { MOCK_ANALYTICS_SHIPPER, MOCK_SHIPPER_KPI } from '../../services/api'

export default function ShipperAnalytics() {
  const kpi = MOCK_SHIPPER_KPI
  const data = MOCK_ANALYTICS_SHIPPER

  return (
    <PageShell title="Shipper Intelligence" subtitle="Freight cost optimization and sustainability report">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPI row (4 on desktop, 2 on phone) */}
        <div className="responsive-grid-4">
          <KPICard label="Shipments Booked" value={kpi.shipmentsBooked} icon={<Package size={18} />} accent="#0284C7" change={12} delay={0.05} />
          <KPICard label="Total Cost Saved" value={`₹${(kpi.costSavedINR / 1000).toFixed(1)}k`} icon={<DollarSign size={18} />} accent="#059669" change={18} delay={0.1} />
          <KPICard label="CO₂ Emissions Cut" value={kpi.co2SavedKg} unit="kg" icon={<Leaf size={18} />} accent="#4F46E5" change={22} delay={0.15} />
          <KPICard label="Avg Delivery Time" value={`${kpi.avgDeliveryHrs}h`} icon={<TrendingDown size={18} />} accent="#D97706" change={-8} delay={0.2} />
        </div>

        {/* Responsive 2-Column Chart Grid */}
        <div className="responsive-charts-grid">

          {/* Cost saved chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard variant="shipper" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>💚 Daily Cost Savings (₹ vs Market)</p>
                <span className="badge badge-emerald">32% Avg Savings</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.weekly} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Saved']} />
                  <Area type="monotone" dataKey="costSaved" stroke="#0284C7" strokeWidth={3} fill="url(#savedGrad)" dot={{ fill: '#0284C7', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* CO2 chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <GlassCard style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>🌿 Daily Carbon Savings (kg CO₂)</p>
                <span className="badge badge-emerald">Verified</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weekly} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="co2ShipGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(v: number) => [`${v} kg`, 'CO₂ Reduced']} />
                  <Bar dataKey="co2Saved" fill="url(#co2ShipGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

        </div>

        {/* Environmental impact summary card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard style={{ padding: 24, border: '1px solid #A7F3D0', background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Award size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065F46' }}>Green Logistics Partner Certification</h3>
                  <span className="badge badge-emerald" style={{ background: '#D1FAE5', color: '#047857' }}>ESG Compliant</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#047857', marginTop: 4, lineHeight: 1.6 }}>
                  By pooling return trips, your enterprise eliminated <strong>480 kg of carbon emissions</strong> across Western corridors this quarter, equivalent to planting <strong>22 urban trees</strong>.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </div>
    </PageShell>
  )
}
