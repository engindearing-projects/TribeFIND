import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Force environment variables to be loaded
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rfvlxtzjtcaxkxisyuys.supabase.co'
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmx4dHpqdGNheGt4aXN5dXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzg3NDgsImV4cCI6MjA2NjM1NDc0OH0.OrN9YGA5rzcC1mUjxd2maeAUFmnx9VixMgnm_LdLIVM'

if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl ? 'loaded' : 'MISSING')
  console.log('Supabase Key:', supabaseKey ? 'loaded' : 'MISSING')
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check your EAS build configuration.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-my-custom-header': 'tribefind',
      'x-client-info': 'tribefind-mobile',
      'apikey': supabaseKey, // Explicitly set the API key
    },
  },
})

// Database table types
export interface User {
  id: string
  email: string
  display_name: string
  username: string
  avatar: string
  bio: string
  snap_score: number
  joined_at: string
  last_active: string
  is_online: boolean
  social_accounts?: {
    twitter?: {
      id?: string
      username?: string
      verified?: boolean
    }
  }
  settings: {
    share_location: boolean
    allow_friend_requests: boolean
    show_online_status: boolean
    allow_message_from_strangers: boolean
    ghost_mode: boolean
    privacy_level: string
    notifications: {
      push_enabled: boolean
      location_updates: boolean
      friend_requests: boolean
      messages: boolean
    }
  }
  stats: {
    snaps_shared: number
    friends_count: number
    stories_posted: number
  }
  location?: {
    latitude: number
    longitude: number
    timestamp: string
  }
  // PostGIS location fields from database schema
  location_accuracy?: number
  location_updated_at?: string
  created_at?: string
  updated_at?: string
}

export interface Location {
  id: string
  user_id: string
  latitude: number
  longitude: number
  timestamp: string
  accuracy?: number
  heading?: number
  speed?: number
}

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      if (__DEV__) console.error('Supabase connection test failed:', error.message)
      return false
    }
    return true
  } catch (error: any) {
    if (__DEV__) console.error('Supabase connection error:', error.message)
    return false
  }
} 