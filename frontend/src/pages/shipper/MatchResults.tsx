import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MapPin, TrendingUp, Clock, ChevronDown, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, ScoreBar, Stars, Divider } from '../../components/ui'
import { MOCK_MATCH_RESULTS } from '../../services/api'

export default function MatchResults() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(MOCK_MATCH_RESULTS[0]?.id ?? null)
  const [selected, setSelected] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const handleBook = async (id: string) => {
    setSelected(id)
    setConfirming(true)
    await new Promise(r => setTimeout(r, 1200))
    navigate('/shipper/track')
  }

  return (
    <PageShell title="Match Results" subtitle={`${MOCK_MATCH_RESULTS.length} carriers found`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Sorting hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)' }}>
          <TrendingUp size={14} color="#22D3EE" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Ranked by match score (detour + time + rating + price)</span>
        </div>

        {MOCK_MATCH_RESULTS.map((r, i) => {
          const isExpanded = expanded === r.id

          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard variant="shipper" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Rank badge */}
                {i === 0 && (
                  <div style={{ background: 'linear-gradient(90deg, rgba(34,211,238,0.2), transparent)', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#22D3EE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⭐ Best Match</span>
                  </div>
                )}

                <div style={{ padding: '14px 16px' }}>
                  {/* Carrier info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div className="avatar" style={{ background: `linear-gradient(135deg, #22D3EE, #0891B2)` }}>{r.carrier.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.carrier.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <Stars rating={r.carrier.rating} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.carrier.rating} · {r.carrier.tripsCompleted} trips</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#6EE7B7' }}>₹{r.priceQuote.toLocaleString()}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>incl. platform fee</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Match</span>
                    <ScoreBar score={r.score} color="#22D3EE" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#67E8F9' }}>{(r.score * 100).toFixed(0)}%</span>
                  </div>

                  {/* Route info */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={11} /> {r.listing.origin} → {r.listing.destination}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <TrendingUp size={11} /> +{r.detourKm}km
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> Departs {r.listing.departureWindow}
                    </span>
                  </div>
                </div>

                {/* Expand toggle */}
                <button onClick={() => setExpanded(isExpanded ? null : r.id)}
                  style={{ width: '100%', padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)', border: 'none', borderTop: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  Vehicle & savings details
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown size={15} /></motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px 6px', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle</div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.listing.vehicleType}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Slack</div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.timeSlackMinutes} min</div>
                          </div>
                        </div>
                        <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 12 }}>
                          <p style={{ fontSize: '0.78rem', color: '#6EE7B7' }}>
                            💚 You save ~40% vs dedicated freight (empty-leg discount applied)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Book button */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)' }}>
                  <motion.button
                    className="btn btn-teal btn-full"
                    whileTap={{ scale: 0.97 }}
                    disabled={!!selected || confirming}
                    onClick={() => handleBook(r.id)}
                    style={{ gap: 8 }}>
                    {selected === r.id && confirming ? (
                      <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }} /> Booking…</>
                    ) : (
                      <><CheckCircle size={16} /> Book This Carrier</>
                    )}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    </PageShell>
  )
}
