import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Clock, Truck, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, StatusBadge, SectionHeader, EmptyState } from '../../components/ui'
import { MOCK_LISTINGS } from '../../services/api'

export default function CarrierListings() {
  const navigate = useNavigate()
  const [listings] = useState(MOCK_LISTINGS)

  return (
    <PageShell title="My Capacity Listings" subtitle="Active and scheduled empty-leg return routes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* CTA Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Listed Empty Legs</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Listed routes are continuously analyzed by Xtra's empty-leg matching engine.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/carrier/post-listing')}
          >
            <Plus size={18} /> Post New Return Leg
          </button>
        </div>

        {listings.length === 0 && (
          <EmptyState
            icon="🚛"
            title="No listings yet"
            body="Post your first empty capacity listing to start matching automatically with shippers."
          />
        )}

        <div className="responsive-cards-grid">
          {listings.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard
                variant="carrier"
                style={{ padding: 20, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                onClick={() => navigate('/carrier/matches')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <MapPin size={16} color="var(--indigo)" />
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{l.origin}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{l.destination}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{l.vehicle}</div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 14px', background: 'var(--bg-deep)', borderRadius: 12, margin: '8px 0 14px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Available Space</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{l.availableWeightKg} kg / {l.availableVolumeM3} m³</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Price Floor</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--emerald)' }}>₹{l.priceFloor.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} color="var(--text-tertiary)" /> {l.departureWindow}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    Find Loads <ChevronRight size={14} />
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </PageShell>
  )
}
