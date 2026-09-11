const mongoose = require('mongoose')

const capacityListingSchema = new mongoose.Schema({
  carrierId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },

  // GeoJSON Points
  origin: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },  // [lng, lat]
    label:       { type: String, default: '' },        // human-readable city/address
  },
  destination: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },  // [lng, lat]
    label:       { type: String, default: '' },
  },

  // Full decoded route stored once at creation — §3
  routeLine: {
    type:        { type: String, enum: ['LineString'], default: 'LineString' },
    coordinates: { type: [[Number]], default: [] },   // [[lng,lat], ...]
  },
  routeDistanceKm: { type: Number, default: 0 },

  departureWindowStart: { type: Date, required: true },
  departureWindowEnd:   { type: Date, required: true },
  expectedArrivalTime:  { type: Date },

  availableWeightKg: { type: Number, required: true },
  availableVolumeM3: { type: Number, required: true },
  vehicleType:       { type: String, default: 'Tata Ace' },
  features:          { type: [String], default: [] },  // ['refrigerated', 'hazmat_certified']

  priceFloor:  { type: Number, default: 0 },
  autoAccept:  { type: Boolean, default: false },
  status:      { type: String, enum: ['open', 'partially_matched', 'full', 'expired', 'cancelled'], default: 'open' },
}, { timestamps: true })

// 2dsphere indexes — critical for $nearSphere matching
capacityListingSchema.index({ origin: '2dsphere' })
capacityListingSchema.index({ destination: '2dsphere' })
capacityListingSchema.index({ routeLine: '2dsphere' })
capacityListingSchema.index({ status: 1, departureWindowStart: 1 })

module.exports = mongoose.model('CapacityListing', capacityListingSchema)
