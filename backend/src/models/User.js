const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const carrierProfileSchema = new mongoose.Schema({
  vehicleType: { type: String, enum: ['Mini Truck', 'Tata Ace', 'Eicher 17ft', 'Eicher 20ft', 'Container', 'Other'], default: 'Tata Ace' },
  vehicleNumber: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  baseLocation: { type: String, default: '' },
  maxWeightKg: { type: Number, default: 1000 },
  maxVolumeM3: { type: Number, default: 10 },
}, { _id: false })

const shipperProfileSchema = new mongoose.Schema({
  companyName: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  primaryCity: { type: String, default: '' },
  avgShipmentWeightKg: { type: Number, default: 500 },
  monthlyShipments: { type: Number, default: 1 },
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['carrier', 'shipper'], required: true },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  carrierProfile: { type: carrierProfileSchema, default: () => ({}) },
  shipperProfile: { type: shipperProfileSchema, default: () => ({}) },
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password)
}

// Return safe user object (no password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
