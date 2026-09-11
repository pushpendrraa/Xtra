/**
 * pricingEngine.js
 *
 * Computes the price for a match given the listing, shipment, and detour.
 * Returns both a total and a line-item breakdown for frontend display.
 *
 * Formula:
 *   distanceCost    = routeDistanceKm * RATE_PER_KM
 *   detourCost      = detourKm        * RATE_PER_KM * 1.5   (detour premium)
 *   weightCost      = weightKg        * RATE_PER_KG
 *   volumeCost      = volumeM3        * RATE_PER_M3
 *   urgencySurcharge = if deadline within 6 hrs → 15% of subtotal
 *   subtotal        = distanceCost + detourCost + weightCost + volumeCost + urgencySurcharge
 *   priceFloorDelta = max(0, listing.priceFloor - subtotal)  (ensure carrier gets minimum)
 *   platformFee     = subtotal * 0.12
 *   totalINR        = subtotal + priceFloorDelta + platformFee
 */

const RATE_PER_KM  = Number(process.env.RATE_PER_KM  || 12)   // ₹/km
const RATE_PER_KG  = Number(process.env.RATE_PER_KG  || 0.8)  // ₹/kg
const RATE_PER_M3  = Number(process.env.RATE_PER_M3  || 80)   // ₹/m³
const PLATFORM_FEE_PCT = 0.12  // 12%

/**
 * @param {object} listing   — CapacityListing document
 * @param {object} shipment  — ShipmentRequest document
 * @param {number} detourKm  — additional km caused by the detour
 * @returns {{ totalINR: number, breakdown: object }}
 */
function computePrice(listing, shipment, detourKm) {
  const distanceCost  = Math.round(listing.routeDistanceKm * RATE_PER_KM)
  const detourCost    = Math.round(detourKm * RATE_PER_KM * 1.5)
  const weightCost    = Math.round(shipment.weightKg * RATE_PER_KG)
  const volumeCost    = Math.round(shipment.volumeM3 * RATE_PER_M3)

  const hoursUntilDeadline = (new Date(shipment.deadline) - Date.now()) / 3_600_000
  const isUrgent = hoursUntilDeadline <= 6
  const baseSubtotal = distanceCost + detourCost + weightCost + volumeCost
  const urgencySurcharge = isUrgent ? Math.round(baseSubtotal * 0.15) : 0

  const subtotal = baseSubtotal + urgencySurcharge

  // Ensure carrier gets at least their priceFloor
  const priceFloorDelta = Math.max(0, (listing.priceFloor || 0) - subtotal)
  const platformFee = Math.round((subtotal + priceFloorDelta) * PLATFORM_FEE_PCT)

  const totalINR = subtotal + priceFloorDelta + platformFee

  const breakdown = {
    distanceCost,
    detourCost,
    weightCost,
    volumeCost,
    urgencySurcharge,
    priceFloorDelta,
    platformFee,
    totalINR,
  }

  return { totalINR, breakdown }
}

module.exports = { computePrice }
