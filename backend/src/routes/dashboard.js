/**
 * routes/dashboard.js
 *
 * GET /api/dashboard/carrier       — Carrier KPIs
 * GET /api/dashboard/shipper       — Shipper KPIs
 * GET /api/dashboard/carrier/recent  — Recent matches + active bookings
 * GET /api/dashboard/shipper/recent  — Recent shipment requests with acceptance status
 */

const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const Booking         = require('../models/Booking')
const Match           = require('../models/Match')
const CapacityListing = require('../models/CapacityListing')
const ShipmentRequest = require('../models/ShipmentRequest')

// ── Carrier KPIs ──────────────────────────────────────────────────
router.get('/carrier', protect, async (req, res, next) => {
  try {
    const carrierId = req.user._id

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - 7)

    const [bookingsThisWeek, allBookings, listings] = await Promise.all([
      Booking.find({ carrierId, createdAt: { $gte: startOfWeek } }).lean(),
      Booking.find({ carrierId, status: { $in: ['delivered', 'in_transit'] } }).lean(),
      CapacityListing.find({ carrierId }).lean(),
    ])

    // Trips this week
    const tripsThisWeek = bookingsThisWeek.length

    // Gross earnings (all time)
    const earningsINR = allBookings.reduce((sum, b) => sum + (b.finalPrice - b.platformFee), 0)

    // Empty KM avoided — sum of detourKm for delivered bookings
    const emptyKmAvoided = allBookings
      .filter(b => b.status === 'delivered')
      .reduce((sum, b) => sum + (b.detourKm || 0), 0)

    // CO₂ saved: ~2.7 kg CO₂ per litre diesel, ~3.5 km/litre for trucks
    const co2SavedKg = Math.round(emptyKmAvoided / 3.5 * 2.7)

    // Utilization %: bookings / listings this week
    const openListings = listings.filter(l => l.status === 'open').length
    const utilizationPct = listings.length > 0
      ? Math.round((bookingsThisWeek.length / Math.max(listings.length, 1)) * 100)
      : 0

    res.json({
      success: true,
      data: {
        tripsThisWeek,
        earningsINR,
        emptyKmAvoided: Math.round(emptyKmAvoided),
        co2SavedKg,
        utilizationPct: Math.min(100, utilizationPct),
        openListings,
        totalListings: listings.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ── Shipper KPIs ──────────────────────────────────────────────────
router.get('/shipper', protect, async (req, res, next) => {
  try {
    const shipperId = req.user._id

    const [bookings, shipments] = await Promise.all([
      Booking.find({ shipperId, status: { $in: ['confirmed', 'in_transit', 'delivered'] } }).lean(),
      ShipmentRequest.find({ shipperId }).lean(),
    ])

    const shipmentsBooked = bookings.length

    // Cost saved: sum of (expectedPrice - finalPrice) for delivered bookings
    const delivered = bookings.filter(b => b.status === 'delivered')
    const costSavedINR = delivered.reduce((sum, b) => sum + Math.max(0, (b.expectedPrice || 0) - b.finalPrice), 0)

    // CO₂ prevented
    const totalKm = delivered.reduce((sum, b) => sum + (b.detourKm || 0), 0)
    const co2SavedKg = Math.round(totalKm / 3.5 * 2.7)

    // Avg delivery time in hours
    const withDelivery = delivered.filter(b => b.pickupTime && b.deliveryTime)
    const avgDeliveryHrs = withDelivery.length > 0
      ? Math.round(
          withDelivery.reduce((sum, b) =>
            sum + (new Date(b.deliveryTime) - new Date(b.pickupTime)) / 3_600_000, 0
          ) / withDelivery.length
        )
      : 0

    res.json({
      success: true,
      data: {
        shipmentsBooked,
        costSavedINR,
        co2SavedKg,
        avgDeliveryHrs,
        totalShipments: shipments.length,
        openShipments:  shipments.filter(s => s.status === 'open').length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ── Carrier recent activity ───────────────────────────────────────
router.get('/carrier/recent', protect, async (req, res, next) => {
  try {
    const carrierId = req.user._id

    const [recentMatches, activeBookings] = await Promise.all([
      Match.find({ carrierId, status: 'proposed' })
        .populate('shipmentId', 'pickup dropoff weightKg volumeM3 shipmentType deadline')
        .sort({ score: -1 })
        .limit(5)
        .lean(),
      Booking.find({ carrierId, status: { $in: ['confirmed', 'in_transit'] } })
        .populate('shipperId',  'name phone')
        .populate('shipmentId', 'pickup dropoff weightKg shipmentType')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    res.json({ success: true, data: { recentMatches, activeBookings } })
  } catch (err) {
    next(err)
  }
})

// ── Shipper recent activity ───────────────────────────────────────
router.get('/shipper/recent', protect, async (req, res, next) => {
  try {
    const shipperId = req.user._id

    // Get recent shipments with their latest match status
    const shipments = await ShipmentRequest.find({ shipperId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Attach acceptance status (best match per shipment)
    const shipmentIds = shipments.map(s => s._id)
    const matches = await Match.find({
      shipmentId: { $in: shipmentIds },
      status:     { $in: ['proposed', 'accepted'] },
    })
      .populate('carrierId', 'name phone ratingAvg carrierProfile')
      .sort({ score: -1 })
      .lean()

    const matchByShipment = {}
    for (const m of matches) {
      const sid = m.shipmentId.toString()
      if (!matchByShipment[sid]) matchByShipment[sid] = m
    }

    const enriched = shipments.map(s => ({
      ...s,
      bestMatch:        matchByShipment[s._id.toString()] || null,
      acceptanceStatus: s.status === 'matched' ? 'accepted'
                       : matchByShipment[s._id.toString()] ? 'proposed'
                       : 'no_match',
    }))

    res.json({ success: true, data: enriched })
  } catch (err) {
    next(err)
  }
})

module.exports = router
