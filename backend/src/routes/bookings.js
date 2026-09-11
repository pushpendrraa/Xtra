/**
 * routes/bookings.js
 *
 * GET  /api/bookings           — Get user's bookings
 * GET  /api/bookings/:id       — Get booking detail
 * POST /api/bookings/:id/pod   — Submit POD image URL
 * POST /api/bookings/:id/verify-pod — Shipper verifies OTP → marks delivered
 */

const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const Booking         = require('../models/Booking')
const ShipmentRequest = require('../models/ShipmentRequest')

// GET /api/bookings
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const isCarrier = req.user.role === 'carrier'

    const filter = isCarrier
      ? { carrierId: req.user._id }
      : { shipperId: req.user._id }

    if (status) filter.status = status

    const bookings = await Booking.find(filter)
      .populate('carrierId',  'name phone ratingAvg carrierProfile')
      .populate('shipperId',  'name phone shipperProfile')
      .populate('shipmentId', 'pickup dropoff weightKg volumeM3 shipmentType deadline')
      .populate('listingId',  'vehicleType origin destination')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    const total = await Booking.countDocuments(filter)
    res.json({ success: true, data: bookings, total, page: Number(page) })
  } catch (err) {
    next(err)
  }
})

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('carrierId',  'name phone ratingAvg carrierProfile')
      .populate('shipperId',  'name phone shipperProfile')
      .populate('shipmentId', 'pickup dropoff weightKg volumeM3 shipmentType deadline')
      .populate('listingId',  'vehicleType origin destination routeDistanceKm')
      .lean()

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    res.json({ success: true, data: booking })
  } catch (err) {
    next(err)
  }
})

// POST /api/bookings/:id/pod — Carrier submits proof-of-delivery image
router.post('/:id/pod', protect, async (req, res, next) => {
  try {
    const { podImageUrl } = req.body
    if (!podImageUrl) return res.status(400).json({ success: false, message: 'podImageUrl is required' })

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, carrierId: req.user._id, status: { $in: ['confirmed', 'in_transit'] } },
      {
        podImageUrl,
        status: 'in_transit',
        // Generate a 4-digit OTP for shipper to confirm
        podOtp: String(Math.floor(1000 + Math.random() * 9000)),
      },
      { new: true }
    )
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or not yours' })

    // In production: send OTP to shipper's phone via SMS
    console.log(`[pod] OTP for booking ${booking._id}: ${booking.podOtp}`)

    res.json({ success: true, data: { bookingId: booking._id, podImageUrl: booking.podImageUrl } })
  } catch (err) {
    next(err)
  }
})

// POST /api/bookings/:id/verify-pod — Shipper enters OTP to confirm delivery
router.post('/:id/verify-pod', protect, async (req, res, next) => {
  try {
    const { otp } = req.body
    if (!otp) return res.status(400).json({ success: false, message: 'OTP is required' })

    const booking = await Booking.findOne({
      _id:      req.params.id,
      shipperId: req.user._id,
      status:    'in_transit',
    })
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or not in transit' })

    if (booking.podOtp !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    booking.status        = 'delivered'
    booking.podVerified   = true
    booking.podVerifiedAt = new Date()
    booking.deliveryTime  = new Date()
    await booking.save()

    // Mark the shipment as delivered
    await ShipmentRequest.findByIdAndUpdate(booking.shipmentId, { status: 'delivered' })

    res.json({ success: true, data: booking })
  } catch (err) {
    next(err)
  }
})

module.exports = router
