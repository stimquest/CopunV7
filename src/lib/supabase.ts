import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Configuration optimisée pour les performances
// Note: Realtime désactivé car non utilisé - économise du compute
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
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
    // Désactiver realtime pour économiser les ressources
    // (pas de subscriptions utilisées dans l'app)
    realtime: {
      params: {
        eventsPerSecond: 0, // Désactivé
      },
    },
  }
)

