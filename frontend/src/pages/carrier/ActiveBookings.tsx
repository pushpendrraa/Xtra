import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/Shell'
import { SectionHeader, GlassCard, StatusBadge } from '../../components/ui'
import { MOCK_BOOKINGS } from '../../services/api'
import { ChevronRight } from 'lucide-react'

export default function ActiveBookings() {
  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionHeader title="📦 Active Bookings" />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MOCK_BOOKINGS.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard variant="carrier" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {booking.route.from} → {booking.route.to}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Shipper: {booking.shipper.name}
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Picked up: {booking.pickedUpAt || 'N/A'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                      ₹{booking.finalPrice.toLocaleString()}
                    </span>
                    <button className="btn btn-ghost btn-sm">Verify POD <ChevronRight size={14}/></button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
