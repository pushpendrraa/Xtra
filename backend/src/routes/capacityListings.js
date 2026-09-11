/**
 * routes/capacityListings.js
 *
 * POST /api/capacity-listings      — Create listing, build route, trigger sweep
 * GET  /api/capacity-listings      — Get carrier's own listings
 * GET  /api/capacity-listings/:id  — Get single listing
 * PATCH /api/capacity-listings/:id/status — Update status
 */

const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const CapacityListing = require('../models/CapacityListing')
const { buildRoute }  = require('../services/routeBuilder')
const { sweepForMatches } = require('../services/matchingEngine')

// POST /api/capacity-listings — Create a new empty-leg listing
router.post('/', protect, async (req, res, next) => {
  try {
    const { origin, destination, ...rest } = req.body
    // origin/destination: { lat, lng, label }

    // §3 — Build and store the route polyline (one Directions call per listing)
    let routeLine = { type: 'LineString', coordinates: [] }
    let routeDistanceKm = 0

    try {
      const built = await buildRoute(origin, destination)
      routeLine        = built.routeLine
      routeDistanceKm  = built.routeDistanceKm
    } catch (routeErr) {
      console.warn('[capacityListings] Route build failed, storing listing without polyline:', routeErr.message)
    }

    const listing = await CapacityListing.create({
      ...rest,
      carrierId: req.user._id,
      origin: {
        type:        'Point',
        coordinates: [origin.lng, origin.lat],
        label:       origin.label || '',
      },
      destination: {
        type:        'Point',
        coordinates: [destination.lng, destination.lat],
        label:       destination.label || '',
      },
      routeLine,
      routeDistanceKm,
      status: 'open',
    })

    // §11.1 — Reverse sweep: check all open shipments near this new route
    sweepForMatches({ newListing: listing }).catch(err =>
      console.error('[capacityListings] sweepForMatches error:', err.message)
    )

    res.status(201).json({ success: true, data: listing })
  } catch (err) {
    next(err)
  }
})

// GET /api/capacity-listings — Get current carrier's listings
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = { carrierId: req.user._id }
    if (status) filter.status = status

    const listings = await CapacityListing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    const total = await CapacityListing.countDocuments(filter)

    res.json({ success: true, data: listings, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// GET /api/capacity-listings/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const listing = await CapacityListing.findById(req.params.id).lean()
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' })
    res.json({ success: true, data: listing })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/capacity-listings/:id/status
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body
    const listing = await CapacityListing.findOneAndUpdate(
      { _id: req.params.id, carrierId: req.user._id },
      { status },
      { new: true }
    )
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found or not yours' })
    res.json({ success: true, data: listing })
  } catch (err) {
    next(err)
  }
})

module.exports = router
