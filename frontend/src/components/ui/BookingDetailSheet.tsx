/**
 * BookingDetailSheet.tsx
 * Bottom-sheet showing full booking details for both carrier and shipper.
 * Carrier: sees shipper contact + "Mark Delivered" button.
 * Shipper: sees carrier contact (name, phone, vehicle, rating).
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MapPin, Package, Weight, Truck, Phone, Star, ShieldCheck,
  CheckCircle2, Clock, Calendar, DollarSign, ChevronRight
} from 'lucide-react'
import { bookingApi } from '../../services/api'

interface Props {
  booking: any
  role: 'carrier' | 'shipper'
  onClose: () => void
  onDelivered?: (bookingId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:  '#6366F1',
  in_transit: '#F59E0B',
  delivered:  '#10B981',
  cancelled:  '#EF4444',
}

export function BookingDetailSheet({ booking, role, onClose, onDelivered }: Props) {
  const [marking, setMarking] = useState(false)
  const [done, setDone] = useState(booking.status === 'delivered')

  const carrier  = booking.carrierId || {}
  const shipper  = booking.shipperId || {}
  const shipment = booking.shipmentId || {}
  const profile  = carrier.carrierProfile || {}

  const statusColor = STATUS_COLORS[booking.status] || '#6366F1'

  const handleMarkDelivered = async () => {
    if (done || marking) return
    setMarking(true)
    try {
      await bookingApi.markDelivered(booking._id)
      setDone(true)
      onDelivered?.(booking._id)
    } catch (err) {
      console.error(err)
    } finally {
      setMarking(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          style={{
            width: '100%', maxWidth: 520,
            background: 'var(--bg-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px 24px 0 0',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 -12px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          <div style={{ padding: '12px 24px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {booking.status?.replace('_', ' ')}
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Booking Details</h2>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Route */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 3, width: 10, height: 10, borderRadius: '50%', background: '#22D3EE', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>PICKUP</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{shipment.pickup?.label || booking.routeFrom || '—'}</div>
                  </div>
                </div>
                <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.1)', marginLeft: 4 }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 3, width: 10, height: 10, borderRadius: '50%', background: '#F87171', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>DROPOFF</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{shipment.dropoff?.label || booking.routeTo || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cargo chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { icon: <Weight size={13}/>, label: `${shipment.weightKg || 0} kg` },
                { icon: <Package size={13}/>, label: `${shipment.volumeM3 || 0} m³` },
                { icon: <Truck size={13}/>, label: shipment.shipmentType || 'general' },
                ...(booking.detourKm ? [{ icon: <MapPin size={13}/>, label: `+${booking.detourKm} km detour` }] : []),
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: '5px 11px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {icon} {label}
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL PRICE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{(booking.finalPrice || 0).toLocaleString('en-IN')}</div>
              </div>
              {shipment.deadline && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DEADLINE</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{new Date(shipment.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              )}
            </div>

            {/* Contact card: Carrier info shown to SHIPPER, Shipper info shown to CARRIER */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                {role === 'shipper' ? '🚛 Assigned Carrier' : '📦 Shipper'}
              </div>

              {role === 'shipper' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                    {carrier.name?.charAt(0) || 'C'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{carrier.name || 'Carrier'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Star size={14} fill="currentColor" /> {carrier.ratingAvg?.toFixed(1) || '4.8'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>
                      <Phone size={13} />
                      <a href={`tel:${carrier.phone}`} style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>{carrier.phone || '+91 99999 99999'}</a>
                    </div>
                    {profile.vehicleType && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                        <Truck size={13} /> {profile.vehicleType} • {profile.vehicleNumber || '—'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#0EA5E9,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                    {shipper.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{shipper.name || 'Shipper'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>
                      <Phone size={13} />
                      <a href={`tel:${shipper.phone}`} style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>{shipper.phone || '+91 99999 99999'}</a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Carrier action: Mark Delivered */}
            {role === 'carrier' && !done && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleMarkDelivered}
                disabled={marking}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                  background: marking ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#059669,#10B981)',
                  color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                }}
              >
                <CheckCircle2 size={20} />
                {marking ? 'Updating…' : 'Mark as Delivered'}
              </motion.button>
            )}

            {done && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, color: '#10B981', fontWeight: 700 }}>
                <ShieldCheck size={20} /> Delivered Successfully
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
