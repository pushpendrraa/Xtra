import { io, Socket } from 'socket.io-client'
const BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'
let socket: Socket | null = null
export function getSocket(): Socket | null { return socket }
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket
  socket = io(BASE, { auth: { token }, transports: ['websocket'], reconnectionAttempts: 5, reconnectionDelay: 2000 })
  socket.on('connect', () => console.log('[socket] connected:', socket?.id))
  socket.on('connect_error', (err: any) => console.warn('[socket] error:', err.message))
  socket.on('disconnect', () => console.log('[socket] disconnected'))
  return socket
}
export function disconnectSocket() { socket?.disconnect(); socket = null }
