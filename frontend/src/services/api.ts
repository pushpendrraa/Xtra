import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const api = axios.create({ baseURL: BASE, timeout: 10000 })

api.interceptors.request.use((cfg) => {
  const raw = localStorage.getItem('xtra-auth')
  if (raw) { try { const s = JSON.parse(raw); if (s?.state?.token) cfg.headers.Authorization = `Bearer ${s.state.token}` } catch { } }
  return cfg
})

// ─── Types ────────────────────────────────────────────────────────

export interface CarrierProfile {
  vehicleType: string
  vehicleNumber: string
  licenseNumber: string
  baseLocation: string
  maxWeightKg: number
  maxVolumeM3: number
}

export interface ShipperProfile {
  companyName: string
  gstNumber: string
  primaryCity: string
  avgShipmentWeightKg: number
  monthlyShipments: number
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
  role: 'carrier' | 'shipper'
  carrierProfile?: Partial<CarrierProfile>
  shipperProfile?: Partial<ShipperProfile>
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: {
    id: string
    name: string
    email: string
    phone: string
    role: 'carrier' | 'shipper'
    roles: ('carrier' | 'shipper')[]
    ratingAvg: number
    ratingCount: number
    isVerified: boolean
    carrierProfile?: CarrierProfile
    shipperProfile?: ShipperProfile
  }
}

// ─── Real Auth API ─────────────────────────────────────────────────

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/api/auth/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/api/auth/login', payload).then((r) => r.data),

  me: () =>
    api.get<{ success: boolean; user: AuthResponse['user'] }>('/api/auth/me').then((r) => r.data),

  health: () =>
    api.get<{ status: string }>('/api/health').then((r) => r.data),
}

// ─── Mock Data ────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'u1', name: 'Aryan Mehta', email: 'aryan@xtra.io', phone: '+91-98765-43210',
  roles: ['carrier', 'shipper'] as ('carrier' | 'shipper')[],
  ratingAvg: 4.7, ratingCount: 128,
}

export const MOCK_CARRIER_KPI = {
  tripsThisWeek: 12, utilizationPct: 78, co2SavedKg: 340, earningsINR: 58400,
  emptyKmAvoided: 1240, tripsMatched: 87, avgRating: 4.7,
}

export const MOCK_SHIPPER_KPI = {
  shipmentsBooked: 9, costSavedINR: 22500, co2SavedKg: 180, avgDeliveryHrs: 6.2,
}

export const MOCK_LISTINGS = [
  { id: 'l1', origin: 'Mumbai', destination: 'Pune', departureWindow: '2026-09-12 08:00', availableWeightKg: 2000, availableVolumeM3: 18, priceFloor: 4200, status: 'open', vehicle: 'Tata Ace - MH01AB1234' },
  { id: 'l2', origin: 'Delhi', destination: 'Jaipur', departureWindow: '2026-09-12 10:30', availableWeightKg: 5000, availableVolumeM3: 32, priceFloor: 8900, status: 'partially_matched', vehicle: 'Eicher 20ft - DL05CD5678' },
]

export const MOCK_MATCH_OFFERS = [
  {
    id: 'm1', listingId: 'l1', shipmentId: 's1', score: 0.91, detourKm: 12, timeSlackMinutes: 95, priceQuote: 5100, status: 'proposed',
    shipper: { name: 'Ravi Logistics', rating: 4.5 }, shipment: { pickup: 'Thane', dropoff: 'Hadapsar', weightKg: 800, volumeM3: 6, type: 'general', deadline: '2026-09-12 14:00' },
    priceBreakdown: { distanceCost: 3200, weightCost: 640, volumeCost: 480, urgencySurcharge: 0, discountApplied: 1240, platformFee: 612 }
  },
  {
    id: 'm2', listingId: 'l1', shipmentId: 's2', score: 0.76, detourKm: 28, timeSlackMinutes: 45, priceQuote: 3800, status: 'proposed',
    shipper: { name: 'Mehta Exports', rating: 4.1 }, shipment: { pickup: 'Andheri', dropoff: 'Wakad', weightKg: 1200, volumeM3: 9, type: 'fragile', deadline: '2026-09-12 18:00' },
    priceBreakdown: { distanceCost: 2400, weightCost: 960, volumeCost: 720, urgencySurcharge: 0, discountApplied: 920, platformFee: 456 }
  },
]

export const MOCK_BOOKINGS = [
  {
    id: 'b1', matchId: 'm3', carrierId: 'u1', shipperId: 'u2', finalPrice: 6200, platformFee: 744, status: 'in_transit', pickedUpAt: '2026-09-11 09:30',
    route: { from: 'Mumbai', to: 'Pune' }, shipper: { name: 'Patel Traders' }, vehicle: 'Tata Ace', driver: 'Ramesh K.'
  },
  {
    id: 'b2', matchId: 'm4', carrierId: 'u1', shipperId: 'u3', finalPrice: 4100, platformFee: 492, status: 'delivered', deliveredAt: '2026-09-10 16:45',
    route: { from: 'Delhi', to: 'Gurgaon' }, shipper: { name: 'Singh Brothers' }, vehicle: 'Eicher 17ft', driver: 'Suresh V.'
  },
]

export const MOCK_SHIPMENTS = [
  { id: 's3', shipperId: 'u1', pickup: 'Andheri West', dropoff: 'Hadapsar, Pune', weightKg: 600, volumeM3: 4.5, type: 'general', deadline: '2026-09-13 12:00', status: 'open' },
  { id: 's4', shipperId: 'u1', pickup: 'Connaught Place', dropoff: 'Cyber City, Gurugram', weightKg: 1500, volumeM3: 11, type: 'fragile', deadline: '2026-09-12 20:00', status: 'booked' },
]

export const MOCK_MATCH_RESULTS = [
  {
    id: 'r1', listingId: 'l3', score: 0.93, detourKm: 8, timeSlackMinutes: 110, priceQuote: 2800, status: 'proposed',
    carrier: { name: 'Sharma Freight', rating: 4.8, tripsCompleted: 92 }, listing: { origin: 'Bandra', destination: 'Pune', vehicleType: 'Tata Ace', departureWindow: '2026-09-12 09:00' }
  },
  {
    id: 'r2', listingId: 'l4', score: 0.82, detourKm: 19, timeSlackMinutes: 60, priceQuote: 3500, status: 'proposed',
    carrier: { name: 'Joshi Carriers', rating: 4.5, tripsCompleted: 58 }, listing: { origin: 'Vashi', destination: 'Hadapsar', vehicleType: 'Mahindra Bolero', departureWindow: '2026-09-12 11:00' }
  },
  {
    id: 'r3', listingId: 'l5', score: 0.71, detourKm: 35, timeSlackMinutes: 30, priceQuote: 2200, status: 'proposed',
    carrier: { name: 'Kumar Express', rating: 4.2, tripsCompleted: 31 }, listing: { origin: 'Thane', destination: 'Kothrud', vehicleType: 'Mini Truck', departureWindow: '2026-09-12 13:00' }
  },
]

export const MOCK_ANALYTICS_CARRIER = {
  weekly: [
    { day: 'Mon', utilization: 65, earnings: 8200, co2: 42 },
    { day: 'Tue', utilization: 80, earnings: 11400, co2: 58 },
    { day: 'Wed', utilization: 72, earnings: 9800, co2: 51 },
    { day: 'Thu', utilization: 90, earnings: 13200, co2: 68 },
    { day: 'Fri', utilization: 85, earnings: 12100, co2: 63 },
    { day: 'Sat', utilization: 60, earnings: 7600, co2: 39 },
    { day: 'Sun', utilization: 45, earnings: 5800, co2: 29 },
  ],
  monthlyTrips: [
    { month: 'Jun', trips: 38 }, { month: 'Jul', trips: 45 }, { month: 'Aug', trips: 52 }, { month: 'Sep', trips: 39 },
  ],
}

export const MOCK_ANALYTICS_SHIPPER = {
  weekly: [
    { day: 'Mon', costSaved: 1200, co2: 18 },
    { day: 'Tue', costSaved: 2100, co2: 31 },
    { day: 'Wed', costSaved: 1800, co2: 26 },
    { day: 'Thu', costSaved: 2800, co2: 42 },
    { day: 'Fri', costSaved: 2300, co2: 34 },
    { day: 'Sat', costSaved: 1100, co2: 16 },
    { day: 'Sun', costSaved: 900, co2: 13 },
  ],
}

export const MOCK_TRACKING = {
  bookingId: 'b1',
  steps: [
    { label: 'Booking Confirmed', ts: '09:05', done: true },
    { label: 'Driver Assigned', ts: '09:12', done: true },
    { label: 'Picked Up', ts: '09:30', done: true },
    { label: 'In Transit', ts: '09:35', done: true, active: true },
    { label: 'Arrived at Destination', ts: null, done: false },
    { label: 'POD Verified', ts: null, done: false },
    { label: 'Delivered', ts: null, done: false },
  ],
  carrier: { name: 'Sharma Freight', driver: 'Ramesh K.', vehicle: 'Tata Ace — MH04ZZ9901', rating: 4.8 },
  pickup: 'Andheri West, Mumbai',
  dropoff: 'Hadapsar, Pune',
  eta: '13:45',
  priceQuote: 2800,
}
