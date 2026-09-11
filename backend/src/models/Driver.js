const mongoose = require('mongoose')

const driverSchema = new mongoose.Schema({
  carrierId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  phone:      { type: String, default: '' },
  licenseNumber: { type: String, default: '' },

  status: {
    type:    String,
    enum:    ['available', 'resting', 'driving'],
    default: 'available',
  },

  // Compliance tracking — §8
  hoursDrivenToday: { type: Number, default: 0 },
  lastRestEndedAt:  { type: Date, default: Date.now },
  maxDailyHours:    { type: Number, default: 10 },   // legal limit
  minRestHours:     { type: Number, default: 8 },    // mandatory rest
}, { timestamps: true })

driverSchema.index({ carrierId: 1 })

module.exports = mongoose.model('Driver', driverSchema)
