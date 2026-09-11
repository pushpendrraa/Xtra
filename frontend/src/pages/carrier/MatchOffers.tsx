import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, MapPin, Weight, Box, Clock, TrendingUp, AlertCircle, ChevronDown } from 'lucide-react'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, ScoreBar, PriceBreakdown, StatusBadge, SectionHeader, EmptyState } from '../../components/ui'
import { MOCK_MATCH_OFFERS } from '../../services/api'

export default function MatchOffers() {
  const [offers, setOffers] = useState(MOCK_MATCH_OFFERS)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acted, setActed] = useState<Record<string, 'accepted' | 'rejected'>>({})

  const handleAction = (id: string, action: 'accepted' | 'rejected') => {
    setActed(a => ({ ...a, [id]: action }))
    setTimeout(() => setOffers(o => o.filter(x => x.id !== id)), 600)
  }

  const pending = offers.filter(o => !acted[o.id])

  return (
    <PageShell title="Match Offers" subtitle={`${pending.length} pending`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {pending.length === 0 && (
          <EmptyState icon="🎯" title="All caught up!" body="No pending match offers right now. New offers will appear here when the matching engine finds suitable shipments." />
        )}

        <AnimatePresence>
          {offers.map((offer, i) => {
            const isExpanded = expanded === offer.id
            const action = acted[offer.id]

            return (
              <motion.div key={offer.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: action ? 0.5 : 1, y: 0, scale: action ? 0.97 : 1 }}
                exit={{ opacity: 0, x: action === 'accepted' ? 60 : -60, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: i * 0.08 }}>

                <GlassCard variant="carrier" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Score header */}
                  <div style={{ padding: '14px 16px 10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', align: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Match #{offer.id.toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', align: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#818CF8' }}>₹{offer.priceQuote.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Match Score</span>
                      <ScoreBar score={offer.score} color={offer.score > 0.85 ? '#10B981' : offer.score > 0.7 ? '#6366F1' : '#F59E0B'} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: offer.score > 0.85 ? '#6EE7B7' : '#A5B4FC' }}>
                        {(offer.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    {offer.score > 0.85 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                        <AlertCircle size={12} color="#6EE7B7" />
                        <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 600 }}>Auto-confirm eligible (score &gt; 85%)</span>
                      </div>
                    )}
                  </div>

                  <hr className="divider" style={{ margin: 0 }} />

                  {/* Route & cargo */}
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: '0.9rem' }}>
                          <MapPin size={13} color="#6EE7B7" /> {offer.shipment.pickup}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dropoff</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: '0.9rem' }}>
                          <MapPin size={13} color="#FDA4AF" /> {offer.shipment.dropoff}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <Weight size={12} /> {offer.shipment.weightKg}kg
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <Box size={12} /> {offer.shipment.volumeM3}m³
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <TrendingUp size={12} /> +{offer.detourKm}km detour
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <Clock size={12} /> {offer.timeSlackMinutes}min slack
                      </span>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <span className={`badge badge-${offer.shipment.type === 'fragile' ? 'amber' : offer.shipment.type === 'refrigerated' ? 'teal' : 'indigo'}`}>
                        {offer.shipment.type}
                      </span>
                    </div>
                  </div>

                  {/* Expand: price breakdown */}
                  <button onClick={() => setExpanded(isExpanded ? null : offer.id)}
                    style={{ width: '100%', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)', border: 'none', borderTop: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    Price Breakdown
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                      <ChevronDown size={15} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--glass-border)' }}>
                          <PriceBreakdown breakdown={offer.priceBreakdown} />
                          <hr className="divider" />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                            <span>Your Payout</span>
                            <span style={{ color: '#6EE7B7' }}>₹{(offer.priceQuote - offer.priceBreakdown.platformFee).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                            40% empty-leg discount already applied
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CTA buttons */}
                  {!acted[offer.id] && (
                    <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--glass-border)' }}>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(offer.id, 'rejected')}
                        className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                        <XCircle size={15} /> Decline
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction(offer.id, 'accepted')}
                        className="btn btn-success btn-sm" style={{ flex: 2 }}>
                        <CheckCircle size={15} /> Accept & Book
                      </motion.button>
                    </div>
                  )}

                  {acted[offer.id] && (
                    <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700,
                      color: acted[offer.id] === 'accepted' ? '#6EE7B7' : '#FDA4AF' }}>
                      {acted[offer.id] === 'accepted' ? '✓ Booking created' : '✕ Declined'}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </PageShell>
  )
}
