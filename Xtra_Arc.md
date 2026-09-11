# Xtra — Empty-Leg Freight Matching Platform
### Architecture Spec (for AI coding agent)

**Brief:** PWA. Carriers list spare return-leg capacity, shippers post loads. System matches on route/capacity/time, prices transparently, tracks to delivery with POD, reports utilization/CO₂/savings.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TS, Tailwind + shadcn/ui, `vite-plugin-pwa` |
| Maps/Routing | OSRM or Google Directions API |
| Backend | Node.js + Express (or NestJS), TypeScript |
| DB | MongoDB (Mongoose ODM), `2dsphere` geo indexes |
| Matching | Node/TS scoring service; optional Python + OR-Tools microservice (VRPTW stretch, called over HTTP from Node) |
| Realtime | Socket.io / Web Push |
| Auth | JWT + OTP (`jsonwebtoken`, `bcrypt`) |
| Storage | S3-compatible (POD photos) via `aws-sdk`/`multer-s3` |
| Payments | Stripe test mode / internal `ledger` collection |
| Hosting | Vercel (web) + Render/Railway (api) + MongoDB Atlas (DB) |

**Note on geo queries:** Mongo `2dsphere` + `$geoNear`/`$geoWithin`/`$nearSphere` handle point-radius queries natively. Route-corridor detour checks (point-near-polyline) aren't a single built-in operator like PostGIS `ST_DWithin` — sample the route polyline into points every ~1–2 km and query against those, or compute point-to-segment distance in application code.

---

## 2. System Flow

```
Carrier App/Web ──► Capacity Listing Service ─┐
                                                ├──► Matching Engine ──► Pricing Engine ──► Booking Service
Shipper App/Web ──► Shipment Request Service ──┘                                              │
                                                                                                ▼
                                                                              Driver Compliance Gate (hard filter,
                                                                              runs inside Matching Engine before
                                                                              a match is emitted)
                                                                                                │
                                                                                                ▼
                                                                                    POD / Tracking Service
                                                                                                │
                                                                              ┌─────────────────┼─────────────────┐
                                                                              ▼                 ▼                 ▼
                                                                        Ledger/Payout    Analytics Engine    Trust/Rating
                                                                        (release funds)  (util/CO₂/saved)    (post-trip)
```

**Tech per stage:**
| Stage | Tech |
|---|---|
| Carrier/Shipper App/Web | React + Vite + TS, Tailwind + shadcn/ui, PWA shell (`vite-plugin-pwa`) |
| Capacity Listing / Shipment Request Service | Express/NestJS routes, MongoDB collections with `2dsphere` geo indexes |
| Matching Engine | Node/TS scoring service (+ optional Python OR-Tools microservice for VRPTW stretch), reads/writes MongoDB |
| Driver Compliance Gate | Rule logic inside Node service, reads `drivers` collection |
| Pricing Engine | Node/TS function/service, config-driven rate table |
| Booking Service | Express/NestJS, MongoDB `bookings` collection, Socket.io emits status events |
| POD / Tracking Service | Express endpoint + S3-compatible bucket (photo) via `multer-s3`, device geolocation, OTP via SMS/email provider |
| Ledger/Payout | Stripe (test mode) or internal `ledger` collection in MongoDB |
| Analytics Engine | Scheduled job (`node-cron` / worker) computing `analytics_snapshots`, MongoDB aggregation pipeline |
| Trust/Rating | Express endpoint, MongoDB `ratings` collection, rolling avg update |
| Realtime push (offers/status) | Socket.io / Web Push API |

## 3. Carrier Flow

```
Signup/Login → Add Vehicle + Driver
        │
        ▼
Post Capacity Listing (origin, dest, window, kg/m³, price floor)
        │
        ▼
Matching Engine scores open shipments ──► ranked Match Offers pushed to carrier
        │
        ▼
Accept ──► Booking created ──► Pickup ──► In-Transit ──► POD capture (OTP+photo+geo)
        │                                                        │
        ▼                                                        ▼
   Reject → back to pool                              Ledger release → Rating prompt → Dashboard update
```

**Tech per step:**
| Step | Tech |
|---|---|
| Signup/Login | JWT auth + OTP verification (Node backend, `jsonwebtoken`/`bcrypt`), React form (frontend) |
| Add Vehicle + Driver | React form → Express/NestJS `/vehicles`, `/drivers` → MongoDB (Mongoose) |
| Post Capacity Listing | React map picker (OSRM/Google Directions for route+polyline) → Express → MongoDB with `2dsphere` index |
| Matching Engine scoring | Node/TS scoring service, queried via `/matches?listing_id=` |
| Match Offers pushed | Socket.io event / Web Push notification to installed PWA |
| Accept/Reject | React action → Express `/matches/:id/accept|reject` |
| Booking created | Express → MongoDB `bookings` collection |
| Pickup / In-Transit status | React status buttons → Express `/bookings/:id/pickup`, Socket.io broadcast |
| POD capture | Browser Geolocation API + camera input (React) → S3 upload (`multer-s3`) → Express OTP verify |
| Ledger release | Stripe test-mode API or internal `ledger` collection update |
| Rating prompt | React modal → Express `/ratings` → MongoDB |
| Dashboard update | Recharts (frontend) fed by `/analytics/carrier/:id` (MongoDB aggregation) |

## 4. Shipper Flow

```
Signup/Login → Post Shipment (pickup, drop, kg/m³, type, deadline)
        │
        ▼
Matching Engine returns ranked Capacity Listings (price, detour, ETA, carrier rating)
        │
        ▼
Select + Confirm (escrow hold) ──► Booking ──► Track status ──► Receive/verify OTP at POD
        │
        ▼
   Rate carrier ──► Dashboard update (cost saved, CO₂ saved)
```

**Tech per step:**
| Step | Tech |
|---|---|
| Signup/Login | JWT auth + OTP (Node backend), React form |
| Post Shipment | React form + OSRM/Google geocoding for pickup/drop → Express → MongoDB with `2dsphere` index |
| Matching Engine results | Node/TS scoring service → `/matches?shipment_id=` → React ranked list UI |
| Select + Confirm (escrow) | React checkout UI → Stripe test-mode hold (or `ledger` insert) → Express `/bookings` |
| Track status | Socket.io live updates rendered in React status tracker |
| Receive/verify OTP | SMS/email OTP provider → React OTP input → Express verify endpoint |
| Rate carrier | React modal → Express `/ratings` → MongoDB |
| Dashboard update | Recharts (frontend) fed by `/analytics/platform` or shipper-scoped MongoDB aggregation query |

## 5. Matching Engine — internal flow

```
New Listing/Shipment
        │
        ▼
┌───────────────── Hard Filters (all must pass) ─────────────────┐
│ capacity_ok → type_ok → time_ok → route_ok(detour) → compliance_ok │
└───────────────────────────┬──────────────────────────────────────┘
                             │ pass
                             ▼
                     Score & Rank Candidates
                             │
                 ┌───────────┴───────────┐
        score > AUTO_THRESHOLD      score ≤ AUTO_THRESHOLD
                 │                         │
                 ▼                         ▼
          Auto-confirm Match        Push top-N offers to
          (if both opted-in)        carrier/shipper for manual accept
```

**Tech per step:**
| Step | Tech |
|---|---|
| Hard filters (capacity/type/time/route/compliance) | Node/TS function, road-distance calls to OSRM/Google Directions API, reads MongoDB (`2dsphere` queries) |
| Score & rank | Node/TS scoring function (weighted formula, §7.4); optional Python + OR-Tools microservice (HTTP call from Node) for VRPTW multi-stop stretch goal |
| Auto-confirm path | Express directly creates `bookings` document on threshold match |
| Manual offer path | Socket.io/Web Push to React clients; stored as `matches` document (status=proposed) awaiting accept/reject |

---

## 6. Data Model (MongoDB, Mongoose schemas — core collections)

```js
// users
{ _id, name, email, phone, passwordHash, roles: ['carrier','shipper'],
  ratingAvg: Number, ratingCount: Number, createdAt }

// vehicles
{ _id, carrierId, type, capacityKg, capacityM3, features: [String],
  emissionFactorKgPerTkm: Number }

// drivers
{ _id, carrierId, name, licenseNo, hoursDrivenToday: Number,
  lastRestEndedAt: Date, maxDailyHours: Number, minRestHours: Number,
  status: 'available'|'driving'|'resting'|'off' }

// capacity_listings
{ _id, carrierId, vehicleId, driverId,
  origin: { type: 'Point', coordinates: [lng, lat] },
  destination: { type: 'Point', coordinates: [lng, lat] },
  routePolyline: String, routeDistanceKm: Number,
  departureWindowStart: Date, departureWindowEnd: Date,
  availableWeightKg: Number, availableVolumeM3: Number,
  priceFloor: Number, status: 'open'|'partially_matched'|'full'|'expired'|'cancelled' }

// shipment_requests
{ _id, shipperId,
  pickup: { type: 'Point', coordinates: [lng, lat] },
  dropoff: { type: 'Point', coordinates: [lng, lat] },
  weightKg: Number, volumeM3: Number,
  shipmentType: 'general'|'fragile'|'refrigerated'|'hazmat',
  deadline: Date, status: 'open'|'matched'|'booked'|'delivered'|'cancelled' }

// matches
{ _id, listingId, shipmentId, score: Number, detourKm: Number,
  timeSlackMinutes: Number, priceQuote: Number,
  priceBreakdown: { distanceCost, weightCost, volumeCost, urgencySurcharge, discountApplied, platformFee },
  complianceOk: Boolean, status: 'proposed'|'accepted'|'rejected'|'expired' }

// bookings
{ _id, matchId, carrierId, shipperId, finalPrice: Number, platformFee: Number,
  status: 'confirmed'|'picked_up'|'in_transit'|'delivered'|'disputed'|'cancelled',
  pickedUpAt: Date, deliveredAt: Date }

// proof_of_delivery
{ _id, bookingId, otpCode: String, otpVerified: Boolean, photoUrl: String,
  geo: { lat: Number, lng: Number }, capturedAt: Date }

// ledger
{ _id, bookingId, type: 'escrow_hold'|'release'|'platform_fee'|'refund',
  amount: Number, status: String }

// ratings
{ _id, bookingId, raterId, rateeId, stars: Number, tags: [String], comment: String }

// analytics_snapshots
{ _id, carrierId, periodStart: Date, periodEnd: Date, utilizationPct: Number,
  emptyKmAvoided: Number, costSaved: Number, co2SavedKg: Number, tripsMatched: Number }
```

**Geo indexes** (Mongoose): `capacity_listings.origin`, `capacity_listings.destination`, `shipment_requests.pickup`, `shipment_requests.dropoff` → `schema.index({ field: '2dsphere' })`. Query nearest/within-radius with `$geoNear` or `$nearSphere`; corridor/detour checks done by sampling `routePolyline` into points and running `$near` per sample, or via app-level point-to-segment distance.

---

## 7. Core Algorithms & Formulas

### 7.1 Hard filters
```
capacity_ok   = shipment.weight_kg ≤ listing.available_weight_kg
                AND shipment.volume_m3 ≤ listing.available_volume_m3
type_ok       = shipment.type ∈ vehicle.compatible_types(vehicle.features)
time_ok       = shipment.deadline ≥ listing.departure_window_start
                AND (listing.departure_window_end − transit_time) satisfies deadline
route_ok      = detour_km ≤ max(MAX_DETOUR_KM, MAX_DETOUR_PCT × listing.route_distance_km)
compliance_ok = driver_hours_check(driver, added_trip_hours) == true
```

### 7.2 Detour
```
detour_km = dist(origin → pickup) + dist(pickup → dropoff) + dist(dropoff → destination)
            − listing.route_distance_km
```
(road distance via OSRM/Google; haversine as fallback)

### 7.3 Driver compliance
```
projected_hours = driver.hours_driven_today + added_trip_duration_hours
compliance_ok   = projected_hours ≤ driver.max_daily_hours
                  AND (now() − driver.last_rest_ended_at) ≥ driver.min_rest_hours_if_resting
```

### 7.4 Match score
```
score = 0.35 × (1 − detour_km / max_allowed_detour_km)
      + 0.25 × (time_slack_minutes / max_time_slack_minutes)
      + 0.20 × (carrier.rating_avg / 5)
      + 0.20 × (1 − |price_quote − shipper_expected_price| / shipper_expected_price)
      + repeat_pairing_bonus   (+0.05 if ≥2 prior completed bookings together)
```
Auto-confirm if `score > AUTO_MATCH_THRESHOLD` (e.g. 0.85) and both parties opted in.

### 7.5 Pricing
```
base_rate_per_km   = f(vehicle_type)
weight_factor      = weight_kg × per_kg_rate
volume_factor      = volume_m3 × per_m3_rate
urgency_multiplier = 1.0 | 1.15 (deadline < 6h) | 1.3 (deadline < 2h)
empty_leg_discount = 0.4

raw_price = (base_rate_per_km × distance_km + weight_factor + volume_factor) × urgency_multiplier
price     = raw_price × (1 − empty_leg_discount)
platform_fee    = price × 0.12
carrier_payout  = price − platform_fee
```
Store itemized breakdown as `price_breakdown JSONB`.

### 7.6 Utilization / savings / emissions
```
utilization_pct  = Σ(matched_weight_kg) / Σ(capacity_kg_offered) × 100
empty_km_avoided = Σ(shipment_leg_distance_km) over completed bookings
cost_saved       = Σ(dedicated_freight_market_rate − price_paid_by_shipper)
co2_saved_kg     = Σ[ distance_km × emission_factor_full_truck(vehicle_type)
                       × (shipment.weight_kg / vehicle.capacity_kg) ]
```
`emission_factor` (kg CO₂/tonne-km) as static JSON per vehicle type, e.g. `{mini_truck:0.10, tempo:0.12, container:0.15, refrigerated:0.18}`.

---

## 8. API Surface (REST, Express/NestJS routes)

```
POST /auth/signup | /auth/login          GET /users/me
POST /vehicles | /drivers                PATCH /drivers/:id/status
POST /capacity-listings                  GET /capacity-listings?carrier_id=&status=
POST /shipment-requests                  GET /shipment-requests?shipper_id=&status=
GET  /matches?shipment_id= | ?listing_id=
POST /matches/:id/accept | /reject
POST /bookings/:id/pickup | /pod {otp, photo, geo}
POST /ratings                            GET /analytics/carrier/:id | /platform
WS   /ws  (live match/booking push)
```

---

## 9. PWA Requirements

- `manifest.json`: name "Xtra", `display: standalone`, icons 192/512
- Service worker (`vite-plugin-pwa`): cache-first static, network-first API, offline fallback
- Offline queue for POD capture (retry sync on reconnect)
- Web Push: new match offer, status change, payment released
- Bottom tab nav, role-aware (Carrier ⇄ Shipper toggle)

---

*Paste this directly into an AI coding agent as the build prompt for the Xtra monorepo. Backend: Node.js + Express/NestJS + TypeScript. Database: MongoDB (Mongoose, `2dsphere` geo indexes).*