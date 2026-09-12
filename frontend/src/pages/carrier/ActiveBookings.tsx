import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../../components/layout/Shell'
import { SectionHeader, GlassCard, StatusBadge } from '../../components/ui'
import { bookingApi } from '../../services/api'
import { BookingDetailSheet } from '../../components/ui/BookingDetailSheet'
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'

export default function ActiveBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await bookingApi.getMyBookings()
      const active = res.data?.filter((b: any) => !['delivered', 'cancelled'].includes(b.status)) || []
      setBookings(active)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (booking: any) => {
    try {
      const res = await bookingApi.getById(booking._id)
      setSelected(res.data)
    } catch { setSelected(booking) }
  }

  const handleDelivered = (bookingId: string) => {
    setBookings(bs => bs.filter(b => b._id !== bookingId))
    setSelected(null)
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
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading bookings…</p>
          </div>
        ) : error ? (
          <GlassCard style={{ padding: 24, textAlign: 'center' }}>
            <AlertCircle size={32} color="var(--rose)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={fetchBookings} className="btn btn-outline" style={{ marginTop: 16 }}>Retry</button>
          </GlassCard>
        ) : bookings.length === 0 ? (
          <GlassCard style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No active bookings.</p>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => openDetail(booking)}
                style={{ cursor: 'pointer' }}
              >
                <GlassCard variant="carrier" style={{ padding: 20, transition: 'transform 0.15s', ':hover': { transform: 'scale(1.01)' } }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                        {booking.shipmentId?.pickup?.label?.split(',')[0] || booking.routeFrom || '—'}
                        {' → '}
                        {booking.shipmentId?.dropoff?.label?.split(',')[0] || booking.routeTo || '—'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Shipper: {booking.shipperId?.name || 'Unknown'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusBadge status={booking.status} />
                      <ChevronRight size={16} color="var(--text-tertiary)" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {booking.shipmentId?.deadline
                        ? `Deadline: ${new Date(booking.shipmentId.deadline).toLocaleDateString()}`
                        : 'Tap to view details'}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      ₹{(booking.finalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {selected && (
          <BookingDetailSheet
            key={selected._id}
            booking={selected}
            role="carrier"
            onClose={() => setSelected(null)}
            onDelivered={handleDelivered}
          />
        )}
      </AnimatePresence>
    </PageShell>
  )
}
