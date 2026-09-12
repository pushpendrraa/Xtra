import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/Shell'
import { SectionHeader, GlassCard, StatusBadge } from '../../components/ui'
import { bookingApi } from '../../services/api'
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'

export default function ActiveBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingApi.getMyBookings()
      // Filter for active bookings (not delivered/cancelled)
      const active = res.data?.filter((b: any) => !['delivered', 'cancelled'].includes(b.status)) || []
      setBookings(active)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionHeader 
          title="📦 Active Bookings" 
          action={
            <button onClick={fetchBookings} className="btn btn-ghost btn-sm" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          }
        />
        
        {loading && bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <GlassCard style={{ padding: 24, textAlign: 'center', borderColor: 'var(--rose)' }}>
            <AlertCircle size={32} color="var(--rose)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={fetchBookings} className="btn btn-outline" style={{ marginTop: 16 }}>Retry</button>
          </GlassCard>
        ) : bookings.length === 0 ? (
          <GlassCard style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No active bookings at the moment.</p>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard variant="carrier" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {booking.shipmentId?.pickup?.label?.split(',')[0]} → {booking.shipmentId?.dropoff?.label?.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Shipper: {booking.shipperId?.name || 'Unknown Shipper'}
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Deadline: {booking.shipmentId?.deadline ? new Date(booking.shipmentId.deadline).toLocaleDateString() : 'N/A'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        ₹{booking.priceQuote?.toLocaleString() || 0}
                      </span>
                      <button className="btn btn-ghost btn-sm">Verify POD <ChevronRight size={14}/></button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
