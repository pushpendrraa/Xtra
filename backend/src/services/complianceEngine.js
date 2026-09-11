/**
 * complianceEngine.js — §8 of matching_engine.md
 *
 * Checks whether a driver is legally compliant to take an additional trip.
 * Based on Indian motor vehicle driving hour regulations.
 */

/**
 * Estimate additional trip hours from a listing + shipment.
 * Uses a rough speed estimate based on vehicle type.
 */
function estimateTripHours(listing, detourKm) {
  const AVG_SPEED_KMH = 40  // conservative city/highway average
  const extraDistanceKm = detourKm + 10  // pickup + dropoff proximity overhead
  return extraDistanceKm / AVG_SPEED_KMH
}

/**
 * Returns true if the driver is compliant to take an additional trip.
 * @param {object|null} driver  — Driver document (null = unknown driver, default allow)
 * @param {number} addedTripHours
 */
function isDriverCompliant(driver, addedTripHours) {
  // If no driver assigned yet, allow match (driver assigned at booking)
  if (!driver) return true

  const projectedHours = (driver.hoursDrivenToday || 0) + addedTripHours
  if (projectedHours > (driver.maxDailyHours || 10)) return false

  if (driver.status === 'resting') {
    const restHours = (Date.now() - new Date(driver.lastRestEndedAt).getTime()) / 3_600_000
    if (restHours < (driver.minRestHours || 8)) return false
  }

  return true
}

module.exports = { isDriverCompliant, estimateTripHours }
