/**
 * routes/matches.js
 *
 * GET  /api/matches           — Get matches for current user (carrier sees offers, shipper sees theirs)
 * POST /api/matches/:id/accept — Atomic accept (§12)
 * POST /api/matches/:id/reject — Reject a match
 */

const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const Match           = require('../models/Match')
const ShipmentRequest = require('../models/ShipmentRequest')
const CapacityListing = require('../models/CapacityListing')
const { confirmBooking } = require('../services/matchingEngine')

// GET /api/matches
router.get('/', protect, async (req, res, next) => {
  try {
    const { status = 'proposed', page = 1, limit = 20 } = req.query
    const isCarrier  = req.user.role === 'carrier'

    const filter = isCarrier
      ? { carrierId: req.user._id, status }
      : { shipperId: req.user._id, status }

    const matches = await Match.find(filter)
      .populate('listingId',  'vehicleType origin destination departureWindowStart departureWindowEnd routeDistanceKm')
      .populate('shipmentId', 'pickup dropoff weightKg volumeM3 shipmentType deadline')
      .populate('carrierId',  'name ratingAvg phone carrierProfile')
      .populate('shipperId',  'name phone shipperProfile')
      .sort({ score: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    const total = await Match.countDocuments(filter)

    res.json({ success: true, data: matches, total, page: Number(page) })
  } catch (err) {
    next(err)
  }
})

// POST /api/matches/:id/accept — §12 Atomic accept
router.post('/:id/accept', protect, async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' })

    // Only the carrier who received the offer can accept it
    if (match.carrierId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your match to accept' })
    }

    if (match.status !== 'proposed') {
      return res.status(409).json({ success: false, message: `Match is already ${match.status}` })
    }

    // Atomic update — only succeeds if shipment is still 'open' (prevents double-booking)
    const shipment = await ShipmentRequest.findOneAndUpdate(
      { _id: match.shipmentId, status: 'open' },
      { status: 'matched' },
      { new: true }
    )
    if (!shipment) {
      return res.status(409).json({ success: false, message: 'Shipment already matched by another carrier' })
    }

    // Create booking and set match accepted
    const booking = await confirmBooking(match)

    // Expire all other competing proposed matches for this shipment
    const competitors = await Match.find({
      shipmentId: match.shipmentId,
      _id:        { $ne: match._id },
      status:     'proposed',
    })

    await Match.updateMany(
      { shipmentId: match.shipmentId, _id: { $ne: match._id } },
      { status: 'expired' }
    )

    // Notify competing carriers via socket (io is in matchingEngine, emitted via confirmBooking)
    // Re-require to get io reference if needed — already handled in matchingEngine.confirmBooking

    res.json({ success: true, data: booking })
  } catch (err) {
    next(err)
  }
})

// POST /api/matches/:id/reject
router.post('/:id/reject', protect, async (req, res, next) => {
  try {
    const match = await Match.findOneAndUpdate(
      { _id: req.params.id, carrierId: req.user._id, status: 'proposed' },
      { status: 'rejected' },
      { new: true }
    )
    if (!match) return res.status(404).json({ success: false, message: 'Match not found or cannot be rejected' })
    res.json({ success: true, data: match })
  } catch (err) {
    next(err)
  }
})

module.exports = router
