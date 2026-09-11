/**
 * routeBuilder.js — §3 of matching_engine.md
 *
 * Calls the free OSRM demo server (no API key) to get a route between
 * two points and returns the decoded GeoJSON LineString + distance.
 *
 * Env: OSRM_BASE_URL (default: http://router.project-osrm.org)
 * Switch to Google Directions by setting DIRECTIONS_PROVIDER=google
 * and GOOGLE_MAPS_API_KEY in .env
 */

const axios = require('axios')
const polyline = require('@mapbox/polyline')

const OSRM_BASE = process.env.OSRM_BASE_URL || 'http://router.project-osrm.org'

/**
 * Build route between origin and destination.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {{ routeLine: GeoJSON.LineString, routeDistanceKm: number }}
 */
async function buildRoute(origin, destination) {
  const provider = process.env.DIRECTIONS_PROVIDER || 'osrm'

  if (provider === 'google') {
    return buildRouteGoogle(origin, destination)
  }
  return buildRouteOSRM(origin, destination)
}

async function buildRouteOSRM(origin, destination) {
  // OSRM expects: /route/v1/driving/{lng,lat};{lng,lat}?overview=full&geometries=polyline
  const url = `${OSRM_BASE}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`

  const { data } = await axios.get(url, { timeout: 10000 })

  if (!data.routes || data.routes.length === 0) {
    throw new Error(`OSRM returned no routes from ${JSON.stringify(origin)} to ${JSON.stringify(destination)}`)
  }

  const route = data.routes[0]
  const decoded = polyline.decode(route.geometry)  // [[lat, lng], ...]

  const routeLine = {
    type: 'LineString',
    coordinates: decoded.map(([lat, lng]) => [lng, lat]),  // flip to GeoJSON [lng, lat]
  }

  return {
    routeLine,
    routeDistanceKm: route.distance / 1000,
  }
}

async function buildRouteGoogle(origin, destination) {
  const key = process.env.GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${key}`

  const { data } = await axios.get(url, { timeout: 10000 })

  if (data.status !== 'OK' || !data.routes.length) {
    throw new Error(`Google Directions API error: ${data.status}`)
  }

  const route = data.routes[0]
  const encodedPolyline = route.overview_polyline.points
  const decoded = polyline.decode(encodedPolyline)

  const routeLine = {
    type: 'LineString',
    coordinates: decoded.map(([lat, lng]) => [lng, lat]),
  }

  const distanceMeters = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0)

  return {
    routeLine,
    routeDistanceKm: distanceMeters / 1000,
  }
}

/**
 * Get detour distance when adding pickup+dropoff waypoints to an existing route.
 * Only called for final candidates — expensive. (§9)
 */
async function getDetourKm(listing, shipment) {
  const provider = process.env.DIRECTIONS_PROVIDER || 'osrm'

  const origin = { lat: listing.origin.coordinates[1], lng: listing.origin.coordinates[0] }
  const destination = { lat: listing.destination.coordinates[1], lng: listing.destination.coordinates[0] }
  const pickup = { lat: shipment.pickup.coordinates[1], lng: shipment.pickup.coordinates[0] }
  const dropoff = { lat: shipment.dropoff.coordinates[1], lng: shipment.dropoff.coordinates[0] }

  let distanceKm

  if (provider === 'google') {
    const key = process.env.GOOGLE_MAPS_API_KEY
    const wp = `${pickup.lat},${pickup.lng}|${dropoff.lat},${dropoff.lng}`
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&waypoints=${wp}&key=${key}`
    const { data } = await axios.get(url, { timeout: 10000 })
    if (data.status !== 'OK') throw new Error(`Google detour call failed: ${data.status}`)
    distanceKm = data.routes[0].legs.reduce((s, l) => s + l.distance.value, 0) / 1000
  } else {
    // OSRM: pass all 4 coordinates in order
    const coords = `${origin.lng},${origin.lat};${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat};${destination.lng},${destination.lat}`
    const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=false`
    const { data } = await axios.get(url, { timeout: 10000 })
    if (!data.routes || !data.routes.length) throw new Error('OSRM detour call returned no routes')
    distanceKm = data.routes[0].distance / 1000
  }

  return distanceKm - listing.routeDistanceKm
}

module.exports = { buildRoute, getDetourKm }
