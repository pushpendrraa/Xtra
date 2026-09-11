import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/Shell'
import { useAuthStore } from './store/authStore'

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

export default function App() {
  const { isAuthenticated, activeRole } = useAuthStore()

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to={`/${activeRole}`} replace />} />
        
        {/* Carrier Routes */}
        <Route path="/carrier" element={<CarrierDashboard />} />
        <Route path="/carrier/listings" element={<CarrierListings />} />
        <Route path="/carrier/listings/new" element={<PostListing />} />
        <Route path="/carrier/matches" element={<MatchOffers />} />
        <Route path="/carrier/bookings" element={<ActiveBookings />} />
        <Route path="/carrier/bookings/pod" element={<PODCapture />} />
        <Route path="/carrier/analytics" element={<CarrierAnalytics />} />
        
        {/* Shipper Routes */}
        <Route path="/shipper" element={<ShipperDashboard />} />
        <Route path="/shipper/post" element={<PostShipment />} />
        <Route path="/shipper/matches" element={<MatchResults />} />
        <Route path="/shipper/track" element={<TrackShipment />} />
        <Route path="/shipper/analytics" element={<ShipperAnalytics />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
