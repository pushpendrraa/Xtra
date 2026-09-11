import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/Shell'
import { SectionHeader, GlassCard } from '../../components/ui'
import { MOCK_MATCH_OFFERS } from '../../services/api'
import { ChevronRight, Clock } from 'lucide-react'

export default function MatchOffers() {
  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <SectionHeader title="🔍 Match Offers" />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MOCK_MATCH_OFFERS.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard variant="carrier" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      {offer.shipment.pickup} → {offer.shipment.dropoff}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {offer.shipment.weightKg} kg · {offer.shipment.volumeM3} m³ · {offer.shipment.type}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Shipper: {offer.shipper.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--emerald)' }}>
                      ₹{offer.priceQuote.toLocaleString()}
                    </div>
                    <div className="badge badge-indigo" style={{ marginTop: 6 }}>
                      Score {(offer.score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} /> Deadline: {offer.shipment.deadline}
                  </span>
                  <div style={{ marginLeft: 'auto' }}>
                    <button className="btn btn-primary btn-sm">Accept Offer <ChevronRight size={14}/></button>
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
