const express = require('express')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Helper: sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// Helper: send token response
const sendTokenResponse = (res, user, statusCode = 200) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roles: [user.role],
      ratingAvg: user.ratingAvg,
      ratingCount: user.ratingCount,
      isVerified: user.isVerified,
      carrierProfile: user.carrierProfile,
      shipperProfile: user.shipperProfile,
      createdAt: user.createdAt,
    },
  })
}

// ── POST /api/auth/register ──────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['carrier', 'shipper']).withMessage('Role must be carrier or shipper'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() })

    try {
      const { name, email, phone, password, role, carrierProfile, shipperProfile } = req.body

      const existing = await User.findOne({ email: email.toLowerCase() })
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered. Please sign in.' })

      const user = await User.create({
        name,
        email,
        phone,
        password,
        role,
        carrierProfile: role === 'carrier' ? (carrierProfile || {}) : undefined,
        shipperProfile: role === 'shipper' ? (shipperProfile || {}) : undefined,
      })

      sendTokenResponse(res, user, 201)
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({ success: false, message: 'Server error. Please try again.' })
    }
  }
)

// ── POST /api/auth/login ─────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() })

    try {
      const { email, password } = req.body
      const user = await User.findOne({ email: email.toLowerCase() })
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password.' })

      const isMatch = await user.matchPassword(password)
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' })

      sendTokenResponse(res, user)
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({ success: false, message: 'Server error. Please try again.' })
    }
  }
)

// ── GET /api/auth/me ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

// ── POST /api/auth/logout (client-side only, but good for future blacklist) ──
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out.' })
})

module.exports = router
