import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Package, Plus, CheckCircle2, Clock, XCircle, Loader2, ChevronRight } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { KPICard, SectionHeader } from '../../components/ui'
import { MOCK_SHIPPER_KPI, shipmentApi, bookingApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { connectSocket } from '../../services/socket'
import { BookingDetailSheet } from '../../components/ui/BookingDetailSheet'

export default function ShipperDashboard() {
  const { user } = useAuthStore() as any
  const navigate = useNavigate()
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [bookingDetail, setBookingDetail] = useState<any>(null)
  
  const kpi = MOCK_SHIPPER_KPI
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    shipmentApi.getMyRequests()
      .then(res => setShipments(res.data || []))
      .catch(err => console.error('Failed to fetch shipments:', err))
      .finally(() => setLoading(false))

    // Socket: listen for real-time delivery notification
    const rawToken = user?.token || JSON.parse(localStorage.getItem('xtra-auth') || '{}')?.state?.token
    if (rawToken) {
      const sock = connectSocket(rawToken)
      sock.on('booking:delivered', ({ bookingId, status }) => {
        // Update the relevant shipment in the list to show 'delivered'
        setShipments(prev => prev.map(s =>
          s.bookingId === bookingId || s._id === bookingId
            ? { ...s, status: 'delivered' }
            : s
        ))
      })
    }
  }, [])

  const openBookingDetail = async (shipment: any) => {
    // Try to find the associated booking from the API
    try {
      const res = await bookingApi.getMyBookings()
      const booking = res.data?.find((b: any) =>
        b.shipmentId?._id === shipment._id || b.shipmentId === shipment._id
      )
      if (booking) {
        const detail = await bookingApi.getById(booking._id)
        setBookingDetail(detail.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

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
            {loading ? (
              <div style={{ padding: 40, display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : shipments.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--glass-white)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-xl)' }}>
                No active shipment requests. Post a shipment to get started!
              </div>
            ) : (
              shipments.map((req, i) => {
                // Correct status mapping from ShipmentRequest model:
                // open = posted, waiting (no carrier accepted yet)
                // matched = a carrier accepted the booking
                // in_transit = shipment is being transported
                // delivered = complete
                const isOpen      = req.status === 'open'
                const isMatched   = req.status === 'matched' || req.status === 'in_transit'
                const isDelivered = req.status === 'delivered'
                const isCancelled = req.status === 'cancelled'
                const clickable   = isMatched || isDelivered

                return (
                  <motion.div
                    key={req._id || req.id}
                    className="card card-shipper"
                    style={{ padding: 20, cursor: clickable ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    onClick={() => clickable && openBookingDetail(req)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                      
                      {/* Route Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {req.pickup?.label?.split(',')[0] || 'Pickup'} → {req.dropoff?.label?.split(',')[0] || 'Dropoff'}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 6, display: 'flex', gap: 16 }}>
                          <span><span style={{ opacity: 0.7 }}>Weight:</span> {req.weightKg} kg</span>
                          <span><span style={{ opacity: 0.7 }}>Volume:</span> {req.volumeM3} m³</span>
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: 4 }}>
                          Type: <span style={{ textTransform: 'capitalize' }}>{req.shipmentType}</span> | Expected: ₹{req.expectedPrice}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 8, 
                          padding: '8px 14px', borderRadius: 24, fontSize: '0.82rem', fontWeight: 800,
                          ...(isDelivered ? {
                            background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)'
                          } : isMatched ? {
                            background: '#ECFDF5', color: 'var(--emerald)', border: '1px solid #A7F3D0'
                          } : isOpen ? {
                            background: 'rgba(99,102,241,0.08)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)'
                          } : {
                            background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA'
                          })
                        }}>
                          {isDelivered ? <CheckCircle2 size={16} /> 
                            : isMatched ? <CheckCircle2 size={16} /> 
                            : isOpen ? <Clock size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
                            : <XCircle size={16} />}
                          {isDelivered ? 'Delivered ✓'
                            : isMatched ? 'Carrier Assigned ✓'
                            : isOpen ? 'Searching for Carriers…'
                            : 'Cancelled'}
                        </div>
                        {clickable && <ChevronRight size={16} color="var(--text-tertiary)" />}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* Booking detail sheet */}
      <AnimatePresence>
        {bookingDetail && (
          <BookingDetailSheet
            key={bookingDetail._id}
            booking={bookingDetail}
            role="shipper"
            onClose={() => setBookingDetail(null)}
          />
        )}
      </AnimatePresence>
    </PageShell>
  )
}

