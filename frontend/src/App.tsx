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
  // Support both user.roles[] (array) and user.role (string) from backend
  const role = (user as any)?.role || user?.roles?.[0] || activeRole
  return isAuthenticated ? <Navigate to={`/${role}`} replace /> : <Outlet />
}

// Guard: restrict by role — prevents shipper accessing /carrier and vice versa
function RequireRole({ role }: { role: 'carrier' | 'shipper' }) {
  const { user, activeRole } = useAuthStore()
  // Support both user.roles[] (array) and user.role (string) from backend
  const userRole = (user as any)?.role || user?.roles?.[0] || activeRole
  if (!userRole || userRole === role) return <Outlet />
  return <Navigate to={`/${userRole}`} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Auth & Public — redirect to dashboard if already logged in */}
      <Route element={<RequireGuest />}>
        <Route path="/" element={<LandingPage />} />
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
