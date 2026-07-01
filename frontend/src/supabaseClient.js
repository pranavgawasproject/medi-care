import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// When env vars are missing (e.g. running the redesign in demo mode without
// Supabase credentials), create a stub client whose calls will throw and be
// caught by the fallback logic in App.jsx. This keeps the UI fully usable.
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy(
      {},
      {
        get() {
          // Any method call on the stub throws → App.jsx catches → uses fallback data
          return () => {
            throw new Error('Supabase not configured — using demo data.')
          }
        },
      }
    )

export const isSupabaseConfigured = isConfigured
