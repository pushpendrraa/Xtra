const mongoose = require('mongoose')

const shipmentRequestSchema = new mongoose.Schema({
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  pickup: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },  // [lng, lat]
    label:       { type: String, default: '' },
  },
  dropoff: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },  // [lng, lat]
    label:       { type: String, default: '' },
  },

  weightKg:     { type: Number, required: true },
  volumeM3:     { type: Number, required: true },
  shipmentType: { type: String, enum: ['general', 'fragile', 'refrigerated', 'hazmat'], default: 'general' },

  earliestPickupTime: { type: Date, required: true },
  deadline:           { type: Date, required: true },

  expectedPrice: { type: Number, default: 0 },   // shipper's budget hint for scoring
  autoAccept:    { type: Boolean, default: false },

  status: { type: String, enum: ['open', 'matched', 'in_transit', 'delivered', 'cancelled'], default: 'open' },
}, { timestamps: true })

shipmentRequestSchema.index({ pickup: '2dsphere' })
shipmentRequestSchema.index({ dropoff: '2dsphere' })
shipmentRequestSchema.index({ status: 1, deadline: 1 })

module.exports = mongoose.model('ShipmentRequest', shipmentRequestSchema)
