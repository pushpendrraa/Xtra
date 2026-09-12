import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MapPin, Clock, ChevronRight, Zap, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/Shell'
import { GlassCard, StatusBadge, EmptyState } from '../../components/ui'
import { listingApi, matchApi } from '../../services/api'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../../store/authStore'

export default function CarrierListings() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  
  const [listings, setListings] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [rematching, setRematching] = useState<string | null>(null)
  
  // Real-time socket connection
  useEffect(() => {
    if (!token) return
    
    // Fetch initial state
    Promise.all([
      listingApi.getMyListings(),
      matchApi.getMyMatches()
    ]).then(([lRes, mRes]) => {
      if (lRes.success) setListings(lRes.data)
      if (mRes.success) setMatches(mRes.data)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load listings/matches', err)
      setLoading(false)
    })

    // Setup Socket.IO for real-time match push
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const socket: Socket = io(API_URL, {
      auth: { token },
      withCredentials: true
    })

    socket.on('connect', () => {
      console.log('Socket connected for matches')
    })

    socket.on('match:offer', (offer) => {
      console.log('Received real-time match offer:', offer)
      // Refresh matches from server to get full hydrated data
      matchApi.getMyMatches().then(mRes => {
        if (mRes.success) setMatches(mRes.data)
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  const handleAcceptMatch = async (matchId: string) => {
    try {
      setAccepting(matchId)
      const res = await matchApi.acceptMatch(matchId)
      if (res.success) {
        // Remove the accepted match from this view (it moves to bookings)
        setMatches(prev => prev.filter(m => m._id !== matchId))
        // Show success, maybe navigate to bookings
        navigate('/carrier/bookings')
      }
    } catch (err) {
      console.error('Failed to accept match', err)
      alert('Failed to accept match. It may have expired or been taken.')
    } finally {
      setAccepting(null)
    }
  }

  const handleTerminateListing = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this listing?')) return
    try {
      const res = await listingApi.terminateListing(id)
      if (res.success) {
        setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'cancelled' } : l))
      }
    } catch (err) {
      console.error('Failed to terminate listing', err)
      alert('Failed to terminate listing.')
    }
  }

  const hasActiveListing = listings.some(l => ['open', 'partially_matched'].includes(l.status))

  return (
    <PageShell title="My Capacity & Matches" subtitle="Manage your empty legs and incoming shipment requests">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ─── Upper Section: Current Empty Listings ─── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Listed Empty Legs</h3>
            <button
              className={`btn btn-sm ${hasActiveListing ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => navigate('/carrier/listings/new')}
              disabled={hasActiveListing}
              title={hasActiveListing ? 'You already have an active listing' : ''}
            >
              <Plus size={16} /> {hasActiveListing ? 'Max 1 Active Listing' : 'Post New Return Leg'}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading listings...</div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon="🚛"
              title="No active listings"
              body="Post your first empty capacity listing to start receiving load offers automatically."
            />
          ) : (
            <div className="responsive-cards-grid">
              {listings.filter(l => !['cancelled', 'expired'].includes(l.status)).map((l, i) => (
                <motion.div key={l._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <GlassCard variant="carrier" style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <MapPin size={16} color="var(--indigo)" />
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{l.origin?.label || 'Origin'}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{l.destination?.label || 'Destination'}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{l.vehicleType}</div>
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
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--emerald)' }}>₹{l.priceFloor?.toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Clock size={14} color="var(--text-tertiary)" /> 
                          <strong>Start:</strong> {new Date(l.departureWindowStart).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        {l.expectedArrivalTime && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <Clock size={14} color="var(--text-tertiary)" /> 
                            <strong>Reach:</strong> {new Date(l.expectedArrivalTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        )}
                      </div>
                      
                      {['open', 'partially_matched'].includes(l.status) && (
                        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                          {/* Find Matches button */}
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ width: '100%', padding: '7px', fontSize: '0.8rem', color: '#818CF8', borderColor: 'rgba(129,140,248,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            disabled={rematching === l._id}
                            onClick={async () => {
                              setRematching(l._id)
                              try {
                                await listingApi.rematch(l._id)
                                setTimeout(() => setRematching(null), 8000)
                              } catch { setRematching(null) }
                            }}
                          >
                            <RefreshCw size={13} className={rematching === l._id ? 'animate-spin' : ''} />
                            {rematching === l._id ? 'Scanning…' : 'Find Matches'}
                          </button>

                          <button
                            className="btn btn-sm btn-outline"
                            style={{ width: '100%', padding: '6px', fontSize: '0.8rem', color: 'var(--rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                            onClick={() => handleTerminateListing(l._id)}
                          >
                            Terminate Trip
                          </button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Bottom/Right Section: Incoming Matches ─── */}
        <section style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Incoming Matches & Requests</h3>
            {matches.length > 0 && (
              <span className="badge badge-indigo animate-pulse">
                <Zap size={12} style={{ marginRight: 4 }} /> Live
              </span>
            )}
          </div>

          {!loading && matches.length === 0 ? (
            <GlassCard style={{ padding: 40, textAlign: 'center', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📡</div>
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Waiting for matches...</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto' }}>
                Xtra's AI is actively scanning shipper requests. When a shipment matches your empty leg, it will appear here instantly.
              </p>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              <AnimatePresence>
                {matches.map((match, i) => (
                  <motion.div
                    key={match._id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard variant="carrier" style={{ padding: 20, border: '2px solid rgba(79, 70, 229, 0.4)', boxShadow: '0 8px 32px rgba(79, 70, 229, 0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                            {match.shipmentId?.pickup?.label?.split(',')[0]} → {match.shipmentId?.dropoff?.label?.split(',')[0]}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            {match.shipmentId?.weightKg} kg · {match.shipmentId?.volumeM3} m³ · {match.shipmentId?.shipmentType}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            Shipper: {match.shipperId?.name}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--emerald)' }}>
                            ₹{match.priceQuote?.toLocaleString()}
                          </div>
                          <div className="badge badge-indigo" style={{ marginTop: 6 }}>
                            Score {(match.score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--glass-border)', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} /> Detour: {match.detourKm?.toFixed(1)} km
                        </span>
                        <div style={{ marginLeft: 'auto' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            disabled={accepting === match._id}
                            onClick={() => handleAcceptMatch(match._id)}
                            style={{ padding: '6px 14px' }}
                          >
                            {accepting === match._id ? 'Accepting...' : (
                              <>Accept Offer <ChevronRight size={14}/></>
                            )}
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

      </div>
    </PageShell>
  )
}
