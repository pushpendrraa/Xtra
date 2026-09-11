const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
  listingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'CapacityListing', required: true },
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShipmentRequest', required: true },
  carrierId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shipperId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  score:             { type: Number, required: true },
  detourKm:          { type: Number, required: true },
  timeSlackMinutes:  { type: Number, default: 0 },
  priceQuote:        { type: Number, required: true },
  priceBreakdown:    { type: mongoose.Schema.Types.Mixed, default: {} },
  complianceOk:      { type: Boolean, default: true },

  status: {
    type:    String,
    enum:    ['proposed', 'accepted', 'rejected', 'expired'],
    default: 'proposed',
  },
}, { timestamps: true })

matchSchema.index({ shipmentId: 1, status: 1 })
matchSchema.index({ carrierId: 1, status: 1 })
matchSchema.index({ shipperId: 1, status: 1 })

module.exports = mongoose.model('Match', matchSchema)
