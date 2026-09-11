import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from './components/layout/Shell'
import { useAuthStore } from './store/authStore'

// Landing
import LandingPage from './pages/landing/LandingPage'

// Auth
import AuthPage from './pages/auth/AuthPage'

// Carrier
import CarrierDashboard from './pages/carrier/CarrierDashboard'
import CarrierListings from './pages/carrier/CarrierListings'
import PostListing from './pages/carrier/PostListing'
import MatchOffers from './pages/carrier/MatchOffers'
import ActiveBookings from './pages/carrier/ActiveBookings'
import PODCapture from './pages/carrier/PODCapture'
import CarrierAnalytics from './pages/carrier/CarrierAnalytics'

// Shipper
import ShipperDashboard from './pages/shipper/ShipperDashboard'
import PostShipment from './pages/shipper/PostShipment'
import MatchResults from './pages/shipper/MatchResults'
import TrackShipment from './pages/shipper/TrackShipment'
import ShipperAnalytics from './pages/shipper/ShipperAnalytics'

// Guard: redirect to /auth if not logged in
function RequireAuth() {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

// Guard: redirect to dashboard if already logged in
function RequireGuest() {
  const { isAuthenticated, user, activeRole } = useAuthStore()
  return isAuthenticated ? <Navigate to={`/${user?.roles?.[0] || activeRole}`} replace /> : <Outlet />
}

// Guard: restrict by role
function RequireRole({ role }: { role: 'carrier' | 'shipper' }) {
  const { user, activeRole } = useAuthStore()
  const userRole = user?.roles?.[0] || activeRole
  return userRole === role ? <Outlet /> : <Navigate to={`/${userRole}`} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth — redirect to dashboard if already logged in */}
      <Route element={<RequireGuest />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      {/* Protected dashboard routes — redirect to /auth if not logged in */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          {/* Carrier */}
          <Route element={<RequireRole role="carrier" />}>
            <Route path="/carrier" element={<CarrierDashboard />} />
            <Route path="/carrier/listings" element={<CarrierListings />} />
            <Route path="/carrier/listings/new" element={<PostListing />} />
            <Route path="/carrier/matches" element={<MatchOffers />} />
            <Route path="/carrier/bookings" element={<ActiveBookings />} />
            <Route path="/carrier/bookings/pod" element={<PODCapture />} />
            <Route path="/carrier/analytics" element={<CarrierAnalytics />} />
          </Route>

          {/* Shipper */}
          <Route element={<RequireRole role="shipper" />}>
            <Route path="/shipper" element={<ShipperDashboard />} />
            <Route path="/shipper/post" element={<PostShipment />} />
            <Route path="/shipper/post-load" element={<Navigate to="/shipper/post" replace />} />
            <Route path="/shipper/ship" element={<Navigate to="/shipper/post" replace />} />
            <Route path="/shipper/analytics" element={<ShipperAnalytics />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
