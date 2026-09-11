/**
 * matchEvents.js — Socket.io wiring
 *
 * Rooms:
 *   carrier:{userId}  — carrier joins on auth to receive match:offer events
 *   shipper:{userId}  — shipper joins on auth to receive booking:confirmed events
 *
 * Usage: attach to the HTTP server in index.js
 *   const { initSocket } = require('./sockets/matchEvents')
 *   const io = initSocket(httpServer)
 */

const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { setIo } = require('../services/matchingEngine')

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL || 'http://localhost:5174', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // JWT auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    if (!token) return next(new Error('Authentication required'))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      socket.userRole = decoded.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const { userId, userRole } = socket

    // Auto-join role-specific room
    if (userRole === 'carrier') {
      socket.join(`carrier:${userId}`)
      console.log(`[socket] Carrier ${userId} connected and joined carrier:${userId}`)
    } else if (userRole === 'shipper') {
      socket.join(`shipper:${userId}`)
      console.log(`[socket] Shipper ${userId} connected and joined shipper:${userId}`)
    }

    socket.on('disconnect', () => {
      console.log(`[socket] User ${userId} disconnected`)
    })
  })

  // Give the matching engine access to io
  setIo(io)

  return io
}

module.exports = { initSocket }
