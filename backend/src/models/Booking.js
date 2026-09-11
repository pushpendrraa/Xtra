const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  matchId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  listingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'CapacityListing', required: true },
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShipmentRequest', required: true },
  carrierId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shipperId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  finalPrice:   { type: Number, required: true },
  platformFee:  { type: Number, default: 0 },  // 12% of finalPrice

  status: {
    type:    String,
    enum:    ['confirmed', 'in_transit', 'delivered', 'cancelled'],
    default: 'confirmed',
  },

  pickupTime:   { type: Date },
  deliveryTime: { type: Date },

  // Proof of Delivery
  podOtp:        { type: String, default: null },         // 4-digit OTP set by shipper
  podImageUrl:   { type: String, default: null },
  podVerified:   { type: Boolean, default: false },
  podVerifiedAt: { type: Date, default: null },

  // Route snapshot
  routeFrom:  { type: String, default: '' },
  routeTo:    { type: String, default: '' },
  detourKm:   { type: Number, default: 0 },

  notes: { type: String, default: '' },
}, { timestamps: true })

bookingSchema.index({ carrierId: 1, status: 1 })
bookingSchema.index({ shipperId: 1, status: 1 })
bookingSchema.index({ matchId: 1 }, { unique: true })

module.exports = mongoose.model('Booking', bookingSchema)
