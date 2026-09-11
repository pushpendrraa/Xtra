require('dotenv').config()
const http     = require('http')
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')
const cron     = require('node-cron')

// Routes
const authRoutes            = require('./routes/auth')
const capacityListingRoutes = require('./routes/capacityListings')
const shipmentRequestRoutes = require('./routes/shipmentRequests')
const matchRoutes           = require('./routes/matches')
const bookingRoutes         = require('./routes/bookings')
const dashboardRoutes       = require('./routes/dashboard')

// Socket.io
const { initSocket } = require('./sockets/matchEvents')

// Matching engine (for cron sweep)
const { matchShipment } = require('./services/matchingEngine')
const ShipmentRequest   = require('./models/ShipmentRequest')

const app    = express()
const server = http.createServer(app)  // wrap with http for socket.io
const PORT   = process.env.PORT || 4000

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin:      [process.env.CLIENT_URL || 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',               authRoutes)
app.use('/api/capacity-listings',  capacityListingRoutes)
app.use('/api/shipment-requests',  shipmentRequestRoutes)
app.use('/api/matches',            matchRoutes)
app.use('/api/bookings',           bookingRoutes)
app.use('/api/dashboard',          dashboardRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({
  status:    'ok',
  timestamp: new Date().toISOString(),
  services:  ['auth', 'capacity-listings', 'shipment-requests', 'matches', 'bookings', 'dashboard', 'matching-engine', 'socket.io'],
}))

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' })
})

// ── Connect MongoDB → start server ────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')

    // Init Socket.io (must be after server is created)
    initSocket(server)
    console.log('✅ Socket.io ready')

    // Cron: every 10 minutes, re-sweep all open shipments (catches compliance changes)
    cron.schedule('*/10 * * * *', async () => {
      console.log('[cron] Sweeping open shipments for new matches...')
      try {
        const openShipments = await ShipmentRequest.find({ status: 'open' })
        for (const shipment of openShipments) {
          await matchShipment(shipment).catch(e =>
            console.warn('[cron] matchShipment error:', e.message)
          )
        }
        console.log(`[cron] Swept ${openShipments.length} open shipments`)
      } catch (err) {
        console.error('[cron] sweep error:', err.message)
      }
    })
    console.log('✅ Cron job scheduled (every 10 min)')

    server.listen(PORT, () =>
      console.log(`🚀 Xtra backend running on http://localhost:${PORT}`)
    )
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
