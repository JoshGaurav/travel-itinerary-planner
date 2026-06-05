import RAW from './cityKnowledgeBase.json'

// ── Types matching the knowledge base schema ──────────────────────────────────

export interface Airport {
  iata: string
  icao?: string
  name: string
  type: string
  distance_km: number
  intl_visitor_use?: boolean
  priority: number
}

export interface Spot {
  name: string
  alt_name: string | null
  category: string
  tier: string
  must_see: boolean
  priority: number
}

export interface City {
  id: string
  city: string        // display name, e.g. "Paris"
  aliases: string[]
  country: string
  country_code: string
  region: string
  airports: Airport[]
  popular_spots: Spot[]
  // convenience alias kept for backward compatibility with CreateTrip.tsx
  name: string        // same as city
}

// ── Build typed city list from raw JSON ───────────────────────────────────────

export const CITIES: City[] = (RAW.cities as any[]).map(c => ({
  ...c,
  name: c.city,  // alias so existing code using city.name still works
}))

// ── Featured suggestions shown before the user types ─────────────────────────
const FEATURED_IDS = [
  'tokyo-jp',
  'paris-fr',
  'dubai-ae',
  'barcelona-es',
  'new-york-us',
  'bali-id',
]

export function getDefaultSuggestions(): City[] {
  return FEATURED_IDS.map(id => CITIES.find(c => c.id === id)!).filter(Boolean)
}

// ── City search — matches city name, aliases, country (case-insensitive) ──────
// Empty query → all cities with featured ones pinned first
export function searchCities(query: string): City[] {
  const q = query.toLowerCase().trim()

  if (!q) {
    const featuredIds = new Set(FEATURED_IDS)
    const featured = CITIES.filter(c => featuredIds.has(c.id))
    const rest = CITIES.filter(c => !featuredIds.has(c.id))
      .sort((a, b) => a.city.localeCompare(b.city))
    return [...featured, ...rest]
  }

  return CITIES.filter(city => {
    if (city.city.toLowerCase().includes(q)) return true
    if (city.country.toLowerCase().includes(q)) return true
    if (city.aliases.some(a => a.toLowerCase().includes(q))) return true
    return false
  }).sort((a, b) => {
    // Exact city name match first
    const aExact = a.city.toLowerCase().startsWith(q)
    const bExact = b.city.toLowerCase().startsWith(q)
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return a.city.localeCompare(b.city)
  })
}

// ── Airport helpers ───────────────────────────────────────────────────────────

/** Primary (priority 1) airports — recommended for international visitors */
export function getPrimaryAirports(city: City): Airport[] {
  return city.airports
    .filter(a => a.priority === 1)
    .sort((a, b) => a.priority - b.priority)
}

/** All airports sorted by priority ascending */
export function getSortedAirports(city: City): Airport[] {
  return [...city.airports].sort((a, b) => a.priority - b.priority)
}

// ── Spot helpers ──────────────────────────────────────────────────────────────

/** Must-see spots only, sorted by priority */
export function getMustSeeSpots(city: City): Spot[] {
  return city.popular_spots
    .filter(s => s.must_see)
    .sort((a, b) => a.priority - b.priority)
}

/** All spots sorted by priority */
export function getAllSpotsSorted(city: City): Spot[] {
  return [...city.popular_spots].sort((a, b) => a.priority - b.priority)
}
