import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Trip {
  id: string
  user_id: string
  destination: string
  start_date: string
  end_date: string
  notes: string
  cover_image: string
  created_at: string
}

export interface ItineraryDay {
  id: string
  trip_id: string
  day_date: string
  day_number: number
  notes: string
}

export interface Activity {
  id: string
  day_id: string
  title: string
  description: string
  start_time: string | null
  end_time: string | null
  location: string
  sort_order: number
  activity_type: string
  latitude: number | null
  longitude: number | null
}
