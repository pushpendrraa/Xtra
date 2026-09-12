/**
 * matchingEngine.js — §4–§11 of matching_engine.md
 *
 * Full pipeline:
 *   §4  getCandidateListings   — Mongo $nearSphere on routeLine (indexed, cheap)
 *   §5  isCorrectDirection     — turf nearestPointOnLine (in-memory, cheap)
 *   §6  isTimeCompatible       — window overlap check
 *   §7  isCapacityCompatible   — weight + volume + type
 *   §8  isDriverCompliant      — complianceEngine
 *   §9  getDetourKm            — OSRM API call (expensive, runs last)
 *   §10 scoreMatch             — weighted composite score
 *   §11 matchShipment          — orchestrator + Socket.io emit
 *   §11.1 sweepForMatches      — reverse: new listing → check open shipments
 */

const turf = require('@turf/turf')
const CapacityListing  = require('../models/CapacityListing')
const ShipmentRequest  = require('../models/ShipmentRequest')
const Match            = require('../models/Match')
const Booking          = require('../models/Booking')
const Driver           = require('../models/Driver')
const User             = require('../models/User')
const { getDetourKm }  = require('./routeBuilder')
const { computePrice } = require('./pricingEngine')
const { isDriverCompliant, estimateTripHours } = require('./complianceEngine')

// ── Config from env ───────────────────────────────────────────────
const MAX_CORRIDOR_METERS    = Number(process.env.MAX_CORRIDOR_METERS    || 4000)
const MAX_DETOUR_KM          = Number(process.env.MAX_DETOUR_KM          || 15)
const MAX_DETOUR_PCT         = Number(process.env.MAX_DETOUR_PCT         || 0.25)
const MAX_TIME_SLACK_MINUTES = Number(process.env.MAX_TIME_SLACK_MINUTES || 180)
const AUTO_MATCH_THRESHOLD   = Number(process.env.AUTO_MATCH_THRESHOLD   || 0.85)

// io is set by index.js after socket.io is attached
let io = null
function setIo(socketIo) { io = socketIo }

// ── §4 Candidate query ────────────────────────────────────────────

async function findRoutesNear(point) {
  return CapacityListing.find({
    status: 'open',
    routeLine: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
        $maxDistance: MAX_CORRIDOR_METERS,
      },
    },
  }).lean()
}

async function getCandidateListings(shipment) {
  const pickup  = { lat: shipment.pickup.coordinates[1],  lng: shipment.pickup.coordinates[0] }
  const dropoff = { lat: shipment.dropoff.coordinates[1], lng: shipment.dropoff.coordinates[0] }

  const [nearPickup, nearDropoff] = await Promise.all([
    findRoutesNear(pickup),
    findRoutesNear(dropoff),
  ])

  const dropoffIds = new Set(nearDropoff.map(l => l._id.toString()))
  return nearPickup.filter(l => dropoffIds.has(l._id.toString()))
}

// ── §5 Direction check ────────────────────────────────────────────

function isCorrectDirection(routeLine, pickup, dropoff) {
  if (!routeLine || !routeLine.coordinates || routeLine.coordinates.length < 2) return true

  try {
    const line       = turf.lineString(routeLine.coordinates)
    const pickupPt   = turf.point([pickup.lng,  pickup.lat])
    const dropoffPt  = turf.point([dropoff.lng, dropoff.lat])
    const pickupSnap  = turf.nearestPointOnLine(line, pickupPt)
    const dropoffSnap = turf.nearestPointOnLine(line, dropoffPt)
    return pickupSnap.properties.location < dropoffSnap.properties.location
  } catch {
    return true  // fallback: allow if turf fails
  }
}

// ── §6 Time window ────────────────────────────────────────────────

function isTimeCompatible(listing, shipment) {
  return new Date(listing.departureWindowStart) <= new Date(shipment.deadline) &&
         new Date(listing.departureWindowEnd)   >= new Date(shipment.earliestPickupTime)
}

function computeTimeSlack(listing, shipment) {
  const slackMs = new Date(shipment.deadline) - new Date(listing.departureWindowStart)
  return Math.max(0, Math.round(slackMs / 60000))
}

// ── §7 Capacity + type ────────────────────────────────────────────

function isCapacityCompatible(listing, shipment) {
  return shipment.weightKg <= listing.availableWeightKg &&
         shipment.volumeM3 <= listing.availableVolumeM3
}

const TYPE_REQUIREMENTS = {
  refrigerated: ['refrigerated'],
  hazmat:       ['hazmat_certified'],
  fragile:      [],
  general:      [],
}

function isTypeCompatible(listing, shipment) {
  const required = TYPE_REQUIREMENTS[shipment.shipmentType] || []
  return required.every(f => (listing.features || []).includes(f))
}

// ── §10 Scoring ───────────────────────────────────────────────────

const WEIGHTS = { detour: 0.35, time: 0.25, rating: 0.20, price: 0.20 }
const REPEAT_PAIRING_BONUS = 0.05

function scoreMatch({ detourKm, maxDetourKm, timeSlackMinutes, carrierRatingAvg, priceQuote, shipperExpectedPrice, hasPriorBookings }) {
  const detourScore = 1 - (detourKm / Math.max(maxDetourKm, 1))
  const timeScore   = Math.min(1, timeSlackMinutes / MAX_TIME_SLACK_MINUTES)
  const ratingScore = (carrierRatingAvg || 3) / 5
  const expectedP   = shipperExpectedPrice || priceQuote
  const priceScore  = Math.max(0, 1 - Math.abs(priceQuote - expectedP) / Math.max(expectedP, 1))

  let score = WEIGHTS.detour * detourScore
            + WEIGHTS.time   * timeScore
            + WEIGHTS.rating * ratingScore
            + WEIGHTS.price  * priceScore

  if (hasPriorBookings) score += REPEAT_PAIRING_BONUS
  return Math.max(0, Math.min(1, score))
}

// ── Booking creation helper ───────────────────────────────────────

async function createBooking(match) {
  const listing  = await CapacityListing.findById(match.listingId)
  const shipment = await ShipmentRequest.findById(match.shipmentId)

  const booking = await Booking.create({
    matchId:    match._id,
    listingId:  match.listingId,
    shipmentId: match.shipmentId,
    carrierId:  match.carrierId,
    shipperId:  match.shipperId,
    finalPrice: match.priceQuote,
    platformFee: Math.round(match.priceQuote * 0.12),
    status:     'confirmed',
    routeFrom:  listing?.origin?.label      || '',
    routeTo:    listing?.destination?.label || '',
    detourKm:   match.detourKm,
  })

  // Emit to shipper
  if (io) {
    io.to(`shipper:${match.shipperId.toString()}`).emit('booking:confirmed', {
      bookingId:  booking._id,
      matchId:    match._id,
      finalPrice: booking.finalPrice,
    })
  }

  return booking
}

// ── §11 Full pipeline orchestrator ────────────────────────────────

async function matchShipment(shipment) {
  const candidates = await getCandidateListings(shipment)
  const results    = []

  const pickup  = { lat: shipment.pickup.coordinates[1],  lng: shipment.pickup.coordinates[0] }
  const dropoff = { lat: shipment.dropoff.coordinates[1], lng: shipment.dropoff.coordinates[0] }

  for (const listing of candidates) {
    // §5 — direction check
    if (!isCorrectDirection(listing.routeLine, pickup, dropoff)) continue
    // §6 — time window
    if (!isTimeCompatible(listing, shipment)) continue
    // §7 — capacity + type
    if (!isCapacityCompatible(listing, shipment)) continue
    if (!isTypeCompatible(listing, shipment)) continue

    // §8 — driver compliance
    const driver = listing.driverId ? await Driver.findById(listing.driverId) : null
    const addedHours = estimateTripHours(listing, listing.routeDistanceKm * 0.1)
    if (!isDriverCompliant(driver, addedHours)) continue

    // §9 — detour (expensive, runs only for final survivors)
    let detourKm = 0
    try {
      detourKm = await getDetourKm(listing, shipment)
    } catch (err) {
      console.warn(`[matchingEngine] getDetourKm failed for listing ${listing._id}:`, err.message)
      // Use turf estimate as fallback
      detourKm = 2
    }

    const maxAllowed = Math.max(MAX_DETOUR_KM, MAX_DETOUR_PCT * listing.routeDistanceKm)
    if (detourKm > maxAllowed) continue

    // Pricing
    const { totalINR, breakdown } = computePrice(listing, shipment, detourKm)

    // Rating
    const carrier = await User.findById(listing.carrierId).select('ratingAvg').lean()

    // Repeat pairing bonus
    const hasPriorBookings = await Booking.exists({
      carrierId:  listing.carrierId,
      shipperId:  shipment.shipperId,
      status:     'delivered',
    })

    const timeSlackMinutes = computeTimeSlack(listing, shipment)

    const score = scoreMatch({
      detourKm,
      maxDetourKm: maxAllowed,
      timeSlackMinutes,
      carrierRatingAvg:    carrier?.ratingAvg || 3,
      priceQuote:          totalINR,
      shipperExpectedPrice: shipment.expectedPrice || totalINR,
      hasPriorBookings:    !!hasPriorBookings,
    })

    // Avoid duplicate proposed matches
    const existingMatch = await Match.findOne({
      listingId:  listing._id,
      shipmentId: shipment._id,
      status:     'proposed',
    })
    if (existingMatch) continue

    const match = await Match.create({
      listingId:         listing._id,
      shipmentId:        shipment._id,
      carrierId:         listing.carrierId,
      shipperId:         shipment.shipperId,
      score,
      detourKm,
      timeSlackMinutes,
      priceQuote:        totalINR,
      priceBreakdown:    breakdown,
      complianceOk:      true,
      status:            'proposed',
    })

    results.push({ listing, match, score })
  }

  results.sort((a, b) => b.score - a.score)

  // Emit or auto-accept
  for (const { listing, match, score } of results) {
    if (score > AUTO_MATCH_THRESHOLD && listing.autoAccept && shipment.autoAccept) {
      await confirmBooking(match)
    } else if (io) {
      // Push to carrier — Ola/Uber style incoming request
      io.to(`carrier:${listing.carrierId.toString()}`).emit('match:offer', {
        matchId:       match._id,
        shipmentId:    shipment._id,
        score:         Math.round(score * 100),          // 0-100
        priceQuote:    match.priceQuote,
        detourKm:      match.detourKm,
        pickup:        { label: shipment.pickup.label,   coords: shipment.pickup.coordinates },
        dropoff:       { label: shipment.dropoff.label,  coords: shipment.dropoff.coordinates },
        deadline:      shipment.deadline,
        weightKg:      shipment.weightKg,
        volumeM3:      shipment.volumeM3,
        shipmentType:  shipment.shipmentType,
        expiresAt:     new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2-min accept window
      })
    }
  }

  // Notify shipper: how many carriers were pinged
  if (io && results.length > 0) {
    io.to(`shipper:${shipment.shipperId.toString()}`).emit('match:found', {
      shipmentId:  shipment._id,
      carriersFound: results.length,
    })
  }

  return results
}

// ── §11.1 Reverse sweep (new listing → check open shipments) ──────

async function sweepForMatches({ newListing }) {
  const openShipments = await ShipmentRequest.find({
    status: 'open',
    dropoff: {
      $nearSphere: {
        $geometry: newListing.destination,
        $maxDistance: MAX_CORRIDOR_METERS,
      },
    },
  })

  for (const shipment of openShipments) {
    try {
      await matchShipment(shipment)
    } catch (err) {
      console.error(`[sweepForMatches] error matching shipment ${shipment._id}:`, err.message)
    }
  }
}

// ── Confirm match → create booking (used by accept route) ─────────

async function confirmBooking(match) {
  match.status = 'accepted'
  await match.save()
  return createBooking(match)
}

module.exports = { matchShipment, sweepForMatches, confirmBooking, setIo }
