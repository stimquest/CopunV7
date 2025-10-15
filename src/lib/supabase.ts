import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Configuration optimisée pour les performances
export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'x-my-custom-header': 'copun-de-la-mer',
      },
    },
    // Optimisations réseau
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

    