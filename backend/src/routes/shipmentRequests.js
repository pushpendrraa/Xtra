/**
 * routes/shipmentRequests.js
 *
 * POST   /api/shipment-requests      — Post shipment, trigger matchShipment
 * GET    /api/shipment-requests      — Get shipper's own requests
 * GET    /api/shipment-requests/:id  — Get single request with its matches
 * DELETE /api/shipment-requests/:id  — Cancel
 */

const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const ShipmentRequest = require('../models/ShipmentRequest')
const Match           = require('../models/Match')
const { matchShipment } = require('../services/matchingEngine')

// POST /api/shipment-requests
router.post('/', protect, async (req, res, next) => {
  try {
    const { pickup, dropoff, ...rest } = req.body
    // pickup/dropoff: { lat, lng, label }

    const shipment = await ShipmentRequest.create({
      ...rest,
      shipperId: req.user._id,
      pickup: {
        type:        'Point',
        coordinates: [pickup.lng, pickup.lat],
        label:       pickup.label || '',
      },
      dropoff: {
        type:        'Point',
        coordinates: [dropoff.lng, dropoff.lat],
        label:       dropoff.label || '',
      },
      status: 'open',
    })

    // §12 — Trigger match pipeline immediately (async, non-blocking)
    matchShipment(shipment).catch(err =>
      console.error('[shipmentRequests] matchShipment error:', err.message)
    )

    res.status(201).json({ success: true, data: shipment })
  } catch (err) {
    next(err)
  }
})

// GET /api/shipment-requests
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = { shipperId: req.user._id }
    if (status) filter.status = status

    const requests = await ShipmentRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    const total = await ShipmentRequest.countDocuments(filter)

    res.json({ success: true, data: requests, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// GET /api/shipment-requests/:id — include matches for this shipment
router.get('/:id', protect, async (req, res, next) => {
  try {
    const shipment = await ShipmentRequest.findById(req.params.id).lean()
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' })

    // Include match offers for this shipment
    const matches = await Match.find({ shipmentId: req.params.id })
      .populate('listingId', 'vehicleType origin destination routeDistanceKm')
      .sort({ score: -1 })
      .lean()

    res.json({ success: true, data: { ...shipment, matches } })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/shipment-requests/:id — cancel
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const shipment = await ShipmentRequest.findOneAndUpdate(
      { _id: req.params.id, shipperId: req.user._id, status: 'open' },
      { status: 'cancelled' },
      { new: true }
    )
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found, not yours, or already matched' })

    // Expire all proposed matches
    await Match.updateMany(
      { shipmentId: req.params.id, status: 'proposed' },
      { status: 'expired' }
    )

    res.json({ success: true, data: shipment })
  } catch (err) {
    next(err)
  }
})

module.exports = router
