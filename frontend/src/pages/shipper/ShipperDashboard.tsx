import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Package, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { KPICard, SectionHeader } from '../../components/ui'
import { MOCK_SHIPPER_KPI, MOCK_BOOKINGS } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function ShipperDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const kpi = MOCK_SHIPPER_KPI
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Using mock bookings to represent shipment requests and carrier acceptance status
  const shipmentRequests = MOCK_BOOKINGS.slice(0, 4)

  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900, margin: '0 auto' }}>
        
        {/* Hero Greeting & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>{greeting},</p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>
              {user?.name?.split(' ')[0] ?? 'Shipper'} 📦
            </h1>
          </motion.div>
          <button
            onClick={() => navigate('/shipper/post')}
            className="btn btn-teal"
            style={{ boxShadow: '0 4px 16px rgba(13, 148, 136, 0.3)' }}
          >
            <Plus size={18} /> Post Shipment
          </button>
        </div>

        {/* Analytics (Simplified) */}
        <div>
          <SectionHeader title="📊 Quick Analytics" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <KPICard label="Shipments Booked" value={kpi.shipmentsBooked} icon={<Package size={18} />} accent="#0284C7" change={12} delay={0.05} />
            <KPICard label="Total Cost Saved" value={`₹${(kpi.costSavedINR / 1000).toFixed(1)}k`} icon={<DollarSign size={18} />} accent="#059669" change={18} delay={0.1} />
          </div>
        </div>

        {/* Shipment Requests Status */}
        <div>
          <SectionHeader title="📋 My Shipment Requests" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shipmentRequests.map((req, i) => {
              const isAccepted = req.status === 'in_transit' || req.status === 'delivered'
              const isPending = req.status === 'pending'

              return (
                <motion.div
                  key={req.id}
                  className="card card-shipper"
                  style={{ padding: 20 }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                    
                    {/* Route and Carrier Info */}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {req.route.from} → {req.route.to}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ opacity: 0.7 }}>Carrier:</span> 
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.driver}</span>
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: 2 }}>
                        Vehicle: {req.vehicle}
                      </div>
                    </div>
                    
                    {/* Acceptance Status Badge */}
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: 8, 
                      padding: '8px 14px', borderRadius: 24, fontSize: '0.82rem', fontWeight: 800,
                      background: isAccepted ? '#ECFDF5' : (isPending ? '#FFFBEB' : '#FEF2F2'),
                      color: isAccepted ? 'var(--emerald)' : (isPending ? '#D97706' : '#EF4444'),
                      border: `1px solid ${isAccepted ? '#A7F3D0' : (isPending ? '#FDE68A' : '#FECACA')}`
                    }}>
                      {isAccepted ? <CheckCircle2 size={16} /> : (isPending ? <Clock size={16} /> : <XCircle size={16} />)}
                      {isAccepted ? 'Accepted' : (isPending ? 'Pending Carrier' : 'Not Accepted')}
                    </div>

                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </PageShell>
  )
}
