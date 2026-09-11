import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Clock, Package, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, StatusBadge, SectionHeader, EmptyState } from '../../components/ui'
import { MOCK_LISTINGS } from '../../services/api'

export default function CarrierListings() {
  const navigate = useNavigate()
  const [listings] = useState(MOCK_LISTINGS)

  return (
    <PageShell title="My Listings" subtitle="Capacity you've posted">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* CTA */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/carrier/listings/new')}
          style={{ borderRadius: 16, background: 'linear-gradient(135deg, #6366F1, #4338CA)', gap: 10 }}>
          <Plus size={20} /> Post New Capacity Listing
        </motion.button>

        <SectionHeader title="Active Listings" />

        {listings.length === 0 && (
          <EmptyState icon="🚛" title="No listings yet" body="Post your first capacity listing to start matching with shippers." />
        )}

        {listings.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard variant="carrier" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate('/carrier/listings/new')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <MapPin size={14} color="#818CF8" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{l.origin}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{l.destination}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.vehicle}</div>
                </div>
                <StatusBadge status={l.status} />
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.availableWeightKg}kg / {l.availableVolumeM3}m³</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Floor</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6EE7B7' }}>₹{l.priceFloor.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Clock size={12} /> {l.departureWindow}
                </span>
                <ChevronRight size={16} color="var(--text-tertiary)" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageShell>
  )
}
